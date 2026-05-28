import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/afm_theme.dart';
import '../../core/providers/auth_provider.dart';

class VendorDashboardScreen extends ConsumerWidget {
  const VendorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final name = authState.user?.email.split('@').first ?? 'Vendor';

    final stats = [
      {'label': 'Revenue', 'value': '₹84,200', 'icon': Icons.currency_rupee, 'color': const Color(0xFF22C55E)},
      {'label': 'Orders', 'value': '47', 'icon': Icons.shopping_bag_outlined, 'color': const Color(0xFF3B82F6)},
      {'label': 'Products', 'value': '23', 'icon': Icons.inventory_2_outlined, 'color': AfmColors.magenta600},
      {'label': 'Rating', 'value': '4.8★', 'icon': Icons.star_outline, 'color': AfmColors.gold500},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Vendor Portal', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
            Text(name, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined, color: Colors.white), onPressed: () {}),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        color: AfmColors.magenta600,
        onRefresh: () async => Future.delayed(const Duration(seconds: 1)),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: stats.map((s) => Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2))],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: (s['color'] as Color).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 18),
                    ),
                    const Spacer(),
                    Text(s['value'] as String, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AfmColors.navy800)),
                    Text(s['label'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                  ],
                ),
              )).toList(),
            ),
            const SizedBox(height: 20),
            const Text('Quick Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AfmColors.navy800, fontFamily: 'PlayfairDisplay')),
            const SizedBox(height: 12),
            Row(
              children: [
                _QuickAction(icon: Icons.add_box_outlined, label: 'Add Product', color: AfmColors.magenta600,
                  onTap: () => Navigator.of(context).pushNamed('/vendor/products/new')),
                const SizedBox(width: 12),
                _QuickAction(icon: Icons.inventory_2_outlined, label: 'My Products', color: AfmColors.navy800,
                  onTap: () => Navigator.of(context).pushNamed('/vendor/products')),
                const SizedBox(width: 12),
                _QuickAction(icon: Icons.receipt_long_outlined, label: 'Orders', color: const Color(0xFF3B82F6),
                  onTap: () => Navigator.of(context).pushNamed('/vendor/orders')),
                const SizedBox(width: 12),
                _QuickAction(icon: Icons.store_outlined, label: 'Store Setup', color: AfmColors.gold500,
                  onTap: () => Navigator.of(context).pushNamed('/vendor/store')),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Recent Orders', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AfmColors.navy800, fontFamily: 'PlayfairDisplay')),
                TextButton(
                  onPressed: () => Navigator.of(context).pushNamed('/vendor/orders'),
                  child: const Text('View All', style: TextStyle(color: AfmColors.magenta600, fontSize: 13)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...List.generate(4, (i) {
              final statuses = ['Pending', 'Processing', 'Delivered', 'Pending'];
              final colors = [const Color(0xFFF59E0B), const Color(0xFF3B82F6), const Color(0xFF22C55E), const Color(0xFFF59E0B)];
              final items = ['Banarasi Silk Saree', 'Silk Dupatta × 2', 'Kurti Set', 'Anarkali'];
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6)],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(color: AfmColors.magenta600.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: Center(child: Text('#${(i + 1) * 1000 + 42}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AfmColors.magenta600))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Order #AFM-${(i + 1) * 1000 + 42}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          Text('₹${(i + 1) * 1200 + 799} · ${items[i]}', style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: colors[i].withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
                      child: Text(statuses[i], style: TextStyle(fontSize: 11, color: colors[i], fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickAction({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
          child: Column(
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 4),
              Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}
