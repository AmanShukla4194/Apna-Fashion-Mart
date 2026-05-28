import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/core/providers/wishlist_provider.dart';
import 'package:apna_fashion_mart/core/providers/cart_provider.dart';
import 'package:apna_fashion_mart/models/cart_item_model.dart';

// ---------------------------------------------------------------------------
// Minimal product data for wishlist display
// TODO: fetch via ApiService.instance.getProducts() filtered by wishlist IDs
// ---------------------------------------------------------------------------

class _WishlistProduct {
  final String productId;
  final String name;
  final String store;
  final String imageUrl;
  final int price;

  const _WishlistProduct({
    required this.productId,
    required this.name,
    required this.store,
    required this.imageUrl,
    required this.price,
  });
}

// Sample product lookup. In production this would be a real DB fetch.
final _sampleProducts = <String, _WishlistProduct>{
  '1': const _WishlistProduct(productId: '1', name: 'Floral Silk Kurta', store: 'Zara Boutique', imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300', price: 2499),
  '2': const _WishlistProduct(productId: '2', name: 'Block Print Dupatta', store: 'Ethnic Closet', imageUrl: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=300', price: 699),
  '3': const _WishlistProduct(productId: '3', name: 'Cotton Palazzo Set', store: 'Bridal Bazaar', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300', price: 1599),
  '4': const _WishlistProduct(productId: '4', name: 'Designer Anarkali', store: 'Fashion Hub', imageUrl: 'https://images.unsplash.com/photo-1631216516726-e98a4bbf64f2?w=300', price: 3299),
  '5': const _WishlistProduct(productId: '5', name: 'Banarasi Silk Saree', store: 'Saree Palace', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300', price: 4999),
  '6': const _WishlistProduct(productId: '6', name: 'Printed Kurti', store: 'Ethnic Closet', imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300', price: 799),
};

_WishlistProduct _getProduct(String productId) {
  return _sampleProducts[productId] ??
      _WishlistProduct(
        productId: productId,
        name: 'Product #$productId',
        store: 'Boutique',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300',
        price: 999,
      );
}

// ---------------------------------------------------------------------------
// WishlistScreen
// ---------------------------------------------------------------------------

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productIds = ref.watch(wishlistProvider);
    final count = productIds.length;

    return Scaffold(
      backgroundColor: AfmColors.neutral50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Text(
          count == 0 ? 'My Wishlist' : 'My Wishlist ($count)',
          style: const TextStyle(fontWeight: FontWeight.w700, color: AfmColors.navy800),
        ),
        actions: [
          if (productIds.isNotEmpty)
            TextButton.icon(
              onPressed: () => _moveAllToCart(context, ref, productIds),
              icon: const Icon(Icons.shopping_bag_outlined, size: 18, color: AfmColors.magenta600),
              label: const Text(
                'Move all',
                style: TextStyle(color: AfmColors.magenta600, fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
      body: productIds.isEmpty
          ? _buildEmptyWishlist(context)
          : _buildGrid(context, ref, productIds),
    );
  }

  void _moveAllToCart(BuildContext context, WidgetRef ref, List<String> productIds) {
    final notifier = ref.read(cartProvider.notifier);
    for (final id in productIds) {
      final p = _getProduct(id);
      notifier.addItem(CartItemModel(
        productId: p.productId,
        name: p.name,
        store: p.store,
        storeId: '',
        imageUrl: p.imageUrl,
        price: p.price,
        size: 'M',
        color: 'Default',
        quantity: 1,
      ));
    }
    ref.read(wishlistProvider.notifier).clearWishlist();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${productIds.length} items moved to your bag!'),
        backgroundColor: AfmColors.navy800,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        action: SnackBarAction(
          label: 'View Bag',
          textColor: AfmColors.gold500,
          onPressed: () => context.push('/cart'),
        ),
      ),
    );
  }

  Widget _buildEmptyWishlist(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120, height: 120,
              decoration: const BoxDecoration(color: AfmColors.magenta100, shape: BoxShape.circle),
              child: const Icon(Icons.favorite_border_rounded, size: 56, color: AfmColors.magenta600),
            ),
            const SizedBox(height: 24),
            const Text(
              'Your wishlist is empty',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AfmColors.navy800),
            ),
            const SizedBox(height: 8),
            const Text(
              'Save your favourite items here and never lose track of styles you love.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: AfmColors.neutral500, height: 1.5),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AfmColors.navy800, Color(0xFF6D1B5C), AfmColors.magenta600],
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: ElevatedButton(
                  onPressed: () => context.go('/nearby'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text(
                    'Browse Boutiques',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGrid(BuildContext context, WidgetRef ref, List<String> productIds) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.65,
      ),
      itemCount: productIds.length,
      itemBuilder: (context, index) {
        final productId = productIds[index];
        final product = _getProduct(productId);
        return _WishlistProductCard(
          product: product,
          onAddToCart: () {
            ref.read(cartProvider.notifier).addItem(CartItemModel(
              productId: product.productId,
              name: product.name,
              store: product.store,
              storeId: '',
              imageUrl: product.imageUrl,
              price: product.price,
              size: 'M',
              color: 'Default',
              quantity: 1,
            ));
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${product.name} added to bag'),
                backgroundColor: AfmColors.navy800,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            );
          },
          onRemove: () => ref.read(wishlistProvider.notifier).removeProduct(productId),
          onShare: () => Share.share(
            'Check out "${product.name}" from ${product.store} on Apna Fashion Mart!\n'
            '₹${product.price}\nhttps://apnafashionmart.in/product/${product.productId}',
          ),
          onTap: () => context.push('/product/$productId'),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Wishlist product card
// ---------------------------------------------------------------------------

class _WishlistProductCard extends StatefulWidget {
  final _WishlistProduct product;
  final VoidCallback onAddToCart;
  final VoidCallback onRemove;
  final VoidCallback onShare;
  final VoidCallback onTap;

  const _WishlistProductCard({
    required this.product,
    required this.onAddToCart,
    required this.onRemove,
    required this.onShare,
    required this.onTap,
  });

  @override
  State<_WishlistProductCard> createState() => _WishlistProductCardState();
}

class _WishlistProductCardState extends State<_WishlistProductCard> {
  bool _addedToCart = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onLongPress: () => _showShareMenu(context),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    child: CachedNetworkImage(
                      imageUrl: widget.product.imageUrl,
                      width: double.infinity, fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AfmColors.neutral100, child: const Center(child: Icon(Icons.image_outlined, size: 40, color: AfmColors.neutral500))),
                      errorWidget: (_, __, ___) => Container(color: AfmColors.neutral100, child: const Center(child: Icon(Icons.image_not_supported_outlined, size: 40, color: AfmColors.neutral500))),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.product.store, style: const TextStyle(fontSize: 10, color: AfmColors.neutral500, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 2),
                      Text(widget.product.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AfmColors.navy800, height: 1.3), maxLines: 2, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text('₹${widget.product.price}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AfmColors.navy800)),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity, height: 34,
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() => _addedToCart = true);
                            widget.onAddToCart();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _addedToCart ? AfmColors.neutral200 : AfmColors.magenta600,
                            foregroundColor: _addedToCart ? AfmColors.neutral700 : Colors.white,
                            padding: EdgeInsets.zero,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                          child: Text(
                            _addedToCart ? 'Added ✓' : 'Add to Bag',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            // Remove heart
            Positioned(
              top: 8, right: 8,
              child: GestureDetector(
                onTap: widget.onRemove,
                child: Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 6, offset: const Offset(0, 2))],
                  ),
                  child: const Icon(Icons.favorite_rounded, color: AfmColors.magenta600, size: 18),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showShareMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AfmColors.neutral200, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.share_outlined, color: AfmColors.navy800),
              title: const Text('Share this product'),
              onTap: () { Navigator.pop(context); widget.onShare(); },
            ),
            ListTile(
              leading: const Icon(Icons.shopping_bag_outlined, color: AfmColors.magenta600),
              title: const Text('Add to Bag'),
              onTap: () { Navigator.pop(context); widget.onAddToCart(); },
            ),
            ListTile(
              leading: Icon(Icons.delete_outline_rounded, color: Colors.red[600]),
              title: const Text('Remove from Wishlist'),
              onTap: () { Navigator.pop(context); widget.onRemove(); },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
