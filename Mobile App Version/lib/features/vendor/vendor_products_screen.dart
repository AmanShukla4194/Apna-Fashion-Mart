import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';
import '../../core/theme/afm_theme.dart';

class VendorProductsScreen extends StatefulWidget {
  const VendorProductsScreen({super.key});

  @override
  State<VendorProductsScreen> createState() => _VendorProductsScreenState();
}

class _VendorProductsScreenState extends State<VendorProductsScreen> {
  List<Map<String, dynamic>> _products = [];
  bool _loading = true;
  String? _error;
  String? _deletingId;
  String? _shopId;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() { _loading = true; _error = null; });
    try {
      final shop = await ApiService.instance.getMyShop();
      if (shop == null) {
        setState(() {
          _loading = false;
          _error = 'No store found. Set up your store first.';
        });
        return;
      }
      _shopId = shop['id']?.toString() ?? '';
      final products = await ApiService.instance.getMyProducts(_shopId!);
      setState(() { _products = products; _loading = false; });
    } catch (_) {
      setState(() { _loading = false; _error = 'Failed to load products. Pull to refresh.'; });
    }
  }

  String _getImage(Map<String, dynamic> p) {
    final raw = p['images'];
    if (raw is List && raw.isNotEmpty) return raw[0].toString();
    if (raw is String && raw.isNotEmpty) {
      try {
        final arr = jsonDecode(raw) as List;
        if (arr.isNotEmpty) return arr[0].toString();
      } catch (_) {}
    }
    return '';
  }

  Future<void> _deleteProduct(int index) async {
    final p = _products[index];
    final id = p['id']?.toString() ?? '';
    final name = p['name']?.toString() ?? 'product';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Product'),
        content: Text('Remove "$name" from your catalog?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _deletingId = id);
    try {
      await ApiService.instance.deleteProduct(id);
      setState(() => _products.removeAt(index));
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to delete product')),
        );
      }
    } finally {
      if (mounted) setState(() => _deletingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        title: Text(
          _loading ? 'My Products' : 'My Products (${_products.length})',
          style: const TextStyle(color: Colors.white),
        ),
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
      body: RefreshIndicator(
        color: AfmColors.magenta600,
        onRefresh: _loadProducts,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AfmColors.magenta600));
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: AfmColors.navy800.withValues(alpha: 0.3)),
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center,
                style: TextStyle(color: AfmColors.navy800.withValues(alpha: 0.6), fontSize: 15)),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loadProducts,
                style: ElevatedButton.styleFrom(backgroundColor: AfmColors.magenta600, foregroundColor: Colors.white),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 64, color: AfmColors.navy800.withValues(alpha: 0.2)),
            const SizedBox(height: 12),
            Text('No products yet',
              style: TextStyle(color: AfmColors.navy800.withValues(alpha: 0.4), fontSize: 16)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pushNamed('/vendor/products/new'),
              style: ElevatedButton.styleFrom(backgroundColor: AfmColors.magenta600, foregroundColor: Colors.white),
              child: const Text('Add Your First Product'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _products.length,
      itemBuilder: (_, i) => _buildProductTile(i),
    );
  }

  Widget _buildProductTile(int i) {
    final p = _products[i];
    final id = p['id']?.toString() ?? '';
    final name = p['name']?.toString() ?? '';
    final price = (p['price'] as num?)?.toInt() ?? 0;
    final stock = (p['stock_quantity'] as num?)?.toInt() ?? 0;
    final category = p['category']?.toString() ?? '';
    final isDeleting = _deletingId == id;
    final isLowStock = stock > 0 && stock < 5;
    final isOutOfStock = stock == 0;
    final imgUrl = _getImage(p);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)],
      ),
      child: Row(
        children: [
          // Product image
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
            child: imgUrl.isNotEmpty
                ? Image.network(
                    imgUrl,
                    width: 90, height: 90, fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _imagePlaceholder(),
                  )
                : _imagePlaceholder(),
          ),
          // Details
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AfmColors.navy800),
                    maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text('₹$price · $category',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF8896A5))),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isOutOfStock
                          ? Colors.red.withValues(alpha: 0.1)
                          : isLowStock
                              ? Colors.orange.withValues(alpha: 0.1)
                              : Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      isOutOfStock ? 'Out of stock' : '$stock in stock',
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
          // Actions
          if (isDeleting)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(width: 20, height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: AfmColors.magenta600)),
            )
          else
            Column(
              children: [
                IconButton(
                  icon: const Icon(Icons.edit_outlined, color: AfmColors.navy800, size: 20),
                  onPressed: () => Navigator.of(context).pushNamed('/vendor/products/edit', arguments: p),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                  onPressed: () => _deleteProduct(i),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      width: 90, height: 90,
      color: const Color(0xFFF0F4FF),
      child: const Icon(Icons.image_outlined, color: Color(0xFFD1D5DB), size: 32),
    );
  }
}
