import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/features/nearby/nearby_screen.dart';

class ShopCard extends StatelessWidget {
  final NearbyShop shop;
  final VoidCallback onTap;

  const ShopCard({
    super.key,
    required this.shop,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shop image
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(left: Radius.circular(14)),
              child: CachedNetworkImage(
                imageUrl: shop.imageUrl,
                width: 110,
                height: 130,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(
                  width: 110,
                  height: 130,
                  color: AfmColors.neutral100,
                  child: const Icon(Icons.store_outlined, size: 36, color: AfmColors.neutral500),
                ),
                errorWidget: (_, __, ___) => Container(
                  width: 110,
                  height: 130,
                  color: AfmColors.neutral100,
                  child: const Icon(Icons.store_outlined, size: 36, color: AfmColors.neutral500),
                ),
              ),
            ),

            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Name row with verified badge
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            shop.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AfmColors.navy800,
                              height: 1.3,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (shop.isVerified) ...[
                          const SizedBox(width: 6),
                          const Icon(
                            Icons.verified,
                            size: 18,
                            color: AfmColors.verified500,
                          ),
                        ],
                      ],
                    ),

                    const SizedBox(height: 6),

                    // Rating and distance
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, size: 14, color: AfmColors.gold500),
                        const SizedBox(width: 3),
                        Text(
                          '${shop.rating}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AfmColors.neutral700,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          width: 3, height: 3,
                          decoration: const BoxDecoration(
                            color: AfmColors.neutral500,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.location_on_outlined, size: 13, color: AfmColors.neutral500),
                        const SizedBox(width: 2),
                        Text(
                          '${shop.distanceKm} km',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AfmColors.neutral500,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 6),

                    // Open/Closed + hours
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: shop.isOpen
                                ? const Color(0xFFF0FDF4)
                                : const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            shop.isOpen ? 'Open' : 'Closed',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: shop.isOpen
                                  ? const Color(0xFF16A34A)
                                  : Colors.red[600],
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            shop.hours,
                            style: const TextStyle(
                              fontSize: 10,
                              color: AfmColors.neutral500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    // Tags (max 3)
                    Wrap(
                      spacing: 5,
                      runSpacing: 4,
                      children: shop.tags.take(3).map((tag) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AfmColors.magenta100,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          tag,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AfmColors.magenta600,
                          ),
                        ),
                      )).toList(),
                    ),

                    const SizedBox(height: 10),

                    // Browse products button
                    SizedBox(
                      width: double.infinity,
                      height: 34,
                      child: ElevatedButton.icon(
                        onPressed: onTap,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AfmColors.navy800,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.storefront_outlined, size: 14, color: Colors.white),
                        label: Text(
                          'Browse ${shop.productCount}+ Products',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
