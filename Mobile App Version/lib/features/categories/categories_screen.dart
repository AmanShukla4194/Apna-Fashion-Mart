import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  static const Color _navy800 = Color(0xFF001F3F);
  static const Color _magenta600 = Color(0xFFFF1493);
  static const Color _magenta100 = Color(0xFFFFEDF7);
  static const Color _gold500 = Color(0xFFC9A24A);
  static const Color _neutral50 = Color(0xFFF8F9FB);
  static const Color _neutral500 = Color(0xFF6B7280);

  static const List<Map<String, dynamic>> _categories = [
    {
      'label': 'Sarees',
      'icon': '🥻',
      'description': 'Silk, Cotton, Handloom & more',
      'gradientColors': [Color(0xFFEC4899), Color(0xFFBE185D)],
      'count': '2,400+',
    },
    {
      'label': 'Kurtas & Suits',
      'icon': '👗',
      'description': 'Anarkali, Straight, Palazzo sets',
      'gradientColors': [Color(0xFF7C3AED), Color(0xFF4F46E5)],
      'count': '1,800+',
    },
    {
      'label': 'Lehengas',
      'icon': '💃',
      'description': 'Bridal, Party, Festive',
      'gradientColors': [Color(0xFFF97316), Color(0xFFEA580C)],
      'count': '950+',
    },
    {
      'label': 'Tops & Tees',
      'icon': '👚',
      'description': 'Casual, Formal & Western',
      'gradientColors': [Color(0xFF0EA5E9), Color(0xFF0284C7)],
      'count': '3,100+',
    },
    {
      'label': 'Jeans & Trousers',
      'icon': '👖',
      'description': 'Slim, Wide, Bootcut & more',
      'gradientColors': [Color(0xFF1D4ED8), Color(0xFF1E40AF)],
      'count': '1,200+',
    },
    {
      'label': 'Ethnic Sets',
      'icon': '🪡',
      'description': 'Coord sets, Sharara, Dhoti',
      'gradientColors': [Color(0xFFD97706), Color(0xFFB45309)],
      'count': '860+',
    },
    {
      'label': 'Western Wear',
      'icon': '✨',
      'description': 'Dresses, Skirts, Jumpsuits',
      'gradientColors': [Color(0xFF059669), Color(0xFF047857)],
      'count': '2,200+',
    },
    {
      'label': 'Bridal Collection',
      'icon': '👰',
      'description': 'Heavy Lehengas, Sarees & Sets',
      'gradientColors': [Color(0xFFDC2626), Color(0xFFB91C1C)],
      'count': '540+',
    },
    {
      'label': "Men's Wear",
      'icon': '👔',
      'description': 'Sherwanis, Kurtas, Shirts',
      'gradientColors': [Color(0xFF374151), Color(0xFF1F2937)],
      'count': '1,600+',
    },
    {
      'label': "Kids' Fashion",
      'icon': '🎀',
      'description': 'Ethnic, Western & School',
      'gradientColors': [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
      'count': '900+',
    },
    {
      'label': 'Accessories',
      'icon': '💍',
      'description': 'Jewellery, Bags, Footwear',
      'gradientColors': [Color(0xFFC9A24A), Color(0xFF92630F)],
      'count': '1,400+',
    },
    {
      'label': 'Home & Festive',
      'icon': '🏮',
      'description': 'Décor, Gifting & Celebration',
      'gradientColors': [Color(0xFFE11D48), Color(0xFF9F1239)],
      'count': '680+',
    },
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: _neutral50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Categories',
          style: TextStyle(
            color: _navy800,
            fontWeight: FontWeight.w800,
            fontSize: 20,
            letterSpacing: -0.3,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFFE5E7EB)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: _navy800),
            onPressed: () => context.push('/search'),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [_navy800, Color(0xFF6D1B5C), _magenta600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Shop by Category',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Discover curated fashion from verified local boutiques',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('🛍️', style: TextStyle(fontSize: 24)),
                ),
              ],
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 10,
                childAspectRatio: 1.1,
              ),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                return _buildCategoryTile(context, _categories[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryTile(
      BuildContext context, Map<String, dynamic> category) {
    final colors = category['gradientColors'] as List<Color>;

    return GestureDetector(
      onTap: () {
        context.push(
            '/products?category=${Uri.encodeComponent(category['label'] as String)}');
      },
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: colors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: colors[0].withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Background decoration
            Positioned(
              right: -15,
              bottom: -15,
              child: Opacity(
                opacity: 0.12,
                child: Text(
                  category['icon'] as String,
                  style: const TextStyle(fontSize: 80),
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(
                        category['icon'] as String,
                        style: const TextStyle(fontSize: 28),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        category['label'] as String,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        category['description'] as String,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 10,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${category['count']} items',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
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
}
