import 'package:flutter/material.dart';
import '../../core/theme/afm_theme.dart';

class VendorOrdersScreen extends StatefulWidget {
  const VendorOrdersScreen({super.key});

  @override
  State<VendorOrdersScreen> createState() => _VendorOrdersScreenState();
}

class _VendorOrdersScreenState extends State<VendorOrdersScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  final List<Map<String, dynamic>> _orders = [
    {'id': 'o1001', 'customer': 'Priya Sharma',  'items': 'Banarasi Silk Saree × 1', 'total': 4899, 'status': 'pending',    'date': '2025-05-20'},
    {'id': 'o1002', 'customer': 'Ananya Iyer',   'items': 'Handloom Kurti × 2',     'total': 2598, 'status': 'processing', 'date': '2025-05-19'},
    {'id': 'o1003', 'customer': 'Rhea Kapoor',   'items': 'Silk Dupatta × 1',       'total': 1899, 'status': 'shipped',    'date': '2025-05-18'},
    {'id': 'o1004', 'customer': 'Mira Sethi',    'items': 'Anarkali Set × 1',       'total': 3499, 'status': 'delivered',  'date': '2025-05-17'},
    {'id': 'o1005', 'customer': 'Kavya Nair',    'items': 'Denim Jacket × 1',       'total': 2199, 'status': 'delivered',  'date': '2025-05-16'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'delivered':  return Colors.green;
      case 'shipped':    return Colors.blue;
      case 'processing': return AfmColors.magenta600;
      default:           return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        title: const Text('Orders', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white54,
          indicatorColor: AfmColors.magenta600,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          tabs: const [Tab(text: 'All'), Tab(text: 'Pending'), Tab(text: 'Active'), Tab(text: 'Done')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrderList(_orders),
          _buildOrderList(_orders.where((o) => o['status'] == 'pending').toList()),
          _buildOrderList(_orders.where((o) => o['status'] == 'processing' || o['status'] == 'shipped').toList()),
          _buildOrderList(_orders.where((o) => o['status'] == 'delivered').toList()),
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
            Icon(Icons.receipt_long_outlined, size: 60, color: AfmColors.navy800.withValues(alpha: 0.2)),
            const SizedBox(height: 12),
            Text('No orders here', style: TextStyle(color: AfmColors.navy800.withValues(alpha: 0.4), fontSize: 16)),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: orders.length,
      itemBuilder: (_, i) {
        final o = orders[i];
        final statusColor = _statusColor(o['status'] as String);
        final statusLabel = (o['status'] as String)[0].toUpperCase() + (o['status'] as String).substring(1);
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('#${(o['id'] as String).toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold, color: AfmColors.navy800)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                    child: Text(statusLabel, style: TextStyle(fontSize: 11, color: statusColor, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(o['customer'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              Text(o['items'] as String, style: const TextStyle(fontSize: 13, color: Color(0xFF8896A5))),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text('₹${o['total']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AfmColors.magenta600)),
                  const Spacer(),
                  Text(o['date'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                ],
              ),
              if (o['status'] == 'pending') ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => setState(() => o['status'] = 'processing'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AfmColors.magenta600,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: const Text('Accept Order', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
