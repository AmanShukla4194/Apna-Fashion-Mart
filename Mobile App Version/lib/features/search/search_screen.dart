import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();
  Timer? _debounceTimer;

  List<String> _recentSearches = [];
  List<Map<String, dynamic>> _searchResults = [];
  bool _isSearching = false;
  String _selectedCategory = 'All';
  String _selectedSort = 'Relevance';

  // Filter state
  RangeValues _priceRange = const RangeValues(0, 20000);
  List<String> _selectedCategories = [];
  String _selectedDistance = '10km';
  double _minRating = 0;
  bool _verifiedOnly = false;

  static const Color _navy800 = Color(0xFF001F3F);
  static const Color _magenta600 = Color(0xFFFF1493);
  static const Color _magenta100 = Color(0xFFFFEDF7);
  static const Color _gold500 = Color(0xFFC9A24A);
  static const Color _neutral50 = Color(0xFFF8F9FB);
  static const Color _neutral100 = Color(0xFFF1F3F6);
  static const Color _neutral500 = Color(0xFF6B7280);

  static const List<String> _filterCategories = [
    'All', 'Sarees', 'Kurtas', 'Lehengas', 'Western', 'Men',
  ];

  static const List<String> _sortOptions = [
    'Relevance',
    'Price: Low to High',
    'Price: High to Low',
    'Rating',
    'Newest',
  ];

  static const List<String> _popularSearches = [
    'Silk sarees',
    'Handloom kurtas',
    'Embroidered lehengas',
    'Festive wear',
    'Designer blouses',
  ];

  static const List<Map<String, dynamic>> _allProducts = [
    {'id': '1', 'name': 'Banarasi Silk Saree', 'store': 'Aanya Atelier', 'price': 4899, 'oldPrice': 6200, 'rating': 4.8, 'distance': '1.4 km', 'category': 'Sarees'},
    {'id': '2', 'name': 'Anarkali Suit Set', 'store': 'Riya Collections', 'price': 2199, 'rating': 4.6, 'distance': '2.1 km', 'category': 'Kurtas'},
    {'id': '3', 'name': 'Embroidered Lehenga', 'store': 'Mira Weaves', 'price': 8499, 'oldPrice': 11000, 'rating': 4.9, 'distance': '0.9 km', 'category': 'Lehengas'},
    {'id': '4', 'name': 'Cotton Kurti Combo', 'store': 'Rang Studio', 'price': 1299, 'rating': 4.4, 'distance': '3.2 km', 'category': 'Kurtas'},
    {'id': '5', 'name': 'Chanderi Dupatta', 'store': 'Weaves & Co', 'price': 899, 'rating': 4.7, 'distance': '1.8 km', 'category': 'Sarees'},
    {'id': '6', 'name': 'Silk Coord Set', 'store': 'Studio Ekta', 'price': 3299, 'oldPrice': 4500, 'rating': 4.5, 'distance': '2.8 km', 'category': 'Western'},
    {'id': '7', 'name': 'Chikankari Kurti', 'store': 'Lucknow Threads', 'price': 1899, 'rating': 4.7, 'distance': '1.2 km', 'category': 'Kurtas'},
    {'id': '8', 'name': 'Kanjivaram Saree', 'store': 'Silk House', 'price': 9500, 'oldPrice': 12000, 'rating': 4.9, 'distance': '2.5 km', 'category': 'Sarees'},
  ];

  @override
  void initState() {
    super.initState();
    _loadRecentSearches();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _searchFocus.requestFocus();
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  Future<void> _loadRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      setState(() {
        _recentSearches = prefs.getStringList('recent_searches') ?? [];
      });
    } catch (_) {}
  }

  Future<void> _saveRecentSearch(String query) async {
    if (query.trim().isEmpty) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList('recent_searches') ?? [];
      list.remove(query);
      list.insert(0, query);
      final limited = list.take(8).toList();
      await prefs.setStringList('recent_searches', limited);
      setState(() => _recentSearches = limited);
    } catch (_) {}
  }

  Future<void> _removeRecentSearch(String query) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList('recent_searches') ?? [];
      list.remove(query);
      await prefs.setStringList('recent_searches', list);
      setState(() => _recentSearches = list);
    } catch (_) {}
  }

  Future<void> _clearAllRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('recent_searches');
      setState(() => _recentSearches = []);
    } catch (_) {}
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }
    setState(() => _isSearching = true);
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  void _performSearch(String query) {
    final q = query.toLowerCase().trim();
    var results = _allProducts.where((p) {
      final nameMatch = (p['name'] as String).toLowerCase().contains(q);
      final storeMatch = (p['store'] as String).toLowerCase().contains(q);
      final catMatch = (p['category'] as String).toLowerCase().contains(q);
      return nameMatch || storeMatch || catMatch;
    }).toList();

    // Apply category filter
    if (_selectedCategory != 'All') {
      results = results
          .where((p) =>
              (p['category'] as String).toLowerCase() ==
              _selectedCategory.toLowerCase())
          .toList();
    }

    // Apply price filter
    results = results.where((p) {
      final price = p['price'] as int;
      return price >= _priceRange.start && price <= _priceRange.end;
    }).toList();

    // Apply rating filter
    if (_minRating > 0) {
      results = results
          .where((p) => (p['rating'] as double) >= _minRating)
          .toList();
    }

    // Apply sort
    switch (_selectedSort) {
      case 'Price: Low to High':
        results.sort((a, b) =>
            (a['price'] as int).compareTo(b['price'] as int));
        break;
      case 'Price: High to Low':
        results.sort((a, b) =>
            (b['price'] as int).compareTo(a['price'] as int));
        break;
      case 'Rating':
        results.sort((a, b) =>
            (b['rating'] as double).compareTo(a['rating'] as double));
        break;
      default:
        break;
    }

    setState(() {
      _searchResults = results;
      _isSearching = false;
    });
  }

  void _onSearchSubmit(String query) {
    if (query.trim().isEmpty) return;
    _saveRecentSearch(query.trim());
    _performSearch(query);
  }

  void _selectSuggestion(String query) {
    _searchController.text = query;
    _onSearchSubmit(query);
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) => Padding(
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
                const SizedBox(height: 16),
                ..._sortOptions.map((option) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Radio<String>(
                        value: option,
                        groupValue: _selectedSort,
                        onChanged: (v) {
                          setSheetState(() {});
                          setState(() => _selectedSort = v!);
                          if (_searchController.text.isNotEmpty) {
                            _performSearch(_searchController.text);
                          }
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
      },
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        RangeValues tempPriceRange = _priceRange;
        String tempDistance = _selectedDistance;
        double tempMinRating = _minRating;
        bool tempVerifiedOnly = _verifiedOnly;
        List<String> tempCategories = List.from(_selectedCategories);

        return StatefulBuilder(
          builder: (ctx, setSheetState) => DraggableScrollableSheet(
            initialChildSize: 0.85,
            maxChildSize: 0.95,
            minChildSize: 0.5,
            expand: false,
            builder: (_, controller) => Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              child: Column(
                children: [
                  Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE5E7EB),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Text(
                        'Filters',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: _navy800,
                        ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          setSheetState(() {
                            tempPriceRange =
                                const RangeValues(0, 20000);
                            tempDistance = '10km';
                            tempMinRating = 0;
                            tempVerifiedOnly = false;
                            tempCategories = [];
                          });
                        },
                        child: const Text(
                          'Reset all',
                          style: TextStyle(
                              color: _magenta600,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const Divider(),
                  Expanded(
                    child: ListView(
                      controller: controller,
                      children: [
                        // Price Range
                        _filterSectionTitle('Price Range'),
                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '₹${tempPriceRange.start.round()}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: _navy800),
                            ),
                            Text(
                              '₹${tempPriceRange.end.round()}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: _navy800),
                            ),
                          ],
                        ),
                        RangeSlider(
                          values: tempPriceRange,
                          min: 0,
                          max: 20000,
                          divisions: 40,
                          activeColor: _magenta600,
                          inactiveColor: _magenta100,
                          labels: RangeLabels(
                            '₹${tempPriceRange.start.round()}',
                            '₹${tempPriceRange.end.round()}',
                          ),
                          onChanged: (v) =>
                              setSheetState(() => tempPriceRange = v),
                        ),
                        const SizedBox(height: 8),

                        // Category
                        _filterSectionTitle('Category'),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            'Sarees', 'Kurtas', 'Lehengas',
                            'Western', 'Men', 'Kids', 'Bridal',
                          ].map((cat) {
                            final selected =
                                tempCategories.contains(cat);
                            return GestureDetector(
                              onTap: () {
                                setSheetState(() {
                                  if (selected) {
                                    tempCategories.remove(cat);
                                  } else {
                                    tempCategories.add(cat);
                                  }
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: selected
                                      ? _magenta600
                                      : Colors.white,
                                  borderRadius:
                                      BorderRadius.circular(20),
                                  border: Border.all(
                                    color: selected
                                        ? _magenta600
                                        : const Color(0xFFE5E7EB),
                                  ),
                                ),
                                child: Text(
                                  cat,
                                  style: TextStyle(
                                    color: selected
                                        ? Colors.white
                                        : _navy800,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),

                        // Distance
                        _filterSectionTitle('Distance'),
                        Row(
                          children: ['1km', '5km', '10km', '20km']
                              .map((d) => Padding(
                                    padding: const EdgeInsets.only(
                                        right: 8),
                                    child: ChoiceChip(
                                      label: Text(d),
                                      selected:
                                          tempDistance == d,
                                      selectedColor: _magenta600,
                                      labelStyle: TextStyle(
                                        color: tempDistance == d
                                            ? Colors.white
                                            : _navy800,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                      ),
                                      backgroundColor: Colors.white,
                                      side: BorderSide(
                                        color: tempDistance == d
                                            ? _magenta600
                                            : const Color(0xFFE5E7EB),
                                      ),
                                      onSelected: (v) =>
                                          setSheetState(
                                              () => tempDistance = d),
                                    ),
                                  ))
                              .toList(),
                        ),
                        const SizedBox(height: 16),

                        // Rating
                        _filterSectionTitle('Minimum Rating'),
                        Row(
                          children: [
                            ChoiceChip(
                              label: const Text('4+ stars'),
                              selected: tempMinRating == 4.0,
                              selectedColor: _magenta600,
                              labelStyle: TextStyle(
                                color: tempMinRating == 4.0
                                    ? Colors.white
                                    : _navy800,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                              backgroundColor: Colors.white,
                              side: BorderSide(
                                color: tempMinRating == 4.0
                                    ? _magenta600
                                    : const Color(0xFFE5E7EB),
                              ),
                              onSelected: (v) => setSheetState(() =>
                                  tempMinRating = v ? 4.0 : 0),
                            ),
                            const SizedBox(width: 8),
                            ChoiceChip(
                              label: const Text('3+ stars'),
                              selected: tempMinRating == 3.0,
                              selectedColor: _magenta600,
                              labelStyle: TextStyle(
                                color: tempMinRating == 3.0
                                    ? Colors.white
                                    : _navy800,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                              backgroundColor: Colors.white,
                              side: BorderSide(
                                color: tempMinRating == 3.0
                                    ? _magenta600
                                    : const Color(0xFFE5E7EB),
                              ),
                              onSelected: (v) => setSheetState(() =>
                                  tempMinRating = v ? 3.0 : 0),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Verified toggle
                        _filterSectionTitle('Boutique Type'),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text(
                            'Verified boutiques only',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: _navy800,
                            ),
                          ),
                          subtitle: const Text(
                            'Show only AFM-verified stores',
                            style: TextStyle(
                                fontSize: 12, color: _neutral500),
                          ),
                          value: tempVerifiedOnly,
                          activeThumbColor: _magenta600,
                          onChanged: (v) =>
                              setSheetState(() => tempVerifiedOnly = v),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                  // Apply button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [_navy800, _magenta600],
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _priceRange = tempPriceRange;
                            _selectedDistance = tempDistance;
                            _minRating = tempMinRating;
                            _verifiedOnly = tempVerifiedOnly;
                            _selectedCategories = tempCategories;
                          });
                          if (_searchController.text.isNotEmpty) {
                            _performSearch(_searchController.text);
                          }
                          Navigator.pop(ctx);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: const Text(
                          'Apply Filters',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _filterSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, top: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: _navy800,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final showResults = _searchController.text.isNotEmpty;

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
        title: TextField(
          controller: _searchController,
          focusNode: _searchFocus,
          autofocus: true,
          textInputAction: TextInputAction.search,
          style: const TextStyle(
              color: _navy800, fontSize: 15, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: 'Search products, stores, styles…',
            hintStyle:
                const TextStyle(color: _neutral500, fontSize: 15),
            border: InputBorder.none,
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.close_rounded,
                        color: _neutral500, size: 20),
                    onPressed: () {
                      _searchController.clear();
                      setState(() {
                        _searchResults = [];
                        _isSearching = false;
                      });
                    },
                  )
                : null,
          ),
          onChanged: _onSearchChanged,
          onSubmitted: _onSearchSubmit,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: _navy800),
            onPressed: _showFilterSheet,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            color: const Color(0xFFE5E7EB),
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter chips bar
          if (showResults) _buildFilterChipsBar(),
          if (showResults && _searchResults.isNotEmpty) _buildSortBar(),
          Expanded(
            child: showResults
                ? _buildSearchResults()
                : _buildSearchSuggestions(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChipsBar() {
    return Container(
      height: 50,
      color: Colors.white,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        itemCount: _filterCategories.length,
        itemBuilder: (context, index) {
          final cat = _filterCategories[index];
          final selected = _selectedCategory == cat;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () {
                setState(() => _selectedCategory = cat);
                if (_searchController.text.isNotEmpty) {
                  _performSearch(_searchController.text);
                }
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
                  cat,
                  style: TextStyle(
                    color: selected ? Colors.white : _navy800,
                    fontWeight:
                        selected ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSortBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: _neutral50,
      child: Row(
        children: [
          Text(
            '${_searchResults.length} results',
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
                const Icon(Icons.sort_rounded, color: _navy800, size: 16),
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
    );
  }

  Widget _buildSearchResults() {
    if (_isSearching) {
      return const Center(
        child: CircularProgressIndicator(color: _magenta600),
      );
    }

    if (_searchResults.isEmpty) {
      return _buildEmptyState();
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 8,
        childAspectRatio: 0.70,
      ),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        return _buildProductCard(_searchResults[index]);
      },
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
              blurRadius: 10,
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
                ],
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

  Widget _buildEmptyState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off_rounded,
                size: 64, color: Color(0xFFD1D5DB)),
            SizedBox(height: 16),
            Text(
              'No results found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: _navy800,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Try a different search term or adjust your filters.',
              style: TextStyle(fontSize: 13, color: _neutral500),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchSuggestions() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Recent searches
        if (_recentSearches.isNotEmpty) ...[
          Row(
            children: [
              const Text(
                'Recent Searches',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: _navy800,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: _clearAllRecentSearches,
                child: const Text(
                  'Clear all',
                  style: TextStyle(
                    color: _magenta600,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ..._recentSearches.map((search) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.history_rounded,
                    color: _neutral500, size: 18),
                title: Text(
                  search,
                  style: const TextStyle(
                      fontSize: 14, color: _navy800),
                ),
                trailing: IconButton(
                  icon: const Icon(Icons.close_rounded,
                      color: _neutral500, size: 16),
                  onPressed: () => _removeRecentSearch(search),
                ),
                onTap: () => _selectSuggestion(search),
              )),
          const SizedBox(height: 24),
        ],

        // Popular searches
        const Text(
          'Popular Searches',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: _navy800,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _popularSearches
              .map((search) => GestureDetector(
                    onTap: () => _selectSuggestion(search),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: const Color(0xFFE5E7EB)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.trending_up_rounded,
                              color: _magenta600, size: 14),
                          const SizedBox(width: 6),
                          Text(
                            search,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: _navy800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}
