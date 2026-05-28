import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/features/nearby/nearby_screen.dart';

// ---------------------------------------------------------------------------
// Sample product model (reused from shop context)
// ---------------------------------------------------------------------------

class _ShopProduct {
  final String id, name, imageUrl;
  final double price;
  const _ShopProduct({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
  });
}

class _ShopReview {
  final String reviewer, text, date;
  final double rating;
  const _ShopReview({
    required this.reviewer,
    required this.text,
    required this.date,
    required this.rating,
  });
}

// ---------------------------------------------------------------------------
// ShopDetailScreen
// ---------------------------------------------------------------------------

class ShopDetailScreen extends StatefulWidget {
  final String shopId;

  const ShopDetailScreen({super.key, required this.shopId});

  @override
  State<ShopDetailScreen> createState() => _ShopDetailScreenState();
}

class _ShopDetailScreenState extends State<ShopDetailScreen> {
  // TODO: fetch shop data via ApiService.instance.getShopById(widget.shopId)
  late NearbyShop _shop;

  final List<_ShopProduct> _products = const [
    _ShopProduct(id: 'p1', name: 'Floral Silk Kurta', imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300', price: 2499),
    _ShopProduct(id: 'p2', name: 'Embroidered Dupatta', imageUrl: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=300', price: 899),
    _ShopProduct(id: 'p3', name: 'Cotton Palazzo Set', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300', price: 1599),
    _ShopProduct(id: 'p4', name: 'Designer Anarkali', imageUrl: 'https://images.unsplash.com/photo-1631216516726-e98a4bbf64f2?w=300', price: 3299),
    _ShopProduct(id: 'p5', name: 'Banarasi Silk Saree', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300', price: 4999),
    _ShopProduct(id: 'p6', name: 'Printed Kurti', imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300', price: 799),
  ];

  final List<_ShopReview> _reviews = const [
    _ShopReview(reviewer: 'Priya M.', text: 'Amazing collection! The fabrics are beautiful and the staff is very helpful.', date: '2 days ago', rating: 5.0),
    _ShopReview(reviewer: 'Ananya S.', text: 'Visited for my sister\'s wedding. Found the perfect lehenga here. Highly recommend!', date: '1 week ago', rating: 4.5),
    _ShopReview(reviewer: 'Sneha K.', text: 'Good variety of ethnic wear. Prices are reasonable for the quality.', date: '2 weeks ago', rating: 4.0),
  ];

  @override
  void initState() {
    super.initState();
    // Default to shop1 if not found
    _shop = const NearbyShop(
      id: 'shop1',
      name: 'Zara Boutique',
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
      latitude: 19.0596, longitude: 72.8295,
      distanceKm: 0.3, rating: 4.8, reviewCount: 128,
      isVerified: true, isOpen: true, hours: '10:00 AM – 9:00 PM',
      tags: ['Ethnic', 'Bridal', 'Designer'],
      productCount: 84,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfmColors.neutral50,
      body: CustomScrollView(
        slivers: [
          // Hero image sliver app bar
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AfmColors.navy800,
            leading: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black38,
                borderRadius: BorderRadius.circular(10),
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: Colors.white),
                onPressed: () => context.pop(),
              ),
            ),
            actions: [
              Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black38,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: IconButton(
                  icon: const Icon(Icons.share_outlined, size: 20, color: Colors.white),
                  onPressed: _shareShop,
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Hero(
                tag: 'shop_image_${_shop.id}',
                child: CachedNetworkImage(
                  imageUrl: _shop.imageUrl,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: AfmColors.neutral200),
                  errorWidget: (_, __, ___) => Container(
                    color: AfmColors.neutral200,
                    child: const Icon(Icons.store_outlined, size: 60, color: AfmColors.neutral500),
                  ),
                ),
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Shop header
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name and verified
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              _shop.name,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: AfmColors.navy800,
                              ),
                            ),
                          ),
                          if (_shop.isVerified)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AfmColors.verified500),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.verified, size: 14, color: AfmColors.verified500),
                                  SizedBox(width: 4),
                                  Text(
                                    'Verified',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: AfmColors.verified500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Rating and distance row
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 18, color: AfmColors.gold500),
                          const SizedBox(width: 4),
                          Text(
                            '${_shop.rating}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AfmColors.navy800,
                            ),
                          ),
                          Text(
                            ' (${_shop.reviewCount} reviews)',
                            style: const TextStyle(fontSize: 13, color: AfmColors.neutral500),
                          ),
                          const SizedBox(width: 12),
                          const Icon(Icons.location_on_outlined, size: 16, color: AfmColors.magenta600),
                          const SizedBox(width: 4),
                          Text(
                            '${_shop.distanceKm} km away',
                            style: const TextStyle(fontSize: 13, color: AfmColors.neutral700),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Tags
                      Wrap(
                        spacing: 6,
                        children: _shop.tags.map((tag) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AfmColors.magenta100,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            tag,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AfmColors.magenta600,
                            ),
                          ),
                        )).toList(),
                      ),
                      const SizedBox(height: 12),

                      // Open/Closed status
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: _shop.isOpen
                                  ? const Color(0xFFF0FDF4)
                                  : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 8, height: 8,
                                  decoration: BoxDecoration(
                                    color: _shop.isOpen
                                        ? const Color(0xFF16A34A)
                                        : Colors.red[600],
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  _shop.isOpen ? 'Open Now' : 'Closed',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: _shop.isOpen
                                        ? const Color(0xFF16A34A)
                                        : Colors.red[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Icon(Icons.access_time, size: 14, color: AfmColors.neutral500),
                          const SizedBox(width: 4),
                          Text(
                            _shop.hours,
                            style: const TextStyle(fontSize: 12, color: AfmColors.neutral700),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // Contact buttons
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: _ActionButton(
                          icon: Icons.call_outlined,
                          label: 'Call',
                          color: const Color(0xFF16A34A),
                          onTap: _callShop,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _ActionButton(
                          icon: Icons.directions_outlined,
                          label: 'Directions',
                          color: AfmColors.navy800,
                          onTap: _getDirections,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _ActionButton(
                          icon: Icons.share_outlined,
                          label: 'Share',
                          color: AfmColors.magenta600,
                          onTap: _shareShop,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // Products section
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Products',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AfmColors.navy800,
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.push('/products?shop=${_shop.id}'),
                        child: const Text(
                          'View all',
                          style: TextStyle(
                            color: AfmColors.magenta600,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                GridView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.75,
                  ),
                  itemCount: _products.length,
                  itemBuilder: (_, i) => _ProductGridCard(
                    product: _products[i],
                    onTap: () => context.push('/product/${_products[i].id}'),
                  ),
                ),

                const SizedBox(height: 20),

                // Reviews section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Customer Reviews',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AfmColors.navy800,
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 16, color: AfmColors.gold500),
                          const SizedBox(width: 4),
                          Text(
                            '${_shop.rating} · ${_shop.reviewCount}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AfmColors.neutral700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: _reviews.map((r) => _ReviewCard(review: r)).toList(),
                  ),
                ),

                const SizedBox(height: 20),

                // Map preview
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'Location',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AfmColors.navy800,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  height: 180,
                  clipBehavior: Clip.hardEdge,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AfmColors.neutral200),
                  ),
                  child: FlutterMap(
                    options: MapOptions(
                      initialCenter: LatLng(_shop.latitude, _shop.longitude),
                      initialZoom: 15,
                      interactionOptions: const InteractionOptions(
                        flags: InteractiveFlag.none,
                      ),
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.apnafashionmart.app',
                      ),
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: LatLng(_shop.latitude, _shop.longitude),
                            width: 40,
                            height: 40,
                            child: Container(
                              decoration: BoxDecoration(
                                color: AfmColors.magenta600,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: AfmColors.magenta600.withValues(alpha: 0.4),
                                    blurRadius: 8,
                                  ),
                                ],
                              ),
                              child: const Icon(Icons.store_outlined, color: Colors.white, size: 20),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 100),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 16,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SizedBox(
            height: 52,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AfmColors.navy800, Color(0xFF6D1B5C), AfmColors.magenta600],
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: ElevatedButton.icon(
                onPressed: _bookTryOnAppointment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.event_available_outlined, color: Colors.white, size: 20),
                label: const Text(
                  'Book Try-on Appointment',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _callShop() async {
    final uri = Uri.parse('tel:+919876543210');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _getDirections() async {
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${_shop.latitude},${_shop.longitude}',
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _shareShop() {
    Share.share(
      'Check out ${_shop.name} on Apna Fashion Mart!\n'
      '${_shop.tags.join(', ')} · ${_shop.rating}★ · ${_shop.distanceKm} km away\n'
      'https://apnafashionmart.in/shop/${_shop.id}',
    );
  }

  void _bookTryOnAppointment() {
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    TimeOfDay selectedTime = const TimeOfDay(hour: 11, minute: 0);

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.event_available_outlined, color: AfmColors.magenta600),
              SizedBox(width: 10),
              Text(
                'Book Try-on',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AfmColors.navy800,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${_shop.name}',
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  color: AfmColors.neutral700,
                ),
              ),
              const SizedBox(height: 16),
              // Date picker
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AfmColors.magenta100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.calendar_today_outlined, color: AfmColors.magenta600, size: 20),
                ),
                title: const Text('Date', style: TextStyle(fontSize: 12, color: AfmColors.neutral500)),
                subtitle: Text(
                  '${selectedDate.day}/${selectedDate.month}/${selectedDate.year}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AfmColors.navy800,
                    fontSize: 14,
                  ),
                ),
                trailing: const Icon(Icons.chevron_right, color: AfmColors.neutral500),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 30)),
                  );
                  if (picked != null) {
                    setDialogState(() => selectedDate = picked);
                  }
                },
              ),
              const Divider(color: AfmColors.neutral200),
              // Time picker
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AfmColors.magenta100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.access_time_outlined, color: AfmColors.magenta600, size: 20),
                ),
                title: const Text('Time', style: TextStyle(fontSize: 12, color: AfmColors.neutral500)),
                subtitle: Text(
                  selectedTime.format(context),
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AfmColors.navy800,
                    fontSize: 14,
                  ),
                ),
                trailing: const Icon(Icons.chevron_right, color: AfmColors.neutral500),
                onTap: () async {
                  final picked = await showTimePicker(
                    context: context,
                    initialTime: selectedTime,
                  );
                  if (picked != null) {
                    setDialogState(() => selectedTime = picked);
                  }
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AfmColors.neutral500)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Appointment requested for ${selectedDate.day}/${selectedDate.month} at ${selectedTime.format(context)}',
                    ),
                    backgroundColor: const Color(0xFF16A34A),
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AfmColors.magenta600,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Confirm'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Sub-widgets
// ---------------------------------------------------------------------------

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductGridCard extends StatelessWidget {
  final _ShopProduct product;
  final VoidCallback onTap;

  const _ProductGridCard({required this.product, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: CachedNetworkImage(
                  imageUrl: product.imageUrl,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: AfmColors.neutral100),
                  errorWidget: (_, __, ___) => Container(
                    color: AfmColors.neutral100,
                    child: const Icon(Icons.image_outlined, color: AfmColors.neutral500),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AfmColors.navy800,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '₹${product.price.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AfmColors.magenta600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final _ShopReview review;
  const _ReviewCard({required this.review});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AfmColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AfmColors.magenta100,
                child: Text(
                  review.reviewer[0],
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AfmColors.magenta600,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review.reviewer,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AfmColors.navy800,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      review.date,
                      style: const TextStyle(fontSize: 11, color: AfmColors.neutral500),
                    ),
                  ],
                ),
              ),
              Row(
                children: List.generate(5, (i) => Icon(
                  Icons.star_rounded,
                  size: 14,
                  color: i < review.rating.round()
                      ? AfmColors.gold500
                      : AfmColors.neutral200,
                )),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            review.text,
            style: const TextStyle(
              fontSize: 13,
              color: AfmColors.neutral700,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}
