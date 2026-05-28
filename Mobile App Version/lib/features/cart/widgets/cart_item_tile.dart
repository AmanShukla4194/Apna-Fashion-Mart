import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/models/cart_item_model.dart';

class CartItemTile extends StatelessWidget {
  final CartItemModel item;
  final void Function(int qty) onQuantityChanged;
  final VoidCallback onRemove;

  const CartItemTile({
    super.key,
    required this.item,
    required this.onQuantityChanged,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey('${item.productId}_${item.size}_${item.color}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.red[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.red[200]!),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.delete_outline_rounded, color: Colors.red[600], size: 28),
            const SizedBox(height: 4),
            Text('Remove', style: TextStyle(fontSize: 11, color: Colors.red[600], fontWeight: FontWeight.w600)),
          ],
        ),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Text('Remove item?'),
            content: Text('Remove "${item.name}" from your bag?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Keep', style: TextStyle(color: AfmColors.neutral500))),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Remove', style: TextStyle(color: Colors.red[700]))),
            ],
          ),
        ) ?? false;
      },
      onDismissed: (_) => onRemove(),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: item.imageUrl,
                width: 80, height: 100, fit: BoxFit.cover,
                placeholder: (_, __) => Container(width: 80, height: 100, color: AfmColors.neutral100, child: const Icon(Icons.image_outlined, color: AfmColors.neutral500)),
                errorWidget: (_, __, ___) => Container(width: 80, height: 100, color: AfmColors.neutral100, child: const Icon(Icons.image_not_supported_outlined, color: AfmColors.neutral500)),
              ),
            ),
            const SizedBox(width: 12),

            // Product details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.store, style: const TextStyle(fontSize: 11, color: AfmColors.neutral500, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 3),
                  Text(
                    item.name,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AfmColors.navy800, height: 1.3),
                    maxLines: 2, overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Size and color
                  Row(
                    children: [
                      if (item.size.isNotEmpty) ...[
                        _BadgeChip(label: item.size),
                        const SizedBox(width: 6),
                      ],
                      if (item.color.isNotEmpty) ...[
                        _ColorDot(colorName: item.color),
                        const SizedBox(width: 4),
                        Text(item.color, style: const TextStyle(fontSize: 11, color: AfmColors.neutral500)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Price and quantity row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Price
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '₹${item.price * item.quantity}',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AfmColors.navy800),
                          ),
                          if (item.quantity > 1)
                            Text('₹${item.price} each', style: const TextStyle(fontSize: 10, color: AfmColors.neutral500)),
                        ],
                      ),

                      // Quantity counter
                      Row(
                        children: [
                          _QtyButton(
                            icon: Icons.remove,
                            onTap: item.quantity > 1 ? () => onQuantityChanged(item.quantity - 1) : null,
                            onLongTap: onRemove,
                          ),
                          Container(
                            width: 32, height: 32,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AfmColors.neutral50,
                              border: Border.all(color: AfmColors.neutral200),
                            ),
                            child: Text('${item.quantity}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
                          ),
                          _QtyButton(
                            icon: Icons.add,
                            onTap: item.quantity < 10 ? () => onQuantityChanged(item.quantity + 1) : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Remove icon
            GestureDetector(
              onTap: onRemove,
              child: const Padding(
                padding: EdgeInsets.only(left: 4),
                child: Icon(Icons.delete_outline_rounded, size: 20, color: AfmColors.neutral500),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BadgeChip extends StatelessWidget {
  final String label;
  const _BadgeChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AfmColors.neutral100,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AfmColors.neutral200),
      ),
      child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AfmColors.neutral700)),
    );
  }
}

class _ColorDot extends StatelessWidget {
  final String colorName;
  const _ColorDot({required this.colorName});

  Color _parseColor(String name) {
    const colorMap = <String, Color>{
      'red': Colors.red,
      'blue': Colors.blue,
      'green': Colors.green,
      'yellow': Colors.yellow,
      'pink': Colors.pink,
      'purple': Colors.purple,
      'orange': Colors.orange,
      'black': Colors.black,
      'white': Colors.white,
      'grey': Colors.grey,
      'gray': Colors.grey,
      'navy': AfmColors.navy800,
      'magenta': AfmColors.magenta600,
      'golden': AfmColors.gold500,
      'maroon': Color(0xFF800000),
      'teal': Colors.teal,
      'brown': Colors.brown,
    };
    return colorMap[name.toLowerCase()] ?? Colors.grey;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 14, height: 14,
      decoration: BoxDecoration(
        color: _parseColor(colorName),
        shape: BoxShape.circle,
        border: Border.all(color: AfmColors.neutral200, width: 1),
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final VoidCallback? onLongTap;

  const _QtyButton({required this.icon, this.onTap, this.onLongTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      onLongPress: onLongTap,
      child: Container(
        width: 32, height: 32,
        decoration: BoxDecoration(
          color: onTap != null ? Colors.white : AfmColors.neutral100,
          border: Border.all(color: AfmColors.neutral200),
        ),
        child: Icon(icon, size: 16, color: onTap != null ? AfmColors.navy800 : AfmColors.neutral500),
      ),
    );
  }
}
