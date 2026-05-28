import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/theme/afm_theme.dart';

class NearbyShop {
  final String id;
  final String name;
  final String imageUrl;
  final double latitude;
  final double longitude;
  final double distanceKm;
  final double rating;
  final int reviewCount;
  final bool isVerified;
  final bool isOpen;
  final String hours;
  final List<String> tags;
  final int productCount;

  const NearbyShop({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.latitude,
    required this.longitude,
    required this.distanceKm,
    required this.rating,
    required this.reviewCount,
    required this.isVerified,
    required this.isOpen,
    required this.hours,
    required this.tags,
    required this.productCount,
  });
}

final _mockShops = [
  {'id': 'aanya', 'name': 'Aanya Atelier',   'area': 'Bandra West',  'lat': 19.0596, 'lng': 72.8295, 'verified': true,  'rating': 4.8, 'distance': '1.4 km', 'tags': ['Ethnic', 'Bridal', 'Handloom']},
  {'id': 'mira',  'name': 'Mira Weaves',     'area': 'Khar West',    'lat': 19.0734, 'lng': 72.8262, 'verified': true,  'rating': 4.6, 'distance': '2.1 km', 'tags': ['Sarees', 'Silk']},
  {'id': 'kala',  'name': 'Kala Streetwear', 'area': 'Lokhandwala',  'lat': 19.1276, 'lng': 72.8285, 'verified': false, 'rating': 4.4, 'distance': '2.7 km', 'tags': ['Streetwear', "Men's"]},
  {'id': 'rumi',  'name': 'Rumi Bazaar',     'area': 'Pali Hill',    'lat': 19.0633, 'lng': 72.8362, 'verified': true,  'rating': 4.7, 'distance': '1.9 km', 'tags': ['Western', 'Casual']},
];

class NearbyScreen extends ConsumerStatefulWidget {
  const NearbyScreen({super.key});

  @override
  ConsumerState<NearbyScreen> createState() => _NearbyScreenState();
}

class _NearbyScreenState extends ConsumerState<NearbyScreen> {
  GoogleMapController? _mapController;
  LatLng _center = const LatLng(19.0596, 72.8295);
  bool _locationLoading = true;
  Map<String, dynamic>? _selectedShop;
  String _selectedFilter = 'All';
  final Set<Marker> _markers = {};
  final List<String> _filters = ['All', 'Verified', 'Open Now', 'Within 2 km'];

  @override
  void initState() {
    super.initState();
    _requestLocation();
    _buildMarkers();
  }

  Future<void> _requestLocation() async {
    try {
      final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) setState(() => _locationLoading = false);
        return;
      }
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) setState(() => _locationLoading = false);
          return;
        }
      }
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      if (mounted) {
        setState(() {
          _center = LatLng(pos.latitude, pos.longitude);
          _locationLoading = false;
        });
        _mapController?.animateCamera(CameraUpdate.newLatLngZoom(_center, 14));
      }
    } catch (_) {
      if (mounted) setState(() => _locationLoading = false);
    }
  }

  void _buildMarkers() {
    for (final shop in _mockShops) {
      _markers.add(Marker(
        markerId: MarkerId(shop['id'] as String),
        position: LatLng(shop['lat'] as double, shop['lng'] as double),
        onTap: () => setState(() => _selectedShop = shop),
        infoWindow: InfoWindow(title: shop['name'] as String),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          (shop['verified'] as bool) ? BitmapDescriptor.hueAzure : BitmapDescriptor.hueRose,
        ),
      ));
    }
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfmColors.navy800,
      body: Stack(
        children: [
          Positioned.fill(
            child: GoogleMap(
              onMapCreated: (controller) => setState(() => _mapController = controller),
              initialCameraPosition: CameraPosition(target: _center, zoom: 14),
              markers: _markers,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
              onTap: (_) => setState(() => _selectedShop = null),
            ),
          ),

          // Search bar + filter chips
          Positioned(
            top: 0, left: 0, right: 0,
            child: SafeArea(
              child: Column(
                children: [
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
                  SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _filters.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (_, i) {
                        final active = _filters[i] == _selectedFilter;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedFilter = _filters[i]),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: active ? AfmColors.magenta600 : Colors.white.withValues(alpha: 0.92),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(_filters[i], style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w600,
                              color: active ? Colors.white : AfmColors.navy800,
                            )),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Location FAB
          Positioned(
            right: 16,
            bottom: _selectedShop != null ? 220 : 100,
            child: FloatingActionButton.small(
              heroTag: 'locate_nearby',
              onPressed: _requestLocation,
              backgroundColor: Colors.white,
              child: _locationLoading
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AfmColors.navy800))
                  : const Icon(Icons.my_location, color: AfmColors.navy800, size: 20),
            ),
          ),

          // Selected shop card
          if (_selectedShop != null)
            Positioned(
              bottom: 0, left: 0, right: 0,
              child: SafeArea(
                child: _ShopInfoCard(
                  shop: _selectedShop!,
                  onClose: () => setState(() => _selectedShop = null),
                  onVisit: () => Navigator.of(context).pushNamed('/shop/${_selectedShop!['id']}'),
                ),
              ),
            ),

          // List button
          if (_selectedShop == null)
            Positioned(
              bottom: 16, left: 0, right: 0,
              child: SafeArea(
                child: Center(
                  child: GestureDetector(
                    onTap: () => _showShopListSheet(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: AfmColors.navy800,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 12)],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.list, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
                          Text('${_mockShops.length} boutiques nearby',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
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

  void _showShopListSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
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
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Text('Nearby Boutiques', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AfmColors.navy800, fontFamily: 'PlayfairDisplay')),
                    const Spacer(),
                    Text('${_mockShops.length} found', style: const TextStyle(fontSize: 13, color: Color(0xFF8896A5))),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: ListView.builder(
                  controller: controller,
                  itemCount: _mockShops.length,
                  itemBuilder: (_, i) {
                    final s = _mockShops[i];
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: CircleAvatar(
                        backgroundColor: (s['verified'] as bool) ? const Color(0xFF1DA1F2) : AfmColors.magenta600,
                        child: Text((s['name'] as String)[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                      title: Row(
                        children: [
                          Text(s['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          if (s['verified'] as bool) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.verified, color: Color(0xFF1DA1F2), size: 14),
                          ],
                        ],
                      ),
                      subtitle: Text('${s['area']} · ${s['distance']} · ★ ${s['rating']}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF8896A5)),
                      onTap: () {
                        Navigator.pop(context);
                        setState(() {
                          _selectedShop = s;
                          _mapController?.animateCamera(CameraUpdate.newLatLngZoom(
                            LatLng(s['lat'] as double, s['lng'] as double), 16,
                          ));
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

class _ShopInfoCard extends StatelessWidget {
  final Map<String, dynamic> shop;
  final VoidCallback onClose;
  final VoidCallback onVisit;
  const _ShopInfoCard({required this.shop, required this.onClose, required this.onVisit});

  @override
  Widget build(BuildContext context) {
    final tags = (shop['tags'] as List).cast<String>();
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 20)],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(shop['name'] as String, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AfmColors.navy800)),
                        if (shop['verified'] as bool) ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.verified, color: Color(0xFF1DA1F2), size: 16),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text('${shop['area']} · ${shop['distance']} · ★ ${shop['rating']}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                  ],
                ),
              ),
              IconButton(onPressed: onClose, icon: const Icon(Icons.close, size: 20, color: Color(0xFF8896A5))),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            children: tags.map((t) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(color: const Color(0xFFF0F4FF), borderRadius: BorderRadius.circular(12)),
              child: Text(t, style: const TextStyle(fontSize: 11, color: AfmColors.navy800, fontWeight: FontWeight.w500)),
            )).toList(),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onVisit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AfmColors.magenta600,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Visit Boutique →', style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }
}
