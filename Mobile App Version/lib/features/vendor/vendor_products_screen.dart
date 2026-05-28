import 'package:flutter/material.dart';
import '../../core/theme/afm_theme.dart';

class VendorProductsScreen extends StatefulWidget {
  const VendorProductsScreen({super.key});

  @override
  State<VendorProductsScreen> createState() => _VendorProductsScreenState();
}

class _VendorProductsScreenState extends State<VendorProductsScreen> {
  final List<Map<String, dynamic>> _products = [
    {'id': '1', 'name': 'Banarasi Silk Saree', 'category': 'ethnic', 'price': 4899, 'stock': 12,
     'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80'},
    {'id': '2', 'name': 'Handloom Cotton Kurti', 'category': 'ethnic', 'price': 1299, 'stock': 4,
     'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&q=80'},
    {'id': '3', 'name': 'Denim Jacket', 'category': 'western', 'price': 2199, 'stock': 18,
     'image': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&q=80'},
    {'id': '4', 'name': 'Floral Midi Dress', 'category': 'women', 'price': 1899, 'stock': 0,
     'image': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        title: const Text('My Products', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => Navigator.of(context).pushNamed('/vendor/products/new'),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).pushNamed('/vendor/products/new'),
        backgroundColor: AfmColors.magenta600,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Product', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
      body: _products.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inventory_2_outlined, size: 64, color: AfmColors.navy800.withValues(alpha: 0.2)),
                  const SizedBox(height: 12),
                  Text('No products yet', style: TextStyle(color: AfmColors.navy800.withValues(alpha: 0.4), fontSize: 16)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pushNamed('/vendor/products/new'),
                    style: ElevatedButton.styleFrom(backgroundColor: AfmColors.magenta600, foregroundColor: Colors.white),
                    child: const Text('Add Your First Product'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _products.length,
              itemBuilder: (_, i) {
                final p = _products[i];
                final isLowStock = (p['stock'] as int) < 5;
                final isOutOfStock = (p['stock'] as int) == 0;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)],
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                        child: Image.network(
                          p['image'] as String,
                          width: 90, height: 90, fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(width: 90, height: 90, color: const Color(0xFFF0F4FF)),
                        ),
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AfmColors.navy800)),
                              const SizedBox(height: 2),
                              Text('₹${p['price']} · ${p['category']}', style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isOutOfStock ? Colors.red.withValues(alpha: 0.1) : isLowStock ? Colors.orange.withValues(alpha: 0.1) : Colors.green.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  isOutOfStock ? 'Out of stock' : '${p['stock']} in stock',
                                  style: TextStyle(
                                    fontSize: 11, fontWeight: FontWeight.w600,
                                    color: isOutOfStock ? Colors.red : isLowStock ? Colors.orange : Colors.green,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Column(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit_outlined, color: AfmColors.navy800, size: 20),
                            onPressed: () => Navigator.of(context).pushNamed('/vendor/products/edit', arguments: p),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                            onPressed: () => showDialog(
                              context: context,
                              builder: (_) => AlertDialog(
                                title: const Text('Delete Product'),
                                content: Text('Remove "${p['name']}" from your catalog?'),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                  TextButton(
                                    onPressed: () {
                                      setState(() => _products.removeAt(i));
                                      Navigator.pop(context);
                                    },
                                    child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
