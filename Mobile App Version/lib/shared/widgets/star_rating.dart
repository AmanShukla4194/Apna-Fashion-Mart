import 'package:flutter/material.dart';

import '../../core/theme/afm_theme.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final int maxStars;
  final double size;
  final Color? filledColor;
  final Color? emptyColor;
  final ValueChanged<int>? onRatingChanged;
  final bool showLabel;

  const StarRating({
    super.key,
    required this.rating,
    this.maxStars = 5,
    this.size = 20,
    this.filledColor,
    this.emptyColor,
    this.onRatingChanged,
    this.showLabel = false,
  });

  @override
  Widget build(BuildContext context) {
    final filled = filledColor ?? AfmColors.gold500;
    final empty = emptyColor ?? AfmColors.neutral300;
    final isInteractive = onRatingChanged != null;

    final stars = List.generate(maxStars, (index) {
      final starValue = index + 1;
      final isFull = rating >= starValue;
      final isHalf = !isFull && rating >= starValue - 0.5;

      IconData iconData;
      Color color;

      if (isFull) {
        iconData = Icons.star_rounded;
        color = filled;
      } else if (isHalf) {
        iconData = Icons.star_half_rounded;
        color = filled;
      } else {
        iconData = Icons.star_outline_rounded;
        color = empty;
      }

      final star = Icon(iconData, size: size, color: color);

      if (isInteractive) {
        return GestureDetector(
          onTap: () => onRatingChanged!(starValue),
          child: star,
        );
      }

      return star;
    });

    final row = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...stars,
        if (showLabel) ...[
          const SizedBox(width: 4),
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: size * 0.7,
              fontWeight: FontWeight.w600,
              color: AfmColors.neutral700,
            ),
          ),
        ],
      ],
    );

    return row;
  }
}
