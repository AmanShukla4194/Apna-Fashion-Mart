import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:apna_fashion_mart/core/providers/cart_provider.dart';
import 'package:apna_fashion_mart/models/cart_item_model.dart';
import 'package:apna_fashion_mart/core/providers/wishlist_provider.dart';
import 'package:apna_fashion_mart/features/products/widgets/review_form_sheet.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String id;
  const ProductDetailScreen({super.key, required this.id});

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  final PageController _imageController = PageController();
  int _currentImageIndex = 0;
  String? _selectedSize;
  String? _selectedColor;
  bool _addingToCart = false;
  bool _addingToWishlist = false;
  bool _descriptionExpanded = false;

  static const Color _navy800 = Color(0xFF001F3F);
  static const Color _magenta600 = Color(0xFFFF1493);
  static const Color _magenta100 = Color(0xFFFFEDF7);
  static const Color _gold500 = Color(0xFFC9A24A);
  static const Color _neutral50 = Color(0xFFF8F9FB);
  static const Color _neutral100 = Color(0xFFF1F3F6);
  static const Color _neutral500 = Color(0xFF6B7280);

  // Mock product data based on product id
  late Map<String, dynamic> _product;

  static const List<Map<String, dynamic>> _mockProducts = [
    {
      'id': '1',
      'name': 'Banarasi Silk Saree',
      'store': 'Aanya Atelier',
      'storeId': 's1',
      'price': 4899,
      'oldPrice': 6200,
      'rating': 4.8,
      'reviewCount': 214,
      'distance': '1.4 km',
      'description': 'A luxurious Banarasi silk saree handwoven in Varanasi with traditional zari motifs. The rich texture and vibrant colours make it perfect for weddings and festive occasions. Comes with a matching blouse piece.',
      'fabric': 'Pure Silk',
      'occasion': 'Wedding, Festive',
      'care': 'Dry clean only',
      'origin': 'Varanasi, UP',
      'sizes': ['Free Size'],
      'colors': ['Red', 'Navy', 'Gold', 'Green'],
      'images': 3,
      'inStock': true,
      'verified': true,
    },
    {
      'id': '2',
      'name': 'Anarkali Suit Set',
      'store': 'Riya Collections',
      'storeId': 's2',
      'price': 2199,
      'oldPrice': null,
      'rating': 4.6,
      'reviewCount': 187,
      'distance': '2.1 km',
      'description': 'A stunning Anarkali suit set crafted in premium georgette fabric. Beautifully embroidered with floral patterns, this set includes top, bottom, and dupatta. Ideal for festivals, parties and family gatherings.',
      'fabric': 'Georgette',
      'occasion': 'Party, Festival, Casual',
      'care': 'Hand wash or dry clean',
      'origin': 'Jaipur, Rajasthan',
      'sizes': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      'colors': ['Pink', 'Blue', 'Maroon'],
      'images': 2,
      'inStock': true,
      'verified': true,
    },
  ];

  static const List<Map<String, dynamic>> _mockReviews = [
    {
      'name': 'Priya S.',
      'rating': 5,
      'date': '2 days ago',
      'title': 'Absolutely stunning!',
      'body': 'The quality exceeded my expectations. The fabric is so smooth and the colors are exactly as shown. Would definitely buy again!',
      'verified': true,
    },
    {
      'name': 'Meena K.',
      'rating': 4,
      'date': '1 week ago',
      'title': 'Beautiful piece',
      'body': 'Loved the craftsmanship. Delivery was fast and packaging was excellent. Slight colour difference from photos but still gorgeous.',
      'verified': true,
    },
    {
      'name': 'Radhika T.',
      'rating': 5,
      'date': '2 weeks ago',
      'title': 'Worth every rupee',
      'body': 'Wore this to a family wedding and got so many compliments. The boutique owner was also very helpful with alterations.',
      'verified': false,
    },
  ];

  static const List<Map<String, dynamic>> _relatedProducts = [
    {'id': '3', 'name': 'Embroidered Lehenga', 'store': 'Mira Weaves', 'price': 8499, 'oldPrice': 11000, 'rating': 4.9},
    {'id': '5', 'name': 'Chanderi Dupatta', 'store': 'Weaves & Co', 'price': 899, 'rating': 4.7},
    {'id': '6', 'name': 'Silk Coord Set', 'store': 'Studio Ekta', 'price': 3299, 'oldPrice': 4500, 'rating': 4.5},
  ];

  @override
  void initState() {
    super.initState();
    _product = _mockProducts.firstWhere(
      (p) => p['id'] == widget.id,
      orElse: () => _mockProducts[0],
    );
    final sizes = _product['sizes'] as List<String>;
    if (sizes.isNotEmpty) _selectedSize = sizes[0];
    final colors = _product['colors'] as List<String>;
    if (colors.isNotEmpty) _selectedColor = colors[0];
  }

  @override
  void dispose() {
    _imageController.dispose();
    super.dispose();
  }

  Future<void> _addToCart() async {
    if (_selectedSize == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a size'),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    setState(() => _addingToCart = true);
    try {
      await ref.read(cartProvider.notifier).addItem(
            CartItemModel(
              productId: _product['id'] as String,
              name: _product['name'] as String? ?? '',
              store: (_product['stores'] as Map<String, dynamic>?)?['name'] as String? ?? '',
              storeId: _product['store_id'] as String? ?? '',
              imageUrl: (_product['images'] as List<dynamic>?)?.firstOrNull as String? ?? '',
              price: ((_product['price'] as num?)?.toInt() ?? 0),
              oldPrice: (_product['original_price'] as num?)?.toInt(),
              size: _selectedSize ?? '',
              color: _selectedColor ?? '',
              quantity: 1,
            ),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Added to bag!'),
            backgroundColor: Colors.green[700],
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10)),
            action: SnackBarAction(
              label: 'View Bag',
              textColor: Colors.white,
              onPressed: () => context.push('/cart'),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.red[700],
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _addingToCart = false);
    }
  }

  Future<void> _toggleWishlist() async {
    setState(() => _addingToWishlist = true);
    try {
      final isWishlisted = ref.read(
          isWishlistedProvider(_product['id'] as String));
      if (isWishlisted) {
        await ref
            .read(wishlistProvider.notifier)
            .removeProduct(_product['id'] as String);
      } else {
        await ref
            .read(wishlistProvider.notifier)
            .addProduct(_product['id'] as String);
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _addingToWishlist = false);
    }
  }

  void _showArToast() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.camera_alt_outlined, color: Colors.white, size: 16),
            SizedBox(width: 8),
            Text('Opening AR camera — coming soon!'),
          ],
        ),
        backgroundColor: _navy800,
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showReviewForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ReviewFormSheet(
        productName: _product['name'] as String,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isWishlisted =
        ref.watch(isWishlistedProvider(_product['id'] as String));
    final hasOldPrice = _product['oldPrice'] != null;
    final discountPct = hasOldPrice
        ? (((_product['oldPrice'] as int) - (_product['price'] as int)) /
                (_product['oldPrice'] as int) *
                100)
            .round()
        : 0;
    final imageCount = _product['images'] as int;
    final sizes = _product['sizes'] as List<String>;
    final colors = _product['colors'] as List<String>;

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // Image header
          SliverToBoxAdapter(
            child: Stack(
              children: [
                // Image PageView
                SizedBox(
                  height: 380,
                  child: PageView.builder(
                    controller: _imageController,
                    itemCount: imageCount,
                    onPageChanged: (i) =>
                        setState(() => _currentImageIndex = i),
                    itemBuilder: (context, index) => Container(
                      color: _neutral100,
                      child: const Center(
                        child: Icon(Icons.image_outlined,
                            color: Color(0xFFD1D5DB), size: 80),
                      ),
                    ),
                  ),
                ),
                // Top buttons
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    child: Row(
                      children: [
                        _topIconButton(
                          icon: Icons.arrow_back_ios_new_rounded,
                          onTap: () => context.canPop()
                              ? context.pop()
                              : context.go('/'),
                        ),
                        const Spacer(),
                        _topIconButton(
                          icon: Icons.share_outlined,
                          onTap: () {},
                        ),
                        const SizedBox(width: 8),
                        _topIconButton(
                          icon: isWishlisted
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          iconColor: isWishlisted ? _magenta600 : _navy800,
                          onTap: _toggleWishlist,
                        ),
                      ],
                    ),
                  ),
                ),
                // Dot indicators
                Positioned(
                  bottom: 12,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      imageCount,
                      (i) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: _currentImageIndex == i ? 20 : 6,
                        height: 6,
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        decoration: BoxDecoration(
                          color: _currentImageIndex == i
                              ? _magenta600
                              : Colors.white.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                  ),
                ),
                // Discount badge
                if (hasOldPrice)
                  Positioned(
                    bottom: 40,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: _magenta600,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '-$discountPct% OFF',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Verified badge
                  if (_product['verified'] == true)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                            color: const Color(0xFF3B82F6)
                                .withValues(alpha: 0.3)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified_rounded,
                              color: Color(0xFF2563EB), size: 13),
                          SizedBox(width: 4),
                          Text(
                            'AFM Verified Boutique',
                            style: TextStyle(
                              color: Color(0xFF2563EB),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 10),
                  // Product name
                  Text(
                    _product['name'] as String,
                    style: const TextStyle(
                      fontFamily: 'PlayfairDisplay',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                      letterSpacing: -0.3,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Store name
                  GestureDetector(
                    onTap: () =>
                        context.push('/shop/${_product['storeId']}'),
                    child: Row(
                      children: [
                        const Icon(Icons.storefront_outlined,
                            color: _magenta600, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          _product['store'] as String,
                          style: const TextStyle(
                            color: _magenta600,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_forward_ios_rounded,
                            color: _magenta600, size: 11),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Price row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '₹${_product['price']}',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: _navy800,
                          letterSpacing: -0.5,
                        ),
                      ),
                      if (hasOldPrice) ...[
                        const SizedBox(width: 10),
                        Text(
                          '₹${_product['oldPrice']}',
                          style: const TextStyle(
                            fontSize: 16,
                            color: _neutral500,
                            decoration: TextDecoration.lineThrough,
                            decorationColor: _neutral500,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                                color: Colors.green.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            '$discountPct% off',
                            style: const TextStyle(
                              color: Colors.green,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Rating + distance row
                  Row(
                    children: [
                      Row(
                        children: List.generate(
                          5,
                          (i) => Icon(
                            i < (_product['rating'] as double).floor()
                                ? Icons.star_rounded
                                : i < (_product['rating'] as double)
                                    ? Icons.star_half_rounded
                                    : Icons.star_outline_rounded,
                            color: _gold500,
                            size: 16,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${_product['rating']} (${_product['reviewCount']} reviews)',
                        style: const TextStyle(
                          fontSize: 12,
                          color: _neutral500,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.location_on_outlined,
                          color: _neutral500, size: 13),
                      Text(
                        _product['distance'] as String,
                        style: const TextStyle(
                            fontSize: 12, color: _neutral500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Size selector
                  if (sizes.isNotEmpty) ...[
                    Row(
                      children: [
                        const Text(
                          'Size',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: _navy800,
                          ),
                        ),
                        if (_selectedSize != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            ': $_selectedSize',
                            style: const TextStyle(
                                fontSize: 14, color: _neutral500),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: sizes.map((size) {
                        final selected = _selectedSize == size;
                        return GestureDetector(
                          onTap: () =>
                              setState(() => _selectedSize = size),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: selected ? _magenta600 : Colors.white,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: selected
                                    ? _magenta600
                                    : const Color(0xFFE5E7EB),
                                width: selected ? 1.5 : 1,
                              ),
                              boxShadow: selected
                                  ? [
                                      BoxShadow(
                                        color:
                                            _magenta600.withValues(alpha: 0.25),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      )
                                    ]
                                  : [],
                            ),
                            child: Text(
                              size,
                              style: TextStyle(
                                color: selected
                                    ? Colors.white
                                    : _navy800,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Color selector
                  if (colors.isNotEmpty) ...[
                    Row(
                      children: [
                        const Text(
                          'Color',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: _navy800,
                          ),
                        ),
                        if (_selectedColor != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            ': $_selectedColor',
                            style: const TextStyle(
                                fontSize: 14, color: _neutral500),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 10,
                      children: colors.map((color) {
                        final selected = _selectedColor == color;
                        final colorValue = _colorFromName(color);
                        return GestureDetector(
                          onTap: () =>
                              setState(() => _selectedColor = color),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: colorValue,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: selected
                                    ? _navy800
                                    : Colors.transparent,
                                width: 2.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: colorValue.withValues(alpha: 0.4),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: selected
                                ? const Icon(Icons.check_rounded,
                                    color: Colors.white, size: 16)
                                : null,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // CTA Buttons
                  _addingToCart
                      ? Container(
                          height: 52,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [_navy800, _magenta600],
                            ),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2.5),
                            ),
                          ),
                        )
                      : DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                _navy800,
                                Color(0xFF6D1B5C),
                                _magenta600,
                              ],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: _magenta600.withValues(alpha: 0.3),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton.icon(
                              onPressed: _addToCart,
                              icon: const Icon(Icons.shopping_bag_outlined,
                                  color: Colors.white, size: 18),
                              label: const Text(
                                'Add to Bag',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                            ),
                          ),
                        ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _toggleWishlist,
                          icon: Icon(
                            isWishlisted
                                ? Icons.favorite_rounded
                                : Icons.favorite_border_rounded,
                            color: _magenta600,
                            size: 17,
                          ),
                          label: Text(
                            isWishlisted
                                ? 'Wishlisted'
                                : 'Add to Wishlist',
                            style: const TextStyle(
                              color: _magenta600,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 48),
                            side: const BorderSide(color: _magenta600),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _showArToast,
                          icon: const Icon(Icons.camera_alt_outlined,
                              color: _navy800, size: 17),
                          label: const Text(
                            'AR Try-on',
                            style: TextStyle(
                              color: _navy800,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 48),
                            side: const BorderSide(
                                color: Color(0xFFE5E7EB)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Trust strip
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _neutral50,
                      borderRadius: BorderRadius.circular(14),
                      border:
                          Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _trustItem(Icons.local_shipping_outlined,
                            'Free\nDelivery'),
                        _trustDivider(),
                        _trustItem(
                            Icons.replay_rounded, '7-Day\nReturns'),
                        _trustDivider(),
                        _trustItem(Icons.lock_outlined, 'Secure\nPayment'),
                        _trustDivider(),
                        _trustItem(
                            Icons.verified_outlined, 'Verified\nSeller'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Description
                  const Text(
                    'Product Description',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _product['description'] as String,
                    style: const TextStyle(
                      fontSize: 13,
                      color: _neutral500,
                      height: 1.6,
                    ),
                    maxLines: _descriptionExpanded ? null : 3,
                    overflow: _descriptionExpanded
                        ? null
                        : TextOverflow.ellipsis,
                  ),
                  GestureDetector(
                    onTap: () => setState(
                        () => _descriptionExpanded = !_descriptionExpanded),
                    child: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        _descriptionExpanded
                            ? 'Show less'
                            : 'Read more',
                        style: const TextStyle(
                          color: _magenta600,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Specifications
                  const Text(
                    'Specifications',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: _neutral50,
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Column(
                      children: [
                        _specRow('Fabric', _product['fabric'] as String),
                        _specDivider(),
                        _specRow(
                            'Occasion', _product['occasion'] as String),
                        _specDivider(),
                        _specRow('Care', _product['care'] as String),
                        _specDivider(),
                        _specRow('Origin', _product['origin'] as String),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Frequently Bought Together
                  const Text(
                    'Frequently Bought Together',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: _relatedProducts.take(3).map((p) {
                      return Expanded(
                        child: GestureDetector(
                          onTap: () =>
                              context.push('/product/${p['id']}'),
                          child: Container(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 3),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                  color: const Color(0xFFE5E7EB)),
                            ),
                            child: Column(
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.vertical(
                                      top: Radius.circular(10)),
                                  child: Container(
                                    height: 80,
                                    color: _neutral100,
                                    child: const Center(
                                      child: Icon(Icons.image_outlined,
                                          color: Color(0xFFD1D5DB),
                                          size: 28),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(6),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        p['name'] as String,
                                        style: const TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w700,
                                          color: _navy800,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '₹${p['price']}',
                                        style: const TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                          color: _navy800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 28),

                  // Reviews section
                  Row(
                    children: [
                      const Text(
                        'Customer Reviews',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: _navy800,
                        ),
                      ),
                      const Spacer(),
                      GestureDetector(
                        onTap: _showReviewForm,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _magenta100,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                                color: _magenta600.withValues(alpha: 0.3)),
                          ),
                          child: const Text(
                            'Write a review',
                            style: TextStyle(
                              color: _magenta600,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Rating summary
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _neutral50,
                      borderRadius: BorderRadius.circular(14),
                      border:
                          Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Row(
                      children: [
                        Column(
                          children: [
                            Text(
                              '${_product['rating']}',
                              style: const TextStyle(
                                fontSize: 40,
                                fontWeight: FontWeight.w900,
                                color: _navy800,
                                height: 1,
                              ),
                            ),
                            Row(
                              children: List.generate(
                                5,
                                (i) => Icon(
                                  i < (_product['rating'] as double).floor()
                                      ? Icons.star_rounded
                                      : Icons.star_outline_rounded,
                                  color: _gold500,
                                  size: 14,
                                ),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${_product['reviewCount']} reviews',
                              style: const TextStyle(
                                  fontSize: 10, color: _neutral500),
                            ),
                          ],
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            children: [5, 4, 3, 2, 1].map((star) {
                              final width = star == 5
                                  ? 0.65
                                  : star == 4
                                      ? 0.25
                                      : star == 3
                                          ? 0.07
                                          : 0.02;
                              return Padding(
                                padding:
                                    const EdgeInsets.only(bottom: 4),
                                child: Row(
                                  children: [
                                    Text(
                                      '$star',
                                      style: const TextStyle(
                                          fontSize: 11,
                                          color: _neutral500),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.star_rounded,
                                        color: _gold500, size: 11),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(4),
                                        child: LinearProgressIndicator(
                                          value: width,
                                          backgroundColor:
                                              const Color(0xFFE5E7EB),
                                          valueColor:
                                              const AlwaysStoppedAnimation(
                                                  _gold500),
                                          minHeight: 6,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Review cards
                  ..._mockReviews.map((review) => _buildReviewCard(review)),
                  const SizedBox(height: 28),

                  // More from boutique
                  const Text(
                    'More from this Boutique',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 220,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _relatedProducts.length,
                      itemBuilder: (context, index) {
                        return _buildMiniProductCard(
                            _relatedProducts[index]);
                      },
                    ),
                  ),
                  const SizedBox(height: 28),

                  // You may also like
                  const Text(
                    'You May Also Like',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 8,
                      childAspectRatio: 0.72,
                    ),
                    itemCount: 4,
                    itemBuilder: (context, index) {
                      return _buildProductGridCard(
                          _relatedProducts[index % _relatedProducts.length]);
                    },
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _topIconButton({
    required IconData icon,
    required VoidCallback onTap,
    Color iconColor = _navy800,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.9),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(icon, color: iconColor, size: 18),
      ),
    );
  }

  Widget _trustItem(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: _navy800, size: 20),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w600,
            color: _navy800,
            height: 1.3,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _trustDivider() {
    return Container(
      width: 1,
      height: 32,
      color: const Color(0xFFE5E7EB),
    );
  }

  Widget _specRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: _neutral500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: _navy800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _specDivider() {
    return const Divider(
        height: 1, color: Color(0xFFE5E7EB), indent: 14, endIndent: 14);
  }

  Widget _buildReviewCard(Map<String, dynamic> review) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: _magenta100,
                child: Text(
                  (review['name'] as String)[0],
                  style: const TextStyle(
                    color: _magenta600,
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        review['name'] as String,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: _navy800,
                        ),
                      ),
                      if (review['verified'] == true) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.verified_rounded,
                            color: Color(0xFF2563EB), size: 12),
                      ],
                    ],
                  ),
                  Text(
                    review['date'] as String,
                    style: const TextStyle(
                        fontSize: 10, color: _neutral500),
                  ),
                ],
              ),
              const Spacer(),
              Row(
                children: List.generate(
                  review['rating'] as int,
                  (_) => const Icon(Icons.star_rounded,
                      color: _gold500, size: 13),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            review['title'] as String,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: _navy800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            review['body'] as String,
            style: const TextStyle(
              fontSize: 12,
              color: _neutral500,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniProductCard(Map<String, dynamic> product) {
    return GestureDetector(
      onTap: () => context.push('/product/${product['id']}'),
      child: Container(
        width: 140,
        margin: const EdgeInsets.only(right: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(14)),
              child: Container(
                height: 130,
                color: _neutral100,
                child: const Center(
                  child: Icon(Icons.image_outlined,
                      color: Color(0xFFD1D5DB), size: 32),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] as String,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '₹${product['price']}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: _navy800,
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

  Widget _buildProductGridCard(Map<String, dynamic> product) {
    final hasOldPrice = product['oldPrice'] != null;
    return GestureDetector(
      onTap: () => context.push('/product/${product['id']}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(14)),
                child: Container(
                  color: _neutral100,
                  child: const Center(
                    child: Icon(Icons.image_outlined,
                        color: Color(0xFFD1D5DB), size: 36),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] as String,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: _navy800,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '₹${product['price']}',
                        style: const TextStyle(
                          fontSize: 12,
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _colorFromName(String name) {
    switch (name.toLowerCase()) {
      case 'red':
        return Colors.red[700]!;
      case 'navy':
        return _navy800;
      case 'gold':
        return _gold500;
      case 'green':
        return Colors.green[700]!;
      case 'pink':
        return Colors.pink[400]!;
      case 'blue':
        return Colors.blue[700]!;
      case 'maroon':
        return const Color(0xFF800000);
      case 'white':
        return Colors.white;
      case 'black':
        return Colors.black;
      default:
        return _magenta600;
    }
  }
}
