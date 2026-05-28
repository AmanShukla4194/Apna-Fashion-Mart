import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/features/account/widgets/order_card.dart';

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

enum OrderStatus { processing, inTransit, delivered, cancelled }

class OrderModel {
  const OrderModel({
    required this.id,
    required this.date,
    required this.status,
    required this.total,
    required this.productName,
    required this.storeName,
    required this.quantity,
    this.size,
    this.thumbnailUrl,
    this.trackingSteps = const [],
  });

  final String id;
  final DateTime date;
  final OrderStatus status;
  final double total;
  final String productName;
  final String storeName;
  final int quantity;
  final String? size;
  final String? thumbnailUrl;
  final List<TrackingStep> trackingSteps;
}

class TrackingStep {
  const TrackingStep({
    required this.label,
    required this.stepStatus,
    this.timestamp,
  });

  final String label;
  final StepStatus stepStatus;
  final String? timestamp;
}

enum StepStatus { done, current, pending }

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

final List<OrderModel> _mockOrders = [
  OrderModel(
    id: 'AFM-ORD-2845-X9K2',
    date: DateTime(2026, 5, 14),
    status: OrderStatus.delivered,
    total: 4899,
    productName: 'Banarasi Silk Saree',
    storeName: 'Aanya Atelier',
    quantity: 1,
    size: 'Free Size',
    thumbnailUrl: null,
    trackingSteps: const [
      TrackingStep(
          label: 'Placed', stepStatus: StepStatus.done, timestamp: '14 May, 10:02 AM'),
      TrackingStep(
          label: 'Confirmed', stepStatus: StepStatus.done, timestamp: '14 May, 10:15 AM'),
      TrackingStep(
          label: 'Packed', stepStatus: StepStatus.done, timestamp: '14 May, 3:00 PM'),
      TrackingStep(
          label: 'Out for Delivery',
          stepStatus: StepStatus.done,
          timestamp: '15 May, 8:30 AM'),
      TrackingStep(
          label: 'Delivered', stepStatus: StepStatus.done, timestamp: '15 May, 12:45 PM'),
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
    thumbnailUrl: null,
    trackingSteps: const [
      TrackingStep(
          label: 'Placed', stepStatus: StepStatus.done, timestamp: '13 May, 2:10 PM'),
      TrackingStep(
          label: 'Confirmed', stepStatus: StepStatus.done, timestamp: '13 May, 2:30 PM'),
      TrackingStep(
          label: 'Packed', stepStatus: StepStatus.done, timestamp: '14 May, 11:00 AM'),
      TrackingStep(
          label: 'Out for Delivery', stepStatus: StepStatus.current, timestamp: 'Today'),
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
    thumbnailUrl: null,
    trackingSteps: const [
      TrackingStep(
          label: 'Placed', stepStatus: StepStatus.done, timestamp: '8 May, 6:45 PM'),
      TrackingStep(
          label: 'Confirmed', stepStatus: StepStatus.current, timestamp: '9 May, 9:00 AM'),
      TrackingStep(label: 'Packed', stepStatus: StepStatus.pending),
      TrackingStep(label: 'Out for Delivery', stepStatus: StepStatus.pending),
      TrackingStep(label: 'Delivered', stepStatus: StepStatus.pending),
    ],
  ),
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isRefreshing = false;

  final List<_TabConfig> _tabs = const [
    _TabConfig(label: 'All', filter: null),
    _TabConfig(label: 'Active', filter: [OrderStatus.processing, OrderStatus.inTransit]),
    _TabConfig(label: 'Delivered', filter: [OrderStatus.delivered]),
    _TabConfig(label: 'Cancelled', filter: [OrderStatus.cancelled]),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() async {
    setState(() => _isRefreshing = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) setState(() => _isRefreshing = false);
  }

  List<OrderModel> _filtered(List<OrderStatus>? filter) {
    if (filter == null) return _mockOrders;
    return _mockOrders.where((o) => filter.contains(o.status)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppColors.navy800,
        foregroundColor: Colors.white,
        title: const Text(
          'My Orders',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.magenta600,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: _tabs.map((t) => Tab(text: t.label)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _tabs.map((t) {
          final orders = _filtered(t.filter);
          return RefreshIndicator(
            color: AppColors.magenta600,
            onRefresh: _onRefresh,
            child: orders.isEmpty
                ? _EmptyState(tabLabel: t.label)
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    itemCount: orders.length,
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: OrderCard(order: orders[i]),
                    ),
                  ),
          );
        }).toList(),
      ),
    );
  }
}

class _TabConfig {
  const _TabConfig({required this.label, required this.filter});
  final String label;
  final List<OrderStatus>? filter;
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.tabLabel});
  final String tabLabel;

  String get _message {
    switch (tabLabel) {
      case 'Active':
        return 'No active orders right now';
      case 'Delivered':
        return 'No delivered orders yet';
      case 'Cancelled':
        return 'No cancelled orders';
      default:
        return 'No orders found';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_bag_outlined,
            size: 72,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            _message,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your orders will appear here',
            style: TextStyle(color: Colors.grey[400], fontSize: 13),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.magenta600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('Start Shopping'),
          ),
        ],
      ),
    );
  }
}
