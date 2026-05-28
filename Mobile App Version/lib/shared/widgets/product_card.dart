import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../core/providers/wishlist_provider.dart';
import '../../core/theme/afm_theme.dart';
import '../../models/product_model.dart';

class ProductCard extends ConsumerWidget {
  final ProductModel product;
  final double? width;
  final bool showStore;

  const ProductCard({
    super.key,
    required this.product,
    this.width,
    this.showStore = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isWishlisted = ref.watch(isWishlistedProvider(product.id));

    return GestureDetector(
      onTap: () => context.push('/product/${product.id}'),
      child: Container(
        width: width,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AfmColors.neutral200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 12,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image section
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 3 / 4,
                  child: CachedNetworkImage(
                    imageUrl: product.imageUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Shimmer.fromColors(
                      baseColor: AfmColors.neutral200,
                      highlightColor: AfmColors.neutral100,
                      child: Container(color: AfmColors.neutral200),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: AfmColors.neutral100,
                      child: const Icon(
                        Icons.image_not_supported_outlined,
                        color: AfmColors.neutral400,
                        size: 40,
                      ),
                    ),
                  ),
                ),

                // Discount badge
                if (product.oldPrice != null && product.oldPrice! > product.price)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AfmColors.magenta600, Color(0xFFD4006A)],
                        ),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${_discountPercent(product.price, product.oldPrice!)}% OFF',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),

                // Verified badge
                if (product.isVerified)
                  Positioned(
                    top: 8,
                    right: 44,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AfmColors.verified500,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.verified,
                        color: Colors.white,
                        size: 12,
                      ),
                    ),
                  ),

                // Wishlist button
                Positioned(
                  top: 6,
                  right: 6,
                  child: _WishlistButton(
                    productId: product.id,
                    isWishlisted: isWishlisted,
                  ),
                ),
              ],
            ),

            // Info section
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (showStore && product.store.isNotEmpty) ...[
                    Text(
                      product.store,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AfmColors.neutral500,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                  ],
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AfmColors.neutral900,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(
                        '₹${product.price}',
                        style: const TextStyle(
                          fontSize: 15,
                          color: AfmColors.navy800,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (product.oldPrice != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          '₹${product.oldPrice}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AfmColors.neutral400,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        color: AfmColors.gold500,
                        size: 14,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        product.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AfmColors.neutral700,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        ' (${product.reviewCount})',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AfmColors.neutral400,
                        ),
                      ),
                      if (product.distance != null) ...[
                        const Spacer(),
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on_outlined,
                              size: 11,
                              color: AfmColors.neutral400,
                            ),
                            Text(
                              product.distance!,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AfmColors.neutral400,
                              ),
                            ),
                          ],
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

  int _discountPercent(int price, int oldPrice) {
    if (oldPrice <= 0) return 0;
    return (((oldPrice - price) / oldPrice) * 100).round();
  }
}

// ---------------------------------------------------------------------------
// Wishlist heart button
// ---------------------------------------------------------------------------
class _WishlistButton extends ConsumerWidget {
  final String productId;
  final bool isWishlisted;

  const _WishlistButton({
    required this.productId,
    required this.isWishlisted,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () {
        ref.read(wishlistProvider.notifier).toggleProduct(productId);
      },
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(230),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(25),
              blurRadius: 6,
            ),
          ],
        ),
        child: Icon(
          isWishlisted ? Icons.favorite : Icons.favorite_border,
          size: 16,
          color: isWishlisted ? AfmColors.magenta600 : AfmColors.neutral500,
        ),
      ),
    );
  }
}
