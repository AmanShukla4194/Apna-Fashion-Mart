import 'package:flutter/material.dart';
import '../../core/theme/afm_theme.dart';

class VendorAddProductScreen extends StatefulWidget {
  final Map<String, dynamic>? product;
  const VendorAddProductScreen({super.key, this.product});

  @override
  State<VendorAddProductScreen> createState() => _VendorAddProductScreenState();
}

class _VendorAddProductScreenState extends State<VendorAddProductScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _priceCtrl;
  late final TextEditingController _oldPriceCtrl;
  late final TextEditingController _stockCtrl;
  late final TextEditingController _descCtrl;
  String _category = 'ethnic';
  bool _saving = false;

  static const _categories = ['ethnic', 'women', 'men', 'kids', 'streetwear', 'footwear', 'accessories'];

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nameCtrl = TextEditingController(text: p?['name']?.toString() ?? '');
    _priceCtrl = TextEditingController(text: p?['price']?.toString() ?? '');
    _oldPriceCtrl = TextEditingController(text: p?['oldPrice']?.toString() ?? '');
    _stockCtrl = TextEditingController(text: p?['stock']?.toString() ?? '');
    _descCtrl = TextEditingController(text: p?['description']?.toString() ?? '');
    if (p?['category'] != null) _category = p!['category'] as String;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _priceCtrl.dispose();
    _oldPriceCtrl.dispose();
    _stockCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    await Future.delayed(const Duration(milliseconds: 800));
    setState(() => _saving = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(widget.product != null ? 'Product updated!' : 'Product added!'),
        backgroundColor: Colors.green,
      ));
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.product != null;
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        title: Text(isEdit ? 'Edit Product' : 'Add Product', style: const TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            GestureDetector(
              onTap: () {},
              child: Container(
                height: 160,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 2),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.add_photo_alternate_outlined, color: AfmColors.navy800.withValues(alpha: 0.4), size: 40),
                    const SizedBox(height: 8),
                    Text('Tap to add product photos', style: TextStyle(color: AfmColors.navy800.withValues(alpha: 0.4), fontSize: 14)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            _buildField('Product Name *', _nameCtrl, hint: 'e.g. Banarasi Silk Saree',
              validator: (v) => (v?.isEmpty ?? true) ? 'Name is required' : null),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _category,
              decoration: _inputDecoration('Category'),
              items: _categories.map((c) => DropdownMenuItem(
                value: c,
                child: Text(c[0].toUpperCase() + c.substring(1)),
              )).toList(),
              onChanged: (v) => setState(() => _category = v!),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildField('Price (₹) *', _priceCtrl, hint: '4999',
                  keyboardType: TextInputType.number,
                  validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null)),
                const SizedBox(width: 12),
                Expanded(child: _buildField('Original Price (₹)', _oldPriceCtrl, hint: '6999',
                  keyboardType: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 12),
            _buildField('Stock Quantity *', _stockCtrl, hint: '10',
              keyboardType: TextInputType.number,
              validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null),
            const SizedBox(height: 12),
            _buildField('Description', _descCtrl, hint: 'Describe your product…', maxLines: 4),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AfmColors.magenta600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(isEdit ? 'Update Product' : 'Add Product',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, {
    String? hint, TextInputType? keyboardType, int maxLines = 1, String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
      decoration: _inputDecoration(label).copyWith(hintText: hint),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: AfmColors.navy800.withValues(alpha: 0.7), fontSize: 13),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AfmColors.magenta600, width: 1.5)),
      errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red)),
    );
  }
}
