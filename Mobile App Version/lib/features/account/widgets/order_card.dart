import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/features/account/orders_screen.dart';
import 'package:apna_fashion_mart/features/account/widgets/tracking_timeline.dart';

class OrderCard extends StatefulWidget {
  const OrderCard({super.key, required this.order});

  final OrderModel order;

  @override
  State<OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends State<OrderCard> {
  bool _timelineExpanded = false;

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ────────────────────────────────────────────────────────
          _OrderHeader(order: order),

          const Divider(height: 1),

          // ── Product row ───────────────────────────────────────────────────
          _ProductRow(order: order),

          // ── Tracking status line ─────────────────────────────────────────
          _TrackingStatusLine(order: order),

          const Divider(height: 1),

          // ── Action buttons ────────────────────────────────────────────────
          _ActionButtons(
            order: order,
            onToggleTimeline: () =>
                setState(() => _timelineExpanded = !_timelineExpanded),
            timelineExpanded: _timelineExpanded,
          ),

          // ── Expandable timeline ──────────────────────────────────────────
          if (_timelineExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: TrackingTimeline(steps: order.trackingSteps),
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

class _OrderHeader extends StatelessWidget {
  const _OrderHeader({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.id,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: Color(0xFF1A1A2E),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  DateFormat('dd MMM yyyy').format(order.date),
                  style: TextStyle(color: Colors.grey[500], fontSize: 12),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${_formatAmount(order.total)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppColors.navy800,
                ),
              ),
              const SizedBox(height: 4),
              _StatusBadge(status: order.status),
            ],
          ),
        ],
      ),
    );
  }

  String _formatAmount(double amount) {
    if (amount == amount.truncateToDouble()) {
      return amount.toInt().toString();
    }
    return amount.toStringAsFixed(2);
  }
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final OrderStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, bg, fg) = _config(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fg,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  (String, Color, Color) _config(OrderStatus s) {
    switch (s) {
      case OrderStatus.processing:
        return ('Processing', const Color(0xFFFFF3CD), const Color(0xFF856404));
      case OrderStatus.inTransit:
        return ('In Transit', const Color(0xFFCCE5FF), const Color(0xFF004085));
      case OrderStatus.delivered:
        return ('Delivered', const Color(0xFFD4EDDA), const Color(0xFF155724));
      case OrderStatus.cancelled:
        return ('Cancelled', const Color(0xFFF8D7DA), const Color(0xFF721C24));
    }
  }
}

// ---------------------------------------------------------------------------
// Product row
// ---------------------------------------------------------------------------

class _ProductRow extends StatelessWidget {
  const _ProductRow({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thumbnail
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFF0F0F0),
              borderRadius: BorderRadius.circular(10),
            ),
            child: order.thumbnailUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      order.thumbnailUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          const _PlaceholderThumb(),
                    ),
                  )
                : const _PlaceholderThumb(),
          ),
          const SizedBox(width: 12),
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.productName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: Color(0xFF1A1A2E),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  order.storeName,
                  style: TextStyle(color: Colors.grey[500], fontSize: 12),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    _Tag(label: 'Qty: ${order.quantity}'),
                    if (order.size != null) ...[
                      const SizedBox(width: 6),
                      _Tag(label: 'Size: ${order.size}'),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PlaceholderThumb extends StatelessWidget {
  const _PlaceholderThumb();
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Icon(
        Icons.checkroom,
        color: Colors.grey[300],
        size: 32,
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.label});
  final String label;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F0F0),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 11, color: Color(0xFF555555)),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tracking status line
// ---------------------------------------------------------------------------

class _TrackingStatusLine extends StatelessWidget {
  const _TrackingStatusLine({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    final (icon, text, color) = _statusInfo(order.status);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  (IconData, String, Color) _statusInfo(OrderStatus s) {
    switch (s) {
      case OrderStatus.processing:
        return (Icons.hourglass_top_outlined, 'Order is being processed',
            const Color(0xFF856404));
      case OrderStatus.inTransit:
        return (Icons.local_shipping_outlined,
            'Your order is out for delivery', const Color(0xFF004085));
      case OrderStatus.delivered:
        return (Icons.check_circle_outline, 'Delivered successfully',
            const Color(0xFF155724));
      case OrderStatus.cancelled:
        return (Icons.cancel_outlined, 'Order has been cancelled',
            const Color(0xFF721C24));
    }
  }
}

// ---------------------------------------------------------------------------
// Action buttons
// ---------------------------------------------------------------------------

class _ActionButtons extends StatelessWidget {
  const _ActionButtons({
    required this.order,
    required this.onToggleTimeline,
    required this.timelineExpanded,
  });

  final OrderModel order;
  final VoidCallback onToggleTimeline;
  final bool timelineExpanded;

  @override
  Widget build(BuildContext context) {
    final buttons = _buildButtons(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          // Timeline toggle
          TextButton.icon(
            onPressed: onToggleTimeline,
            icon: Icon(
              timelineExpanded
                  ? Icons.keyboard_arrow_up
                  : Icons.keyboard_arrow_down,
              size: 18,
            ),
            label: Text(
              timelineExpanded ? 'Hide timeline' : 'View timeline',
              style: const TextStyle(fontSize: 12),
            ),
            style: TextButton.styleFrom(
              foregroundColor: Colors.grey[600],
              padding: const EdgeInsets.symmetric(horizontal: 4),
            ),
          ),
          const Spacer(),
          ...buttons,
        ],
      ),
    );
  }

  List<Widget> _buildButtons(BuildContext context) {
    switch (order.status) {
      case OrderStatus.processing:
      case OrderStatus.inTransit:
        return [
          _ActionBtn(
            label: 'Track',
            icon: Icons.location_on_outlined,
            onTap: () => context.push('/account/orders/${order.id}'),
            primary: true,
          ),
        ];
      case OrderStatus.delivered:
        return [
          _ActionBtn(
            label: 'Return',
            icon: Icons.assignment_return_outlined,
            onTap: () => context.push('/account/returns'),
            primary: false,
          ),
          const SizedBox(width: 8),
          _ActionBtn(
            label: 'Rate',
            icon: Icons.star_outline,
            onTap: () {},
            primary: true,
          ),
        ];
      case OrderStatus.cancelled:
        return [
          _ActionBtn(
            label: 'Buy Again',
            icon: Icons.refresh,
            onTap: () {},
            primary: true,
          ),
        ];
    }
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({
    required this.label,
    required this.icon,
    required this.onTap,
    required this.primary,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    if (primary) {
      return ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 14),
        label: Text(label, style: const TextStyle(fontSize: 12)),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.magenta600,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          minimumSize: Size.zero,
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
      );
    }
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 14),
      label: Text(label, style: const TextStyle(fontSize: 12)),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.navy800,
        side: BorderSide(color: AppColors.navy800.withValues(alpha: 0.4)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }
}
