import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/afm_theme.dart';

class VendorOrdersScreen extends StatefulWidget {
  const VendorOrdersScreen({super.key});

  @override
  State<VendorOrdersScreen> createState() => _VendorOrdersScreenState();
}

class _VendorOrdersScreenState extends State<VendorOrdersScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  List<Map<String, dynamic>> _orders = [];
  bool _loading = true;
  String? _error;
  String? _updatingOrderId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadOrders();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await ApiService.instance.getOrders('');
      if (mounted) setState(() { _orders = orders; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _updateStatus(String orderId, String newStatus) async {
    setState(() => _updatingOrderId = orderId);
    try {
      await ApiService.instance.updateOrderStatus(orderId, newStatus);
      if (mounted) {
        setState(() {
          _orders = _orders
              .map((o) => o['id'] == orderId ? {...o, 'status': newStatus} : o)
              .toList();
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Order marked as $newStatus'),
          backgroundColor: Colors.green.shade600,
          behavior: SnackBarBehavior.floating,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Failed: ${e.toString()}'),
          backgroundColor: Colors.red.shade600,
          behavior: SnackBarBehavior.floating,
        ));
      }
    } finally {
      if (mounted) setState(() => _updatingOrderId = null);
    }
  }

  List<Map<String, dynamic>> get _pending =>
      _orders.where((o) => o['status'] == 'pending').toList();

  List<Map<String, dynamic>> get _active => _orders
      .where((o) => ['confirmed', 'processing', 'shipped'].contains(o['status']))
      .toList();

  List<Map<String, dynamic>> get _done => _orders
      .where((o) => ['delivered', 'cancelled'].contains(o['status']))
      .toList();

  @override
  Widget build(BuildContext context) {
    final pendingCount = _pending.length;
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        title: const Text('Orders', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadOrders,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white54,
          indicatorColor: AfmColors.magenta600,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          tabs: [
            const Tab(text: 'All'),
            Tab(text: pendingCount > 0 ? 'Pending ($pendingCount)' : 'Pending'),
            const Tab(text: 'Active'),
            const Tab(text: 'Done'),
          ],
        ),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AfmColors.magenta600))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.red),
                        const SizedBox(height: 12),
                        Text(_error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Color(0xFF8896A5))),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadOrders,
                          style: ElevatedButton.styleFrom(
                              backgroundColor: AfmColors.magenta600,
                              foregroundColor: Colors.white),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildOrderList(_orders),
                    _buildOrderList(_pending),
                    _buildOrderList(_active),
                    _buildOrderList(_done),
                  ],
                ),
    );
  }

  Widget _buildOrderList(List<Map<String, dynamic>> orders) {
    if (orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long_outlined,
                size: 60,
                color: AfmColors.navy800.withValues(alpha: 0.2)),
            const SizedBox(height: 12),
            Text('No orders here',
                style: TextStyle(
                    color: AfmColors.navy800.withValues(alpha: 0.4),
                    fontSize: 16)),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadOrders,
      color: AfmColors.magenta600,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        itemBuilder: (_, i) => _buildOrderCard(orders[i]),
      ),
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> o) {
    final status = o['status'] as String? ?? 'pending';
    final orderId = o['id'] as String? ?? '';
    final isUpdating = _updatingOrderId == orderId;
    final orderNum = o['order_number'] as String? ??
        '#${orderId.length >= 8 ? orderId.substring(0, 8).toUpperCase() : orderId.toUpperCase()}';
    final customerName = o['customer_name'] as String? ?? 'Customer';
    final deliveryCity = o['delivery_city'] as String?;
    final itemCount = o['item_count'];
    final total = o['total'];
    final paymentStatus = o['payment_status'] as String? ?? 'pending';
    final createdAt = o['created_at'] as String?;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: order number + status chip
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(orderNum,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AfmColors.navy800,
                            fontSize: 15)),
                    Text(_formatDate(createdAt),
                        style: const TextStyle(
                            fontSize: 12, color: Color(0xFF8896A5))),
                  ],
                ),
              ),
              _statusChip(status),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1),
          const SizedBox(height: 10),
          // Customer info + total
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(customerName,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14)),
                    Text(
                      [
                        if (deliveryCity != null) deliveryCity,
                        if (itemCount != null) '$itemCount item(s)',
                      ].join(' • '),
                      style: const TextStyle(
                          fontSize: 12, color: Color(0xFF8896A5)),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${total != null ? num.tryParse(total.toString())?.toStringAsFixed(0) ?? total : 0}',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AfmColors.magenta600),
                  ),
                  Text(
                    paymentStatus == 'paid' ? 'Paid Online' : 'COD',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: paymentStatus == 'paid'
                            ? Colors.green.shade600
                            : Colors.orange.shade700),
                  ),
                ],
              ),
            ],
          ),
          // Action buttons
          if (status == 'pending' || status == 'confirmed' || status == 'shipped') ...[
            const SizedBox(height: 12),
            Row(
              children: [
                if (status == 'pending') ...[
                  Expanded(
                    child: _actionButton(
                      label: '✓ Confirm',
                      color: const Color(0xFF2563EB),
                      isUpdating: isUpdating,
                      onTap: () => _updateStatus(orderId, 'confirmed'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _outlineButton(
                    label: 'Cancel',
                    color: const Color(0xFFDC2626),
                    isUpdating: isUpdating,
                    onTap: () => _updateStatus(orderId, 'cancelled'),
                  ),
                ],
                if (status == 'confirmed')
                  Expanded(
                    child: _actionButton(
                      label: '📦 Mark Shipped',
                      color: const Color(0xFF9333EA),
                      isUpdating: isUpdating,
                      onTap: () => _updateStatus(orderId, 'shipped'),
                    ),
                  ),
                if (status == 'shipped')
                  Expanded(
                    child: _actionButton(
                      label: '✓ Mark Delivered',
                      color: const Color(0xFF16A34A),
                      isUpdating: isUpdating,
                      onTap: () => _updateStatus(orderId, 'delivered'),
                    ),
                  ),
              ],
            ),
          ],
          if (status == 'delivered')
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('✓ Order completed',
                  style: TextStyle(
                      fontSize: 12,
                      color: Colors.green.shade600,
                      fontStyle: FontStyle.italic)),
            ),
          if (status == 'cancelled')
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('✗ Order cancelled',
                  style: TextStyle(
                      fontSize: 12,
                      color: Colors.red.shade400,
                      fontStyle: FontStyle.italic)),
            ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required String label,
    required Color color,
    required bool isUpdating,
    required VoidCallback onTap,
  }) {
    return ElevatedButton(
      onPressed: isUpdating ? null : onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        disabledBackgroundColor: color.withValues(alpha: 0.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(vertical: 10),
        elevation: 0,
      ),
      child: isUpdating
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                  color: Colors.white, strokeWidth: 2))
          : Text(label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }

  Widget _outlineButton({
    required String label,
    required Color color,
    required bool isUpdating,
    required VoidCallback onTap,
  }) {
    return OutlinedButton(
      onPressed: isUpdating ? null : onTap,
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withValues(alpha: 0.4)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
      ),
      child: Text(label,
          style:
              TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
    );
  }

  Widget _statusChip(String status) {
    final configs = {
      'pending':    (_color(0xFFFFF7E6), _color(0xFFD97706)),
      'confirmed':  (_color(0xFFEFF6FF), _color(0xFF2563EB)),
      'processing': (_color(0xFFF5F3FF), _color(0xFF7C3AED)),
      'shipped':    (_color(0xFFF3E8FF), _color(0xFF9333EA)),
      'delivered':  (_color(0xFFF0FDF4), _color(0xFF16A34A)),
      'cancelled':  (_color(0xFFFFF1F2), _color(0xFFDC2626)),
    };
    final cfg = configs[status] ??
        (_color(0xFFF3F4F6), _color(0xFF374151));
    final label = status[0].toUpperCase() + status.substring(1);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: cfg.$1,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(label,
          style: TextStyle(
              fontSize: 11,
              color: cfg.$2,
              fontWeight: FontWeight.w700)),
    );
  }

  Color _color(int hex) => Color(hex);

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final d = DateTime.parse(dateStr).toLocal();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${d.day} ${months[d.month - 1]} ${d.year}';
    } catch (_) {
      return dateStr;
    }
  }
}
