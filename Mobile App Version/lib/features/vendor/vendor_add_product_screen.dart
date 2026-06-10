import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/services/api_service.dart';
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
  late final TextEditingController _sizesCtrl;
  String _category = 'ethnic';
  bool _saving = false;
  bool _uploadingImage = false;

  XFile? _imageFile;
  String? _imagePreview; // local file path OR existing https URL

  static const _categories = ['ethnic', 'women', 'men', 'kids', 'streetwear', 'footwear', 'accessories'];

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nameCtrl = TextEditingController(text: p?['name']?.toString() ?? '');
    _priceCtrl = TextEditingController(text: p?['price']?.toString() ?? '');
    _oldPriceCtrl = TextEditingController(text: (p?['compare_price'] ?? p?['oldPrice'])?.toString() ?? '');
    _stockCtrl = TextEditingController(text: (p?['stock_quantity'] ?? p?['stock'])?.toString() ?? '');
    _descCtrl = TextEditingController(text: p?['description']?.toString() ?? '');
    _sizesCtrl = TextEditingController(text: (p?['sizes'] as List?)?.join(', ') ?? '');
    if (p?['category'] != null) _category = p!['category'] as String;
    final imgs = p?['images'];
    if (imgs is List && imgs.isNotEmpty) _imagePreview = imgs.first as String?;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _priceCtrl.dispose();
    _oldPriceCtrl.dispose();
    _stockCtrl.dispose();
    _descCtrl.dispose();
    _sizesCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
      maxWidth: 1200,
    );
    if (file != null) {
      setState(() {
        _imageFile = file;
        _imagePreview = file.path;
      });
    }
  }

  Future<String?> _uploadImageToS3() async {
    if (_imageFile == null) return null;
    setState(() => _uploadingImage = true);
    try {
      final filename = _imageFile!.name;
      final ext = filename.split('.').last.toLowerCase();
      final contentType = ext == 'png'
          ? 'image/png'
          : ext == 'webp'
              ? 'image/webp'
              : 'image/jpeg';

      final presigned = await ApiService.instance.getPresignedUrl(
        filename: filename,
        contentType: contentType,
        folder: 'products',
      );

      final uploadUrl = presigned['uploadUrl'] as String;
      final publicUrl = presigned['publicUrl'] as String;
      final bytes = await _imageFile!.readAsBytes();

      await ApiService.instance.uploadFileToS3(uploadUrl, bytes, contentType);
      return publicUrl;
    } finally {
      if (mounted) setState(() => _uploadingImage = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final shop = await ApiService.instance.getMyShop();
      if (shop == null) throw Exception('Store not found. Please create your store first.');

      // Upload new image if selected; keep existing URL if editing
      String? imageUrl;
      if (_imageFile != null) {
        imageUrl = await _uploadImageToS3();
      } else if (_imagePreview != null && _imagePreview!.startsWith('http')) {
        imageUrl = _imagePreview;
      }

      final sizes = _sizesCtrl.text.isNotEmpty
          ? _sizesCtrl.text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList()
          : <String>[];

      final payload = <String, dynamic>{
        'name': _nameCtrl.text.trim(),
        'category': _category,
        'price': double.tryParse(_priceCtrl.text) ?? 0,
        'stock_quantity': int.tryParse(_stockCtrl.text) ?? 0,
        'sizes': sizes,
        'shop_id': shop['id'],
        'images': imageUrl != null ? [imageUrl] : [],
      };
      if (_descCtrl.text.trim().isNotEmpty) payload['description'] = _descCtrl.text.trim();
      if (_oldPriceCtrl.text.isNotEmpty) {
        payload['compare_price'] = double.tryParse(_oldPriceCtrl.text);
      }

      if (widget.product != null) {
        await ApiService.instance.updateProduct(widget.product!['id'] as String, payload);
      } else {
        await ApiService.instance.createProduct(payload);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(widget.product != null ? 'Product updated!' : 'Product added!'),
          backgroundColor: Colors.green,
        ));
        Navigator.pop(context, true); // true signals parent to refresh
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.product != null;
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        title: Text(isEdit ? 'Edit Product' : 'Add Product',
            style: const TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Image Upload ──────────────────────────────────────────────────
            GestureDetector(
              onTap: (_saving || _uploadingImage) ? null : _pickImage,
              child: Container(
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 2),
                ),
                child: _buildImageArea(),
              ),
            ),
            const SizedBox(height: 16),

            // ── Fields ────────────────────────────────────────────────────────
            _buildField('Product Name *', _nameCtrl,
                hint: 'e.g. Banarasi Silk Saree',
                validator: (v) => (v?.isEmpty ?? true) ? 'Name is required' : null),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _category,
              decoration: _inputDecoration('Category'),
              items: _categories
                  .map((c) => DropdownMenuItem(
                        value: c,
                        child: Text(c[0].toUpperCase() + c.substring(1)),
                      ))
                  .toList(),
              onChanged: (v) => setState(() => _category = v!),
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: _buildField('Price (₹) *', _priceCtrl,
                    hint: '4999',
                    keyboardType: TextInputType.number,
                    validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildField('Original Price (₹)', _oldPriceCtrl,
                    hint: '6999', keyboardType: TextInputType.number),
              ),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: _buildField('Stock *', _stockCtrl,
                    hint: '10',
                    keyboardType: TextInputType.number,
                    validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildField('Sizes', _sizesCtrl, hint: 'S, M, L, XL'),
              ),
            ]),
            const SizedBox(height: 12),
            _buildField('Description', _descCtrl,
                hint: 'Describe your product…', maxLines: 4),
            const SizedBox(height: 24),

            // ── Save Button ───────────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: (_saving || _uploadingImage) ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AfmColors.magenta600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: (_saving || _uploadingImage)
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2)),
                          const SizedBox(width: 10),
                          Text(_uploadingImage
                              ? 'Uploading image…'
                              : 'Saving…'),
                        ],
                      )
                    : Text(isEdit ? 'Update Product' : 'Add Product',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildImageArea() {
    if (_uploadingImage) {
      return const Center(
          child: CircularProgressIndicator(color: AfmColors.magenta600));
    }
    if (_imagePreview != null) {
      final isLocal = !_imagePreview!.startsWith('http');
      return ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Stack(
          fit: StackFit.expand,
          children: [
            isLocal
                ? Image.file(File(_imagePreview!), fit: BoxFit.cover)
                : Image.network(
                    _imagePreview!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: const Color(0xFFF0F4FF),
                      child: const Icon(Icons.broken_image,
                          size: 40, color: Colors.grey),
                    ),
                  ),
            Positioned(
              bottom: 8,
              right: 8,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('Tap to change',
                    style: TextStyle(color: Colors.white, fontSize: 12)),
              ),
            ),
          ],
        ),
      );
    }
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.add_photo_alternate_outlined,
            color: AfmColors.navy800.withValues(alpha: 0.35), size: 44),
        const SizedBox(height: 8),
        Text('Tap to add product photo',
            style: TextStyle(
                color: AfmColors.navy800.withValues(alpha: 0.5),
                fontSize: 14,
                fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Text('JPG, PNG or WebP',
            style: TextStyle(
                color: AfmColors.navy800.withValues(alpha: 0.3),
                fontSize: 12)),
      ],
    );
  }

  Widget _buildField(
    String label,
    TextEditingController ctrl, {
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
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
      labelStyle: TextStyle(
          color: AfmColors.navy800.withValues(alpha: 0.7), fontSize: 13),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              const BorderSide(color: AfmColors.magenta600, width: 1.5)),
      errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red)),
    );
  }
}
