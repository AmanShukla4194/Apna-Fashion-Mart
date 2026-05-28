import 'package:flutter/material.dart';
import '../../core/theme/afm_theme.dart';

class VendorStoreSetupScreen extends StatefulWidget {
  const VendorStoreSetupScreen({super.key});

  @override
  State<VendorStoreSetupScreen> createState() => _VendorStoreSetupScreenState();
}

class _VendorStoreSetupScreenState extends State<VendorStoreSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController(text: 'My Boutique');
  final _descCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _city = 'Mumbai';
  bool _saving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _addressCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() => _saving = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Store profile updated!'), backgroundColor: Colors.green),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        title: const Text('Store Setup', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AfmColors.navy800.withValues(alpha: 0.1),
                    child: Icon(Icons.store_outlined, size: 40, color: AfmColors.navy800.withValues(alpha: 0.5)),
                  ),
                  Positioned(
                    bottom: 0, right: 0,
                    child: GestureDetector(
                      onTap: () {},
                      child: const CircleAvatar(
                        radius: 16,
                        backgroundColor: AfmColors.magenta600,
                        child: Icon(Icons.camera_alt, color: Colors.white, size: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Store Information', style: TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold,
              color: AfmColors.navy800, fontFamily: 'PlayfairDisplay',
            )),
            const SizedBox(height: 12),
            _buildField('Store Name *', _nameCtrl, validator: (v) => (v?.isEmpty ?? true) ? 'Required' : null),
            const SizedBox(height: 12),
            _buildField('Description', _descCtrl, hint: 'Tell customers about your boutique…', maxLines: 3),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _city,
              decoration: _inputDecoration('City *'),
              items: ['Mumbai', 'Bengaluru', 'Delhi', 'Jaipur', 'Hyderabad']
                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                .toList(),
              onChanged: (v) => setState(() => _city = v!),
            ),
            const SizedBox(height: 12),
            _buildField('Store Address', _addressCtrl, hint: 'Street, Area, PIN'),
            const SizedBox(height: 12),
            _buildField('Contact Phone', _phoneCtrl, hint: '+91 98765 43210', keyboardType: TextInputType.phone),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F7FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.verified_outlined, color: Color(0xFF3B82F6), size: 18),
                      SizedBox(width: 8),
                      Text('Verification Process', style: TextStyle(fontWeight: FontWeight.bold, color: AfmColors.navy800)),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'After submission, an Apna associate will visit your store within 48 hours. Have your GST certificate and PAN card ready for the verification visit.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF4B5563)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 52,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AfmColors.magenta600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Save Store Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
      filled: true, fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AfmColors.magenta600, width: 1.5)),
      errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red)),
    );
  }
}
