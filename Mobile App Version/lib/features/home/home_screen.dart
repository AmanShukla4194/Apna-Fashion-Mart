import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:dio/dio.dart';
import 'package:apna_fashion_mart/core/providers/cart_provider.dart';
import 'package:apna_fashion_mart/core/constants/app_constants.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final PageController _bannerController = PageController();
  int _currentBannerIndex = 0;
  Timer? _bannerTimer;
  Timer? _flashSaleTimer;
  Duration _flashSaleRemaining = const Duration(hours: 3, minutes: 47, seconds: 22);
  String _locationLabel = 'Detecting location…';

  static const Color _navy800 = Color(0xFF001F3F);
  static const Color _magenta600 = Color(0xFFFF1493);
  static const Color _magenta100 = Color(0xFFFFEDF7);
  static const Color _gold500 = Color(0xFFC9A24A);
  static const Color _neutral50 = Color(0xFFF8F9FB);
  static const Color _neutral100 = Color(0xFFF1F3F6);
  static const Color _neutral500 = Color(0xFF6B7280);

  // Fallback data shown while API loads or if API has no results yet
  static const List<Map<String, dynamic>> _fallbackProducts = [
    {'id': '1', 'name': 'Banarasi Silk Saree', 'store': 'Aanya Atelier', 'price': 4899, 'oldPrice': 6200, 'rating': 4.8},
    {'id': '2', 'name': 'Anarkali Suit Set', 'store': 'Riya Collections', 'price': 2199, 'rating': 4.6},
    {'id': '3', 'name': 'Embroidered Lehenga', 'store': 'Mira Weaves', 'price': 8499, 'oldPrice': 11000, 'rating': 4.9},
    {'id': '4', 'name': 'Cotton Kurti Combo', 'store': 'Rang Studio', 'price': 1299, 'rating': 4.4},
    {'id': '5', 'name': 'Chanderi Dupatta', 'store': 'Weaves & Co', 'price': 899, 'rating': 4.7},
    {'id': '6', 'name': 'Silk Coord Set', 'store': 'Studio Ekta', 'price': 3299, 'oldPrice': 4500, 'rating': 4.5},
  ];

  static const List<Map<String, dynamic>> _fallbackShops = [
    {'id': 's1', 'name': 'Aanya Atelier', 'rating': 4.8, 'tags': ['Sarees', 'Bridal'], 'reviews': 214},
    {'id': 's2', 'name': 'Riya Collections', 'rating': 4.6, 'tags': ['Suits', 'Ethnic'], 'reviews': 187},
    {'id': 's3', 'name': 'Mira Weaves', 'rating': 4.9, 'tags': ['Lehengas', 'Handloom'], 'reviews': 302},
    {'id': 's4', 'name': 'Studio Ekta', 'rating': 4.5, 'tags': ['Western', 'Casual'], 'reviews': 156},
  ];

  List<Map<String, dynamic>> _products = List.from(_fallbackProducts);
  List<Map<String, dynamic>> _shops = List.from(_fallbackShops);

  static const List<Map<String, String>> _categories = [
    {'label': 'Sarees', 'icon': '🥻'},
    {'label': 'Kurtas', 'icon': '👗'},
    {'label': 'Lehengas', 'icon': '💃'},
    {'label': 'Tops', 'icon': '👚'},
    {'label': 'Jeans', 'icon': '👖'},
    {'label': 'Ethnic Sets', 'icon': '🪡'},
    {'label': 'Western', 'icon': '✨'},
    {'label': 'Bridal', 'icon': '👰'},
    {'label': 'Kids', 'icon': '🎀'},
    {'label': 'Men', 'icon': '👔'},
  ];

  static const List<Map<String, dynamic>> _banners = [
    {
      'title': 'New Season Arrivals',
      'subtitle': 'Summer Edit 2026',
      'cta': 'Shop Now',
      'colors': [Color(0xFFFF1493), Color(0xFF9D174D)],
      'route': '/products?category=new',
    },
    {
      'title': 'Verified Boutiques Near You',
      'subtitle': 'Discover curated local stores',
      'cta': 'Explore',
      'colors': [Color(0xFF001F3F), Color(0xFF6D1B5C)],
      'route': '/nearby',
    },
    {
      'title': 'Same-Day Delivery',
      'subtitle': 'Free Returns · Secure Payment',
      'cta': 'Learn More',
      'colors': [Color(0xFFC9A24A), Color(0xFF92630F)],
      'route': '/products',
    },
  ];

  @override
  void initState() {
    super.initState();
    _startBannerAutoPlay();
    _startFlashSaleTimer();
    _fetchLocation();
    _fetchHomeData();
  }

  Future<void> _fetchHomeData() async {
    try {
      final dio = Dio();
      final results = await Future.wait([
        dio.get('${AppConstants.apiBaseUrl}/products?limit=8'),
        dio.get('${AppConstants.apiBaseUrl}/shops?limit=6'),
      ]);

      final productsData = results[0].data;
      final shopsData = results[1].data;

      final List rawProducts = productsData['products'] ?? [];
      final List rawShops = shopsData['shops'] ?? [];

      if (!mounted) return;
      setState(() {
        if (rawProducts.isNotEmpty) {
          _products = rawProducts.map<Map<String, dynamic>>((p) => {
            'id': p['id'] ?? '',
            'name': p['name'] ?? '',
            'store': p['shop_name'] ?? 'Local Boutique',
            'price': p['price'] ?? 0,
            'oldPrice': p['compare_price'],
            'rating': double.tryParse(p['avg_rating']?.toString() ?? '0') ?? 0.0,
            'image': (p['images'] as List?)?.isNotEmpty == true ? p['images'][0] : null,
          }).toList();
        }
        if (rawShops.isNotEmpty) {
          _shops = rawShops.map<Map<String, dynamic>>((s) => {
            'id': s['id'] ?? '',
            'name': s['name'] ?? '',
            'rating': double.tryParse(s['avg_rating']?.toString() ?? '0') ?? 0.0,
            'tags': List<String>.from(s['tags'] ?? []),
            'reviews': s['review_count'] ?? 0,
            'logoUrl': s['logo_url'],
            'city': s['city'] ?? '',
          }).toList();
        }
      });
    } catch (_) {
      // Keep fallback data on error
    }
  }

  Future<void> _fetchLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever ||
          permission == LocationPermission.denied) {
        if (mounted) setState(() => _locationLabel = 'Set your location');
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.low,
      );
      final res = await Dio().get(
        'https://nominatim.openstreetmap.org/reverse',
        queryParameters: {
          'lat': pos.latitude,
          'lon': pos.longitude,
          'format': 'json',
        },
        options: Options(headers: {'Accept-Language': 'en'}),
      );
      final address = (res.data['address'] as Map<String, dynamic>?) ?? {};
      final area = (address['suburb'] ?? address['neighbourhood'] ??
          address['village'] ?? address['town'] ?? '') as String;
      final city = (address['city'] ?? address['town'] ??
          address['county'] ?? '') as String;
      final pincode = (address['postcode'] ?? '') as String;
      final parts = [area, city].where((s) => s.isNotEmpty).join(', ');
      final label = (parts + (pincode.isNotEmpty ? ' $pincode' : '')).trim();
      if (mounted) setState(() => _locationLabel = label.isNotEmpty ? label : 'Location detected');
    } catch (_) {
      if (mounted) setState(() => _locationLabel = 'Set your location');
    }
  }

  void _startBannerAutoPlay() {
    _bannerTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (_bannerController.hasClients) {
        final next = (_currentBannerIndex + 1) % _banners.length;
        _bannerController.animateToPage(
          next,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  void _startFlashSaleTimer() {
    _flashSaleTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_flashSaleRemaining.inSeconds <= 0) {
        _flashSaleTimer?.cancel();
        return;
      }
      setState(() {
        _flashSaleRemaining =
            _flashSaleRemaining - const Duration(seconds: 1);
      });
    });
  }

  @override
  void dispose() {
    _bannerTimer?.cancel();
    _flashSaleTimer?.cancel();
    _bannerController.dispose();
    super.dispose();
  }

  String _formatCountdown(Duration d) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    return '${twoDigits(d.inHours)}:${twoDigits(d.inMinutes.remainder(60))}:${twoDigits(d.inSeconds.remainder(60))}';
  }

  @override
  Widget build(BuildContext context) {
    final cartCount = ref.watch(cartCountProvider);

    return Scaffold(
      backgroundColor: _neutral50,
      body: CustomScrollView(
        slivers: [
          // SliverAppBar
          SliverAppBar(
            expandedHeight: 120,
            pinned: true,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_navy800, Color(0xFF6D1B5C), _magenta600],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                    color: _gold500.withValues(alpha: 0.6),
                                    width: 1),
                              ),
                              child: const Text(
                                'AFM',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  letterSpacing: 2,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Apna Fashion Mart',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 15,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                  Text(
                                    'Your neighbourhood, in vogue.',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 11,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.search_rounded,
                                  color: Colors.white),
                              onPressed: () => context.push('/search'),
                            ),
                            IconButton(
                              icon: const Icon(
                                  Icons.notifications_outlined,
                                  color: Colors.white),
                              onPressed: () =>
                                  context.push('/account/notifications'),
                            ),
                            Stack(
                              children: [
                                IconButton(
                                  icon: const Icon(
                                      Icons.shopping_bag_outlined,
                                      color: Colors.white),
                                  onPressed: () => context.push('/cart'),
                                ),
                                if (cartCount > 0)
                                  Positioned(
                                    right: 6,
                                    top: 6,
                                    child: Container(
                                      width: 16,
                                      height: 16,
                                      decoration: BoxDecoration(
                                        color: _gold500,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                            color: Colors.white,
                                            width: 1.5),
                                      ),
                                      child: Center(
                                        child: Text(
                                          cartCount > 9
                                              ? '9+'
                                              : '$cartCount',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 9,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Body content as sliver list
          SliverList(
            delegate: SliverChildListDelegate([
              // Categories Row
              _buildCategoriesRow(),
              // Banner Carousel
              _buildBannerCarousel(),
              // Flash Sale
              _buildFlashSaleSection(),
              // Trending Near You
              _buildTrendingSection(),
              // Verified Boutiques
              _buildBoutiquesSection(),
              const SizedBox(height: 100),
            ]),
          ),
        ],
      ),
      // Apna AI FAB
      floatingActionButton: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [_navy800, _magenta600],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: _magenta600.withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: FloatingActionButton(
          backgroundColor: Colors.transparent,
          elevation: 0,
          onPressed: () => context.push('/chatbot'),
          tooltip: 'Apna AI',
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 20),
              Text(
                'AI',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoriesRow() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 20, 16, 12),
          child: Text(
            'Shop by Category',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: _navy800,
              letterSpacing: -0.2,
            ),
          ),
        ),
        SizedBox(
          height: 92,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final cat = _categories[index];
              return GestureDetector(
                onTap: () => context.push(
                    '/products?category=${Uri.encodeComponent(cat['label']!)}'),
                child: Container(
                  width: 72,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: _magenta100,
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: _magenta600.withValues(alpha: 0.2), width: 1),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            cat['icon']!,
                            style: const TextStyle(fontSize: 22),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cat['label']!,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: _navy800,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildBannerCarousel() {
    return Column(
      children: [
        const SizedBox(height: 16),
        SizedBox(
          height: 180,
          child: PageView.builder(
            controller: _bannerController,
            itemCount: _banners.length,
            onPageChanged: (i) => setState(() => _currentBannerIndex = i),
            itemBuilder: (context, index) {
              final banner = _banners[index];
              final colors = banner['colors'] as List<Color>;
              return GestureDetector(
                onTap: () =>
                    context.push(banner['route'] as String),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: colors,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: colors[0].withValues(alpha: 0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      const Positioned(
                        right: -20,
                        bottom: -20,
                        child: Opacity(
                          opacity: 0.08,
                          child: Icon(
                            Icons.diamond_outlined,
                            size: 160,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              banner['title'] as String,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              banner['subtitle'] as String,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.85),
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.5)),
                              ),
                              child: Text(
                                banner['cta'] as String,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            _banners.length,
            (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: _currentBannerIndex == i ? 20 : 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: _currentBannerIndex == i
                    ? _magenta600
                    : _magenta600.withValues(alpha: 0.25),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFlashSaleSection() {
    return Column(
      children: [
        const SizedBox(height: 28),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(Icons.bolt_rounded, color: _magenta600, size: 20),
              const SizedBox(width: 6),
              const Text(
                'Flash Sale',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: _navy800,
                  letterSpacing: -0.3,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: _navy800,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timer_outlined,
                        color: Colors.white, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      _formatCountdown(_flashSaleRemaining),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        fontFamily: 'monospace',
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 240,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: 4,
            itemBuilder: (context, index) {
              final product = _products[index];
              return _buildFlashProductCard(product);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFlashProductCard(Map<String, dynamic> product) {
    final hasOldPrice = product['oldPrice'] != null;
    final discountPct = hasOldPrice
        ? (((product['oldPrice'] as int) - (product['price'] as int)) /
                (product['oldPrice'] as int) *
                100)
            .round()
        : 0;

    return GestureDetector(
      onTap: () => context.push('/product/${product['id']}'),
      child: Container(
        width: 160,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Container(
                    height: 130,
                    width: double.infinity,
                    color: _neutral100,
                    child: const Icon(Icons.image_outlined,
                        color: Color(0xFFD1D5DB), size: 40),
                  ),
                ),
                if (hasOldPrice)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _magenta600,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '-$discountPct%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] as String,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    product['store'] as String,
                    style: const TextStyle(
                        fontSize: 10, color: _neutral500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(
                        '₹${product['price']}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: _navy800,
                        ),
                      ),
                      if (hasOldPrice) ...[
                        const SizedBox(width: 4),
                        Text(
                          '₹${product['oldPrice']}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: _neutral500,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrendingSection() {
    return Column(
      children: [
        const SizedBox(height: 28),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Text(
                'Trending Near You',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: _navy800,
                  letterSpacing: -0.3,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => context.push('/products'),
                child: const Text(
                  'See all',
                  style: TextStyle(
                    color: _magenta600,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 8,
              childAspectRatio: 0.72,
            ),
            itemCount: _products.length,
            itemBuilder: (context, index) {
              return _buildProductGridCard(_products[index]);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildProductGridCard(Map<String, dynamic> product) {
    final hasOldPrice = product['oldPrice'] != null;
    final discountPct = hasOldPrice
        ? (((product['oldPrice'] as int) - (product['price'] as int)) /
                (product['oldPrice'] as int) *
                100)
            .round()
        : 0;

    return GestureDetector(
      onTap: () => context.push('/product/${product['id']}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(16)),
                    child: Container(
                      width: double.infinity,
                      color: _neutral100,
                      child: const Center(
                        child: Icon(Icons.image_outlined,
                            color: Color(0xFFD1D5DB), size: 44),
                      ),
                    ),
                  ),
                  if (hasOldPrice)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _magenta600,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '-$discountPct%',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.favorite_border_rounded,
                          size: 16, color: _magenta600),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] as String,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    product['store'] as String,
                    style: const TextStyle(
                        fontSize: 10, color: _neutral500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(
                        '₹${product['price']}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: _navy800,
                        ),
                      ),
                      if (hasOldPrice) ...[
                        const SizedBox(width: 4),
                        Text(
                          '₹${product['oldPrice']}',
                          style: const TextStyle(
                            fontSize: 10,
                            color: _neutral500,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          color: _gold500, size: 12),
                      const SizedBox(width: 2),
                      Text(
                        '${product['rating']}',
                        style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: _navy800),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.location_on_outlined,
                          color: _neutral500, size: 10),
                      Text(
                        product['distance'] as String,
                        style: const TextStyle(
                            fontSize: 10, color: _neutral500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBoutiquesSection() {
    return Column(
      children: [
        const SizedBox(height: 28),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              const Icon(Icons.storefront_outlined, color: _navy800, size: 20),
              const SizedBox(width: 6),
              const Text(
                'Verified Boutiques Near You',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: _navy800,
                  letterSpacing: -0.3,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => context.push('/nearby'),
                child: const Text(
                  'View map',
                  style: TextStyle(
                    color: _magenta600,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 160,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: _shops.length,
            itemBuilder: (context, index) {
              return _buildShopCard(_shops[index]);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildShopCard(Map<String, dynamic> shop) {
    final tags = shop['tags'] as List<String>;
    return GestureDetector(
      onTap: () => context.push('/shop/${shop['id']}'),
      child: Container(
        width: 200,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
              child: Container(
                height: 70,
                color: const Color(0xFFEDE9FE),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.7),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified_rounded,
                              color: Color(0xFF2563EB), size: 12),
                          SizedBox(width: 4),
                          Text(
                            'Verified',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF2563EB),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    shop['name'] as String,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          color: _gold500, size: 12),
                      Text(
                        ' ${shop['rating']} (${shop['reviews']})',
                        style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: _navy800),
                      ),
                      const Spacer(),
                      const Icon(Icons.location_on_outlined,
                          color: _neutral500, size: 10),
                      Text(
                        shop['distance'] as String,
                        style: const TextStyle(
                            fontSize: 10, color: _neutral500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 4,
                    children: tags
                        .take(2)
                        .map((tag) => Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: _magenta100,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                tag,
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w600,
                                  color: _magenta600,
                                ),
                              ),
                            ))
                        .toList(),
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
