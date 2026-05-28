import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  final String? category;

  const ProductListScreen({super.key, this.category});

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  final ScrollController _scrollController = ScrollController();

  bool _isLoading = false;
  bool _hasMore = true;
  String _selectedSort = 'Relevance';
  String _selectedSubcategory = 'All';
  List<Map<String, dynamic>> _products = [];

  static const Color _navy800 = Color(0xFF001F3F);
  static const Color _magenta600 = Color(0xFFFF1493);
  static const Color _magenta100 = Color(0xFFFFEDF7);
  static const Color _gold500 = Color(0xFFC9A24A);
  static const Color _neutral50 = Color(0xFFF8F9FB);
  static const Color _neutral100 = Color(0xFFF1F3F6);
  static const Color _neutral500 = Color(0xFF6B7280);

  static const List<Map<String, dynamic>> _allProducts = [
    {'id': '1', 'name': 'Banarasi Silk Saree', 'store': 'Aanya Atelier', 'price': 4899, 'oldPrice': 6200, 'rating': 4.8, 'distance': '1.4 km', 'category': 'Sarees'},
    {'id': '2', 'name': 'Anarkali Suit Set', 'store': 'Riya Collections', 'price': 2199, 'rating': 4.6, 'distance': '2.1 km', 'category': 'Kurtas'},
    {'id': '3', 'name': 'Embroidered Lehenga', 'store': 'Mira Weaves', 'price': 8499, 'oldPrice': 11000, 'rating': 4.9, 'distance': '0.9 km', 'category': 'Lehengas'},
    {'id': '4', 'name': 'Cotton Kurti Combo', 'store': 'Rang Studio', 'price': 1299, 'rating': 4.4, 'distance': '3.2 km', 'category': 'Kurtas'},
    {'id': '5', 'name': 'Chanderi Dupatta', 'store': 'Weaves & Co', 'price': 899, 'rating': 4.7, 'distance': '1.8 km', 'category': 'Sarees'},
    {'id': '6', 'name': 'Silk Coord Set', 'store': 'Studio Ekta', 'price': 3299, 'oldPrice': 4500, 'rating': 4.5, 'distance': '2.8 km', 'category': 'Western'},
    {'id': '7', 'name': 'Chikankari Kurti', 'store': 'Lucknow Threads', 'price': 1899, 'rating': 4.7, 'distance': '1.2 km', 'category': 'Kurtas'},
    {'id': '8', 'name': 'Kanjivaram Saree', 'store': 'Silk House', 'price': 9500, 'oldPrice': 12000, 'rating': 4.9, 'distance': '2.5 km', 'category': 'Sarees'},
    {'id': '9', 'name': 'Georgette Saree', 'store': 'Priya Boutique', 'price': 2399, 'rating': 4.3, 'distance': '1.9 km', 'category': 'Sarees'},
    {'id': '10', 'name': 'Designer Blouse', 'store': 'Stitch & Style', 'price': 1599, 'oldPrice': 1999, 'rating': 4.6, 'distance': '0.7 km', 'category': 'Sarees'},
    {'id': '11', 'name': 'Palazzo Set', 'store': 'Meera Fashions', 'price': 1799, 'rating': 4.4, 'distance': '2.3 km', 'category': 'Kurtas'},
    {'id': '12', 'name': 'Bridal Lehenga', 'store': 'Royal Drapes', 'price': 24999, 'oldPrice': 35000, 'rating': 5.0, 'distance': '3.1 km', 'category': 'Lehengas'},
  ];

  List<String> get _subcategories {
    final cat = widget.category;
    if (cat == null || cat.isEmpty || cat.toLowerCase() == 'sarees') {
      return ['All', 'Silk', 'Cotton', 'Georgette', 'Chiffon', 'Handloom'];
    } else if (cat.toLowerCase().contains('kurta') ||
        cat.toLowerCase().contains('suit')) {
      return ['All', 'Anarkali', 'Straight', 'Palazzo Set', 'Sharara'];
    } else if (cat.toLowerCase().contains('lehenga')) {
      return ['All', 'Bridal', 'Party Wear', 'Festive', 'Embroidered'];
    } else {
      return ['All', 'Casual', 'Formal', 'Party', 'Ethnic'];
    }
  }

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      if (!_isLoading && _hasMore) {
        _loadMoreProducts();
      }
    }
  }

  void _loadProducts() {
    setState(() => _isLoading = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      var filtered = List<Map<String, dynamic>>.from(_allProducts);
      if (widget.category != null && widget.category!.isNotEmpty) {
        filtered = filtered
            .where((p) =>
                (p['category'] as String)
                    .toLowerCase()
                    .contains(widget.category!.toLowerCase()) ||
                widget.category!
                    .toLowerCase()
                    .contains((p['category'] as String).toLowerCase()))
            .toList();
        if (filtered.isEmpty) filtered = List.from(_allProducts);
      }
      _applySort(filtered);
      setState(() {
        _products = filtered;
        _isLoading = false;
        _hasMore = filtered.length < _allProducts.length * 2;
      });
    });
  }

  void _loadMoreProducts() {
    setState(() => _isLoading = true);
    Future.delayed(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      final more = _allProducts.take(4).map((p) => {
            ...p,
            'id': '${p['id']}_extra',
          }).toList();
      setState(() {
        _products.addAll(more);
        _isLoading = false;
        _hasMore = false;
      });
    });
  }

  void _applySort(List<Map<String, dynamic>> list) {
    switch (_selectedSort) {
      case 'Price: Low to High':
        list.sort(
            (a, b) => (a['price'] as int).compareTo(b['price'] as int));
        break;
      case 'Price: High to Low':
        list.sort(
            (a, b) => (b['price'] as int).compareTo(a['price'] as int));
        break;
      case 'Rating':
        list.sort((a, b) =>
            (b['rating'] as double).compareTo(a['rating'] as double));
        break;
    }
  }

  void _showSortSheet() {
    final sortOptions = [
      'Relevance',
      'Price: Low to High',
      'Price: High to Low',
      'Rating',
      'Newest',
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Sort By',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: _navy800,
              ),
            ),
            const SizedBox(height: 12),
            ...sortOptions.map((option) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Radio<String>(
                    value: option,
                    groupValue: _selectedSort,
                    onChanged: (v) {
                      setState(() {
                        _selectedSort = v!;
                        _applySort(_products);
                      });
                      Navigator.pop(ctx);
                    },
                    activeColor: _magenta600,
                  ),
                  title: Text(
                    option,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: _selectedSort == option
                          ? FontWeight.w700
                          : FontWeight.w400,
                      color: _selectedSort == option
                          ? _magenta600
                          : _navy800,
                    ),
                  ),
                )),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.category?.isNotEmpty == true
        ? widget.category!
        : 'All Products';

    return Scaffold(
      backgroundColor: _neutral50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: _navy800, size: 20),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: _navy800,
                fontWeight: FontWeight.w800,
                fontSize: 17,
              ),
            ),
            if (_products.isNotEmpty)
              Text(
                '${_products.length} products',
                style: const TextStyle(
                    color: _neutral500,
                    fontSize: 11,
                    fontWeight: FontWeight.w400),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: _navy800),
            onPressed: () => context.push('/search'),
          ),
          IconButton(
            icon: const Icon(Icons.sort_rounded, color: _navy800),
            onPressed: _showSortSheet,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFFE5E7EB)),
        ),
      ),
      body: Column(
        children: [
          // Subcategory filter chips
          Container(
            height: 50,
            color: Colors.white,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 8),
              itemCount: _subcategories.length,
              itemBuilder: (context, index) {
                final sub = _subcategories[index];
                final selected = _selectedSubcategory == sub;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _selectedSubcategory = sub);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 4),
                      decoration: BoxDecoration(
                        color: selected ? _magenta600 : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: selected
                              ? _magenta600
                              : const Color(0xFFE5E7EB),
                        ),
                      ),
                      child: Text(
                        sub,
                        style: TextStyle(
                          color: selected ? Colors.white : _navy800,
                          fontWeight: selected
                              ? FontWeight.w700
                              : FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          // Sort bar
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 16, vertical: 10),
            color: _neutral50,
            child: Row(
              children: [
                Text(
                  '${_products.length} products',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _neutral500,
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: _showSortSheet,
                  child: Row(
                    children: [
                      const Icon(Icons.sort_rounded,
                          color: _navy800, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        _selectedSort,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _navy800,
                        ),
                      ),
                      const Icon(Icons.keyboard_arrow_down_rounded,
                          color: _navy800, size: 16),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Grid
          Expanded(
            child: _isLoading && _products.isEmpty
                ? _buildShimmerGrid()
                : _products.isEmpty
                    ? _buildEmptyState()
                    : GridView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(12),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 8,
                          childAspectRatio: 0.70,
                        ),
                        itemCount:
                            _products.length + (_isLoading ? 2 : 0),
                        itemBuilder: (context, index) {
                          if (index >= _products.length) {
                            return _buildShimmerCard();
                          }
                          return _buildProductCard(_products[index]);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
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
                            color: Color(0xFFD1D5DB), size: 40),
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
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.favorite_border_rounded,
                          size: 15, color: _magenta600),
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
                          color: _gold500, size: 11),
                      Text(
                        ' ${product['rating']}',
                        style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: _navy800),
                      ),
                      const Spacer(),
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

  Widget _buildShimmerGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 8,
        childAspectRatio: 0.70,
      ),
      itemCount: 6,
      itemBuilder: (_, __) => _buildShimmerCard(),
    );
  }

  Widget _buildShimmerCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
              child: _shimmerBox(double.infinity, double.infinity),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _shimmerBox(double.infinity, 12),
                const SizedBox(height: 6),
                _shimmerBox(80, 10),
                const SizedBox(height: 8),
                _shimmerBox(60, 14),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _shimmerBox(double width, double height) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: _neutral100,
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.inventory_2_outlined,
                size: 64, color: Color(0xFFD1D5DB)),
            const SizedBox(height: 16),
            const Text(
              'No products found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: _navy800,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Try a different category or check back later.',
              style: TextStyle(fontSize: 13, color: _neutral500),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => context.go('/'),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: _magenta600),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text(
                'Browse All Products',
                style: TextStyle(color: _magenta600, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
