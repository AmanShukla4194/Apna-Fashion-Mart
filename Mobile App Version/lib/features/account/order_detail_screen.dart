import 'package:flutter/material.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/features/account/orders_screen.dart';
import 'package:apna_fashion_mart/features/account/widgets/tracking_timeline.dart';

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key, required this.orderId});

  final String orderId;

  OrderModel? get _order {
    try {
      return _mockOrders.firstWhere((o) => o.id == orderId);
    } catch (_) {
      return null;
    }
  }

  // Mock orders inline (reuse from orders_screen data)
  static final List<OrderModel> _mockOrders = [
    OrderModel(
      id: 'AFM-ORD-2845-X9K2',
      date: DateTime(2026, 5, 14),
      status: OrderStatus.delivered,
      total: 4899,
      productName: 'Banarasi Silk Saree',
      storeName: 'Aanya Atelier',
      quantity: 1,
      size: 'Free Size',
      trackingSteps: const [
        TrackingStep(
            label: 'Placed',
            stepStatus: StepStatus.done,
            timestamp: '14 May, 10:02 AM'),
        TrackingStep(
            label: 'Confirmed',
            stepStatus: StepStatus.done,
            timestamp: '14 May, 10:15 AM'),
        TrackingStep(
            label: 'Packed',
            stepStatus: StepStatus.done,
            timestamp: '14 May, 3:00 PM'),
        TrackingStep(
            label: 'Out for Delivery',
            stepStatus: StepStatus.done,
            timestamp: '15 May, 8:30 AM'),
        TrackingStep(
            label: 'Delivered',
            stepStatus: StepStatus.done,
            timestamp: '15 May, 12:45 PM'),
      ],
    ),
    OrderModel(
      id: 'AFM-ORD-2839-A4N7',
      date: DateTime(2026, 5, 13),
      status: OrderStatus.inTransit,
      total: 2199,
      productName: 'Anarkali Suit Set',
      storeName: 'Priya Fashions',
      quantity: 1,
      size: 'M',
      trackingSteps: const [
        TrackingStep(
            label: 'Placed',
            stepStatus: StepStatus.done,
            timestamp: '13 May, 2:10 PM'),
        TrackingStep(
            label: 'Confirmed',
            stepStatus: StepStatus.done,
            timestamp: '13 May, 2:30 PM'),
        TrackingStep(
            label: 'Packed',
            stepStatus: StepStatus.done,
            timestamp: '14 May, 11:00 AM'),
        TrackingStep(
            label: 'Out for Delivery',
            stepStatus: StepStatus.current,
            timestamp: 'Today'),
        TrackingStep(label: 'Delivered', stepStatus: StepStatus.pending),
      ],
    ),
    OrderModel(
      id: 'AFM-ORD-2820-K3M1',
      date: DateTime(2026, 5, 8),
      status: OrderStatus.processing,
      total: 1499,
      productName: 'Cotton Kurti',
      storeName: 'Loom & Craft',
      quantity: 2,
      size: 'L',
      trackingSteps: const [
        TrackingStep(
            label: 'Placed',
            stepStatus: StepStatus.done,
            timestamp: '8 May, 6:45 PM'),
        TrackingStep(
            label: 'Confirmed',
            stepStatus: StepStatus.current,
            timestamp: '9 May, 9:00 AM'),
        TrackingStep(label: 'Packed', stepStatus: StepStatus.pending),
        TrackingStep(
            label: 'Out for Delivery', stepStatus: StepStatus.pending),
        TrackingStep(label: 'Delivered', stepStatus: StepStatus.pending),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final order = _order;

    if (order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Order Details')),
        body: const Center(child: Text('Order not found')),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppColors.navy800,
        foregroundColor: Colors.white,
        title: Text(
          order.id,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Tracking timeline ──────────────────────────────────────────
            _Section(
              title: 'Order Tracking',
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: TrackingTimeline(steps: order.trackingSteps),
              ),
            ),
            const SizedBox(height: 16),

            // ── Map preview for in-transit ─────────────────────────────────
            if (order.status == OrderStatus.inTransit)
              _MapPreview(),

            if (order.status == OrderStatus.inTransit)
              const SizedBox(height: 16),

            // ── Order items ────────────────────────────────────────────────
            _Section(
              title: 'Order Items',
              child: _ItemsList(order: order),
            ),
            const SizedBox(height: 16),

            // ── Price breakdown ────────────────────────────────────────────
            _Section(
              title: 'Price Breakdown',
              child: _PriceBreakdown(order: order),
            ),
            const SizedBox(height: 16),

            // ── Delivery address ───────────────────────────────────────────
            _Section(
              title: 'Delivery Address',
              child: _DeliveryAddress(),
            ),
            const SizedBox(height: 16),

            // ── Payment method ─────────────────────────────────────────────
            _Section(
              title: 'Payment Method',
              child: _PaymentMethod(),
            ),
            const SizedBox(height: 24),

            // ── Action buttons ─────────────────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _downloadInvoice,
                    icon: const Icon(Icons.download_outlined, size: 18),
                    label: const Text('Download Invoice'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.navy800,
                      side: const BorderSide(color: AppColors.navy800),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _reportIssue(context),
                    icon: const Icon(Icons.help_outline, size: 18),
                    label: const Text('Help / Report'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.magenta600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  void _downloadInvoice() {
    // Invoice download logic
  }

  void _reportIssue(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _ReportIssueSheet(),
    );
  }
}

// ---------------------------------------------------------------------------
// Map preview (mocked)
// ---------------------------------------------------------------------------

class _MapPreview extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        children: [
          // Mock map background
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.network(
              'https://tile.openstreetmap.org/12/0/0.png',
              fit: BoxFit.cover,
              width: double.infinity,
              errorBuilder: (_, __, ___) => Container(
                color: const Color(0xFFE8F4E8),
                child: Center(
                  child: Icon(
                    Icons.map_outlined,
                    size: 48,
                    color: Colors.green[300],
                  ),
                ),
              ),
            ),
          ),
          // Overlay info
          Positioned(
            bottom: 12,
            left: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 6,
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Rider is 2.3 km away · ETA ~12 min',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.local_shipping_outlined,
                    color: AppColors.magenta600,
                    size: 20,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Items list
// ---------------------------------------------------------------------------

class _ItemsList extends StatelessWidget {
  const _ItemsList({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFFF0F0F0),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(
              child: Icon(Icons.checkroom, color: Colors.grey),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.productName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(order.storeName,
                    style:
                        TextStyle(color: Colors.grey[500], fontSize: 12)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    if (order.size != null)
                      Text('Size: ${order.size}  ',
                          style: const TextStyle(fontSize: 12)),
                    Text('Qty: ${order.quantity}',
                        style: const TextStyle(fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          Text(
            '₹${order.total.toInt()}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Price breakdown
// ---------------------------------------------------------------------------

class _PriceBreakdown extends StatelessWidget {
  const _PriceBreakdown({required this.order});
  final OrderModel order;

  @override
  Widget build(BuildContext context) {
    final subtotal = order.total + 99 - 200; // mock
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _PriceLine(label: 'Subtotal', value: '₹${subtotal.toInt()}'),
          const _PriceLine(label: 'Delivery fee', value: '₹99'),
          _PriceLine(
              label: 'Discount',
              value: '- ₹200',
              valueColor: Colors.green[700]!),
          const Divider(height: 20),
          _PriceLine(
            label: 'Total',
            value: '₹${order.total.toInt()}',
            bold: true,
          ),
        ],
      ),
    );
  }
}

class _PriceLine extends StatelessWidget {
  const _PriceLine({
    required this.label,
    required this.value,
    this.bold = false,
    this.valueColor,
  });
  final String label;
  final String value;
  final bool bold;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
              color: bold ? const Color(0xFF1A1A2E) : Colors.grey[600],
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
              color: valueColor ??
                  (bold ? AppColors.navy800 : const Color(0xFF1A1A2E)),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Delivery address
// ---------------------------------------------------------------------------

class _DeliveryAddress extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.location_on_outlined,
              color: AppColors.magenta600, size: 20),
          SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Priya Sharma',
                    style: TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14)),
                SizedBox(height: 2),
                Text(
                  '42, Shivaji Nagar, Near Central Mall\nPune, Maharashtra 411005',
                  style: TextStyle(color: Colors.grey, fontSize: 13),
                ),
                SizedBox(height: 4),
                Text('+91 98765 43210',
                    style:
                        TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Payment method
// ---------------------------------------------------------------------------

class _PaymentMethod extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF0F0F0),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.credit_card, size: 20),
          ),
          const SizedBox(width: 12),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'HDFC Credit Card',
                style: TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 14),
              ),
              Text(
                '•••• •••• •••• 4242',
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Text(
              title,
              style: const TextStyle(
                color: AppColors.navy800,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Report issue bottom sheet
// ---------------------------------------------------------------------------

class _ReportIssueSheet extends StatelessWidget {
  const _ReportIssueSheet();

  @override
  Widget build(BuildContext context) {
    final issues = [
      'Item not received',
      'Wrong item delivered',
      'Damaged product',
      'Missing item in order',
      'Other issue',
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Report an Issue',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ...issues.map(
            (issue) => ListTile(
              leading: const Icon(Icons.error_outline),
              title: Text(issue),
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Report submitted: $issue'),
                    backgroundColor: AppColors.navy800,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
