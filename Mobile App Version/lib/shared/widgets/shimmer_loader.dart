import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../core/theme/afm_theme.dart';

// ---------------------------------------------------------------------------
// Generic shimmer container
// ---------------------------------------------------------------------------
class ShimmerLoader extends StatelessWidget {
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;

  const ShimmerLoader({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AfmColors.neutral200,
      highlightColor: AfmColors.neutral100,
      child: Container(
        width: width,
        height: height ?? 16,
        decoration: BoxDecoration(
          color: AfmColors.neutral200,
          borderRadius: borderRadius ?? BorderRadius.circular(8),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Product card shimmer – matches ProductCard layout
// ---------------------------------------------------------------------------
class ShimmerProductCard extends StatelessWidget {
  final double? width;

  const ShimmerProductCard({super.key, this.width});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AfmColors.neutral200,
      highlightColor: AfmColors.neutral100,
      child: Container(
        width: width,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AfmColors.neutral200),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image placeholder
            AspectRatio(
              aspectRatio: 3 / 4,
              child: Container(color: AfmColors.neutral200),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Store name
                  Container(
                    height: 11,
                    width: 80,
                    decoration: BoxDecoration(
                      color: AfmColors.neutral200,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Product name line 1
                  Container(
                    height: 13,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AfmColors.neutral200,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Product name line 2
                  Container(
                    height: 13,
                    width: 100,
                    decoration: BoxDecoration(
                      color: AfmColors.neutral200,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Price
                  Container(
                    height: 15,
                    width: 60,
                    decoration: BoxDecoration(
                      color: AfmColors.neutral200,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 6),
                  // Rating
                  Container(
                    height: 12,
                    width: 90,
                    decoration: BoxDecoration(
                      color: AfmColors.neutral200,
                      borderRadius: BorderRadius.circular(4),
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

// ---------------------------------------------------------------------------
// Horizontal product grid shimmer
// ---------------------------------------------------------------------------
class ShimmerProductGrid extends StatelessWidget {
  final int crossAxisCount;
  final int itemCount;
  final double childAspectRatio;

  const ShimmerProductGrid({
    super.key,
    this.crossAxisCount = 2,
    this.itemCount = 6,
    this.childAspectRatio = 0.6,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: childAspectRatio,
      ),
      itemCount: itemCount,
      itemBuilder: (_, __) => const ShimmerProductCard(),
    );
  }
}

// ---------------------------------------------------------------------------
// Horizontal product list shimmer
// ---------------------------------------------------------------------------
class ShimmerProductList extends StatelessWidget {
  final int itemCount;
  final double itemWidth;
  final double height;

  const ShimmerProductList({
    super.key,
    this.itemCount = 4,
    this.itemWidth = 160,
    this.height = 280,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: itemCount,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, __) => ShimmerProductCard(width: itemWidth),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Generic list shimmer (rows of text lines)
// ---------------------------------------------------------------------------
class ShimmerList extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const ShimmerList({
    super.key,
    this.itemCount = 5,
    this.itemHeight = 72,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: itemCount,
      separatorBuilder: (_, __) =>
          const Divider(height: 1, color: AfmColors.neutral200),
      itemBuilder: (_, __) => Shimmer.fromColors(
        baseColor: AfmColors.neutral200,
        highlightColor: AfmColors.neutral100,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AfmColors.neutral200,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 14,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AfmColors.neutral200,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 12,
                      width: 160,
                      decoration: BoxDecoration(
                        color: AfmColors.neutral200,
                        borderRadius: BorderRadius.circular(4),
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
  }
}
