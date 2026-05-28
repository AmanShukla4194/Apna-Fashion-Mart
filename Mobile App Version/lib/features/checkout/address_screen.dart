import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/core/providers/auth_provider.dart';
import 'package:apna_fashion_mart/core/services/api_service.dart';

class AddressScreen extends ConsumerStatefulWidget {
  final String? addressId;

  const AddressScreen({super.key, this.addressId});

  @override
  ConsumerState<AddressScreen> createState() => _AddressScreenState();
}

class _AddressScreenState extends ConsumerState<AddressScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();
  final _line1Ctrl = TextEditingController();
  final _line2Ctrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();

  String _selectedLabel = 'HOME';
  bool _isSaving = false;
  bool _isLoadingLocation = false;
  bool _isLookingUpPincode = false;

  static const _labels = ['HOME', 'WORK', 'OTHER'];

  static const Map<String, Map<String, String>> _pincodeData = {
    '110001': {'city': 'New Delhi', 'state': 'Delhi'},
    '110002': {'city': 'New Delhi', 'state': 'Delhi'},
    '400001': {'city': 'Mumbai', 'state': 'Maharashtra'},
    '560001': {'city': 'Bengaluru', 'state': 'Karnataka'},
    '600001': {'city': 'Chennai', 'state': 'Tamil Nadu'},
    '700001': {'city': 'Kolkata', 'state': 'West Bengal'},
    '122002': {'city': 'Gurugram', 'state': 'Haryana'},
    '302001': {'city': 'Jaipur', 'state': 'Rajasthan'},
    '226001': {'city': 'Lucknow', 'state': 'Uttar Pradesh'},
    '500001': {'city': 'Hyderabad', 'state': 'Telangana'},
  };

  @override
  void dispose() {
    _fullNameCtrl.dispose();
    _phoneCtrl.dispose();
    _pincodeCtrl.dispose();
    _line1Ctrl.dispose();
    _line2Ctrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    super.dispose();
  }

  void _onPincodeChanged(String value) {
    if (value.length == 6) _lookupPincode(value);
  }

  Future<void> _lookupPincode(String pincode) async {
    setState(() => _isLookingUpPincode = true);
    await Future.delayed(const Duration(milliseconds: 400));
    final data = _pincodeData[pincode];
    if (mounted) {
      setState(() {
        if (data != null) {
          _cityCtrl.text = data['city']!;
          _stateCtrl.text = data['state']!;
        }
        _isLookingUpPincode = false;
      });
    }
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _isLoadingLocation = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showError('Location permission denied');
          return;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        _showError('Enable location access in Settings');
        return;
      }
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 10),
      );
      if (mounted) {
        _pincodeCtrl.text = '110001';
        _cityCtrl.text = 'New Delhi';
        _stateCtrl.text = 'Delhi';
        _line2Ctrl.text =
            'Near (${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)})';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Location fetched. Please verify your address.'),
            backgroundColor: AfmColors.navy800,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    } catch (e) {
      if (mounted) _showError('Could not get location');
    } finally {
      if (mounted) setState(() => _isLoadingLocation = false);
    }
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final userId = ref.read(currentUserProvider)?.id;
      final service = ApiService.instance;
      final data = {
        'label': _selectedLabel,
        'full_name': _fullNameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'pincode': _pincodeCtrl.text.trim(),
        'line1': _line1Ctrl.text.trim(),
        'line2': _line2Ctrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'state': _stateCtrl.text.trim(),
        if (userId != null) 'user_id': userId,
      };

      if (widget.addressId == null) {
        await service.addAddress(data);
      } else {
        await service.updateAddress(widget.addressId!, data);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.addressId == null ? 'Address saved!' : 'Address updated!'),
            backgroundColor: const Color(0xFF16A34A),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) _showError(e.toString());
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red[700],
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AfmColors.neutral50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: AfmColors.navy800),
          onPressed: () => context.pop(),
        ),
        title: Text(
          widget.addressId == null ? 'Add New Address' : 'Edit Address',
          style: const TextStyle(fontWeight: FontWeight.w700, color: AfmColors.navy800),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Label selector
            const _SectionHeader(text: 'Address Type'),
            const SizedBox(height: 10),
            Row(
              children: _labels.map((label) {
                final isSelected = _selectedLabel == label;
                return Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedLabel = label),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? AfmColors.navy800 : Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? AfmColors.navy800 : AfmColors.neutral200,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            label == 'HOME' ? Icons.home_outlined : label == 'WORK' ? Icons.work_outline : Icons.location_on_outlined,
                            size: 16,
                            color: isSelected ? Colors.white : AfmColors.neutral700,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            label,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: isSelected ? Colors.white : AfmColors.neutral700,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // Use current location
            OutlinedButton.icon(
              onPressed: _isLoadingLocation ? null : _useCurrentLocation,
              icon: _isLoadingLocation
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AfmColors.magenta600))
                  : const Icon(Icons.my_location_rounded, size: 18, color: AfmColors.magenta600),
              label: Text(
                _isLoadingLocation ? 'Getting location...' : 'Use current location',
                style: const TextStyle(color: AfmColors.magenta600, fontWeight: FontWeight.w600),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AfmColors.magenta600),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),

            const SizedBox(height: 24),
            const _SectionHeader(text: 'Contact Information'),
            const SizedBox(height: 12),

            _buildLabel('Full Name *'),
            const SizedBox(height: 6),
            _buildTextField(controller: _fullNameCtrl, hint: 'Enter your full name', prefixIcon: Icons.person_outline_rounded, textCapitalization: TextCapitalization.words, validator: (v) => (v == null || v.trim().isEmpty) ? 'Full name is required' : null),
            const SizedBox(height: 14),

            _buildLabel('Mobile Number *'),
            const SizedBox(height: 6),
            _buildTextField(
              controller: _phoneCtrl, hint: '10-digit mobile number', prefixIcon: Icons.phone_outlined, keyboardType: TextInputType.phone,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)],
              validator: (v) { if (v == null || v.trim().isEmpty) return 'Phone number is required'; if (v.trim().length < 10) return 'Enter a valid 10-digit number'; return null; },
            ),

            const SizedBox(height: 24),
            const _SectionHeader(text: 'Address Details'),
            const SizedBox(height: 12),

            _buildLabel('Pincode *'),
            const SizedBox(height: 6),
            _buildTextField(
              controller: _pincodeCtrl, hint: '6-digit pincode', prefixIcon: Icons.pin_drop_outlined, keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
              onChanged: _onPincodeChanged,
              suffixWidget: _isLookingUpPincode
                  ? const Padding(padding: EdgeInsets.all(12), child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AfmColors.magenta600)))
                  : null,
              validator: (v) { if (v == null || v.trim().isEmpty) return 'Pincode is required'; if (v.trim().length != 6) return 'Enter a valid 6-digit pincode'; return null; },
            ),
            const SizedBox(height: 14),

            _buildLabel('Flat / House / Building *'),
            const SizedBox(height: 6),
            _buildTextField(controller: _line1Ctrl, hint: 'Flat no., Building name', prefixIcon: Icons.home_outlined, textCapitalization: TextCapitalization.sentences, validator: (v) => (v == null || v.trim().isEmpty) ? 'Address line 1 is required' : null),
            const SizedBox(height: 14),

            _buildLabel('Area / Landmark (optional)'),
            const SizedBox(height: 6),
            _buildTextField(controller: _line2Ctrl, hint: 'Street, area, landmark', prefixIcon: Icons.location_city_outlined, textCapitalization: TextCapitalization.sentences),
            const SizedBox(height: 14),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('City *'),
                      const SizedBox(height: 6),
                      _buildTextField(controller: _cityCtrl, hint: 'City', prefixIcon: Icons.location_on_outlined, textCapitalization: TextCapitalization.words, validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('State *'),
                      const SizedBox(height: 6),
                      _buildTextField(controller: _stateCtrl, hint: 'State', prefixIcon: Icons.map_outlined, textCapitalization: TextCapitalization.words, validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 32),

            SizedBox(
              height: 52,
              child: _isSaving
                  ? Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AfmColors.navy800, Color(0xFF6D1B5C), AfmColors.magenta600]),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Center(child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))),
                    )
                  : DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AfmColors.navy800, Color(0xFF6D1B5C), AfmColors.magenta600]),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [BoxShadow(color: AfmColors.magenta600.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))],
                      ),
                      child: ElevatedButton(
                        onPressed: _saveAddress,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Text(
                          widget.addressId == null ? 'Save Address' : 'Update Address',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ),
                    ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AfmColors.navy800));
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData prefixIcon,
    TextInputType? keyboardType,
    TextCapitalization textCapitalization = TextCapitalization.none,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    Widget? suffixWidget,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      inputFormatters: inputFormatters,
      onChanged: onChanged,
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AfmColors.neutral500, fontSize: 13),
        prefixIcon: Icon(prefixIcon, color: AfmColors.neutral500, size: 20),
        suffixIcon: suffixWidget,
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AfmColors.neutral200)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AfmColors.neutral200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AfmColors.magenta600, width: 1.5)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.red[400]!, width: 1.5)),
        focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.red[400]!, width: 1.5)),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader({required this.text});

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AfmColors.navy800));
  }
}
