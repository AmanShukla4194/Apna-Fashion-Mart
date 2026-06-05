import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';

// ─── model ───────────────────────────────────────────────────────────────────

class NearbyShop {
  final String id;
  final String name;
  final String address;
  final LatLng position;
  final double distanceKm;
  final String? hours;
  final String? phone;
  final String? website;
  final String? shopType;

  const NearbyShop({
    required this.id,
    required this.name,
    required this.address,
    required this.position,
    required this.distanceKm,
    this.hours,
    this.phone,
    this.website,
    this.shopType,
  });

  factory NearbyShop.fromJson(Map<String, dynamic> json) => NearbyShop(
        id:          json['id'] as String,
        name:        json['name'] as String? ?? 'Fashion Store',
        address:     json['address'] as String? ?? '',
        position:    LatLng(
          (json['lat'] as num).toDouble(),
          (json['lng'] as num).toDouble(),
        ),
        distanceKm:  (json['distanceKm'] as num?)?.toDouble() ?? 0,
        hours:       json['hours'] as String?,
        phone:       json['phone'] as String?,
        website:     json['website'] as String?,
        shopType:    json['shopType'] as String?,
      );
}

// ─── constants ────────────────────────────────────────────────────────────────

const _appBaseUrl  = 'https://apnafashionmart.com';
const _navy800     = Color(0xFF001F3F);
const _magenta600  = Color(0xFFFF1493);
const _defaultPos  = LatLng(19.0596, 72.8295); // Mumbai fallback

// ─── screen ──────────────────────────────────────────────────────────────────

class NearbyScreen extends ConsumerStatefulWidget {
  const NearbyScreen({super.key});

  @override
  ConsumerState<NearbyScreen> createState() => _NearbyScreenState();
}

class _NearbyScreenState extends ConsumerState<NearbyScreen> {
  final _mapController  = MapController();
  LatLng _center        = _defaultPos;
  bool _locationLoading = true;

  List<NearbyShop> _shops   = [];
  bool _shopsLoading        = false;
  String? _shopsError;
  NearbyShop? _selectedShop;

  // filters
  int  _radiusKm = 5;
  bool _openNow  = false;

  final _dio = Dio();

  @override
  void initState() {
    super.initState();
    _requestLocation();
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  // ── location ──────────────────────────────────────────────────────────────

  Future<void> _requestLocation() async {
    setState(() => _locationLoading = true);
    try {
      final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) throw Exception('Location services disabled');

      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (perm == LocationPermission.denied) throw Exception('Permission denied');
      }
      if (perm == LocationPermission.deniedForever) throw Exception('Permission permanently denied');

      final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);
      if (!mounted) return;

      setState(() {
        _center          = LatLng(pos.latitude, pos.longitude);
        _locationLoading = false;
      });
      _mapController.move(_center, 14);
      _fetchShops();
    } catch (_) {
      if (mounted) setState(() => _locationLoading = false);
      _fetchShops();
    }
  }

  // ── fetch ─────────────────────────────────────────────────────────────────

  Future<void> _fetchShops() async {
    setState(() { _shopsLoading = true; _shopsError = null; });
    try {
      final resp = await _dio.get(
        '$_appBaseUrl/api/nearby-shops',
        queryParameters: {
          'lat':     _center.latitude,
          'lng':     _center.longitude,
          'radius':  _radiusKm,
          'openNow': _openNow,
        },
        options: Options(receiveTimeout: const Duration(seconds: 30)),
      );
      if (resp.statusCode != 200) throw Exception('Server error ${resp.statusCode}');
      final raw = (resp.data['shops'] as List? ?? []).cast<Map<String, dynamic>>();
      if (!mounted) return;
      setState(() { _shops = raw.map(NearbyShop.fromJson).toList(); _shopsLoading = false; });
    } catch (e) {
      if (mounted) setState(() { _shopsError = e.toString(); _shopsLoading = false; });
    }
  }

  // ── sort ─────────────────────────────────────────────────────────────────

  List<NearbyShop> get _sortedShops {
    final list = List<NearbyShop>.from(_shops);
    list.sort((a, b) => a.distanceKm.compareTo(b.distanceKm)); // always nearest for OSM
    return list;
  }

  // ── filter chip ───────────────────────────────────────────────────────────

  Widget _chip(String label, bool active, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      decoration: BoxDecoration(
        color: active ? _magenta600 : Colors.white.withValues(alpha: 0.93),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 4)],
      ),
      child: Text(label, style: TextStyle(
        fontSize: 12, fontWeight: FontWeight.w600,
        color: active ? Colors.white : _navy800,
      )),
    ),
  );

  // ── build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final shops = _sortedShops;

    return Scaffold(
      backgroundColor: _navy800,
      body: Stack(
        children: [
          // ── MAP (OpenStreetMap via flutter_map) ──────────────────────────
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _center,
                initialZoom: 14,
                onTap: (_, __) => setState(() => _selectedShop = null),
              ),
              children: [
                // OSM tile layer — free, no API key
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.apnafashionmart.app',
                  maxZoom: 19,
                ),
                // Shop markers
                MarkerLayer(
                  markers: [
                    // User location
                    Marker(
                      point: _center,
                      width: 20, height: 20,
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF4285F4),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [BoxShadow(color: Colors.blue.withValues(alpha: 0.4), blurRadius: 8)],
                        ),
                      ),
                    ),
                    // Shop markers
                    ...shops.map((shop) => Marker(
                      point: shop.position,
                      width: 26, height: 26,
                      child: GestureDetector(
                        onTap: () {
                          setState(() => _selectedShop = shop);
                          _mapController.move(shop.position, 16);
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: _magenta600,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2.5),
                            boxShadow: [BoxShadow(color: _magenta600.withValues(alpha: 0.45), blurRadius: 8)],
                          ),
                          child: const Icon(Icons.store, color: Colors.white, size: 12),
                        ),
                      ),
                    )),
                  ],
                ),
                // OSM attribution (required by OSM license)
                const SimpleAttributionWidget(
                  source: Text('OpenStreetMap contributors'),
                ),
              ],
            ),
          ),

          // ── TOP OVERLAY ──────────────────────────────────────────────────
          Positioned(
            top: 0, left: 0, right: 0,
            child: SafeArea(
              child: Column(
                children: [
                  // Search bar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 12)],
                      ),
                      child: const TextField(
                        decoration: InputDecoration(
                          hintText: 'Search boutiques, areas…',
                          hintStyle: TextStyle(color: Color(0xFF8896A5), fontSize: 14),
                          prefixIcon: Icon(Icons.search, color: Color(0xFF8896A5), size: 20),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Filter chips
                  SizedBox(
                    height: 38,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: [
                        _chip('Open Now', _openNow, () {
                          setState(() => _openNow = !_openNow);
                          _fetchShops();
                        }),
                        const SizedBox(width: 8),
                        for (final km in [1, 3, 5, 10, 25]) ...[
                          _chip('$km km', _radiusKm == km, () {
                            setState(() => _radiusKm = km);
                            _fetchShops();
                          }),
                          const SizedBox(width: 8),
                        ],
                      ],
                    ),
                  ),
                  // Loading / error banner
                  if (_shopsLoading)
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 6, 16, 0),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(width: 15, height: 15, child: CircularProgressIndicator(strokeWidth: 2, color: _magenta600)),
                          SizedBox(width: 10),
                          Text('Searching nearby shops…', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: _navy800)),
                        ],
                      ),
                    ),
                  if (_shopsError != null)
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 6, 16, 0),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                      decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 16),
                          const SizedBox(width: 8),
                          const Text('Could not load shops', style: TextStyle(fontSize: 13, color: Colors.red)),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: _fetchShops,
                            child: const Text('Retry', style: TextStyle(fontSize: 13, color: _magenta600, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),

          // ── MY LOCATION FAB ───────────────────────────────────────────────
          Positioned(
            right: 16,
            bottom: _selectedShop != null ? 270 : 100,
            child: FloatingActionButton.small(
              heroTag: 'locate_nearby',
              onPressed: _requestLocation,
              backgroundColor: Colors.white,
              child: _locationLoading
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: _navy800))
                  : const Icon(Icons.my_location, color: _navy800, size: 20),
            ),
          ),

          // ── SELECTED SHOP CARD ────────────────────────────────────────────
          if (_selectedShop != null)
            Positioned(
              bottom: 0, left: 0, right: 0,
              child: SafeArea(
                child: _ShopCard(
                  shop: _selectedShop!,
                  onClose: () => setState(() => _selectedShop = null),
                  userPosition: _center,
                ),
              ),
            ),

          // ── LIST BUTTON ───────────────────────────────────────────────────
          if (_selectedShop == null)
            Positioned(
              bottom: 16, left: 0, right: 0,
              child: SafeArea(
                child: Center(
                  child: GestureDetector(
                    onTap: () => _showListSheet(context, shops),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: _navy800,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 12)],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.list, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            '${shops.length} fashion shops nearby',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ── bottom sheet ──────────────────────────────────────────────────────────

  void _showListSheet(BuildContext context, List<NearbyShop> shops) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.55,
        maxChildSize: 0.92,
        minChildSize: 0.3,
        builder: (_, controller) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 8),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Row(
                  children: [
                    const Text('Nearby Fashion Shops', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _navy800)),
                    const Spacer(),
                    Text('${shops.length} found', style: const TextStyle(fontSize: 13, color: Color(0xFF8896A5))),
                  ],
                ),
              ),
              const Divider(height: 1),
              if (shops.isEmpty)
                const Expanded(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('🔍', style: TextStyle(fontSize: 40)),
                        SizedBox(height: 12),
                        Text('No shops found nearby', style: TextStyle(fontWeight: FontWeight.w600, color: _navy800)),
                        SizedBox(height: 4),
                        Text('Try increasing the search radius', style: TextStyle(fontSize: 13, color: Color(0xFF8896A5))),
                      ],
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.builder(
                    controller: controller,
                    itemCount: shops.length,
                    itemBuilder: (_, i) {
                      final s = shops[i];
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        leading: CircleAvatar(
                          backgroundColor: _magenta600,
                          child: Text(s.name[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                        title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text(
                          '${s.distanceKm} km away${s.shopType != null ? ' · ${s.shopType}' : ''}',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5)),
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF8896A5)),
                        onTap: () {
                          Navigator.pop(context);
                          setState(() {
                            _selectedShop = s;
                            _mapController.move(s.position, 16);
                          });
                        },
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── shop detail card ─────────────────────────────────────────────────────────

class _ShopCard extends StatelessWidget {
  final NearbyShop shop;
  final VoidCallback onClose;
  final LatLng userPosition;

  const _ShopCard({required this.shop, required this.onClose, required this.userPosition});

  Future<void> _openDirections() async {
    final uri = Uri.parse(
      'https://www.openstreetmap.org/directions'
      '?from=${userPosition.latitude},${userPosition.longitude}'
      '&to=${shop.position.latitude},${shop.position.longitude}',
    );
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 20)],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(shop.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _navy800)),
                ),
                GestureDetector(onTap: onClose, child: const Icon(Icons.close, size: 20, color: Color(0xFF8896A5))),
              ],
            ),
            if (shop.address.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(shop.address, style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: _magenta600),
                Text(' ${shop.distanceKm} km away', style: const TextStyle(fontSize: 13, color: _navy800)),
                if (shop.shopType != null) ...[
                  const SizedBox(width: 10),
                  const Icon(Icons.storefront_outlined, size: 14, color: Color(0xFF8896A5)),
                  Text(' ${shop.shopType}', style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                ],
              ],
            ),
            if (shop.hours != null) ...[
              const SizedBox(height: 4),
              Row(children: [
                const Icon(Icons.access_time, size: 13, color: Color(0xFF8896A5)),
                const SizedBox(width: 4),
                Expanded(child: Text(shop.hours!, style: const TextStyle(fontSize: 11, color: Color(0xFF8896A5)))),
              ]),
            ],
            if (shop.phone != null) ...[
              const SizedBox(height: 4),
              Row(children: [
                const Icon(Icons.phone_outlined, size: 13, color: Color(0xFF8896A5)),
                const SizedBox(width: 4),
                Text(shop.phone!, style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
              ]),
            ],
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _openDirections,
                icon: const Icon(Icons.directions, size: 16),
                label: const Text('Get Directions'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _magenta600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
