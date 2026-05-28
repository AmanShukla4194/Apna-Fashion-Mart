import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/core/providers/auth_provider.dart';
import 'package:apna_fashion_mart/core/services/api_service.dart';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const _topSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const _bottomSizes = ['26', '28', '30', '32', '34', '36'];
const _stylePrefs = [
  'Ethnic', 'Western', 'Fusion', 'Casual', 'Formal',
  'Party Wear', 'Traditional', 'Minimalist', 'Boho',
];
const _languages = ['English', 'Hindi'];
const _cities = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _apiService = ApiService.instance;

  File? _pickedImage;
  String? _selectedCity;
  String? _selectedTopSize;
  String? _selectedBottomSize;
  final Set<String> _selectedStyles = {};
  final Set<String> _selectedLanguages = {'English'};
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadCurrentProfile();
  }

  void _loadCurrentProfile() {
    final authState = ref.read(authProvider);
    final user = authState.user;
    final profile = authState.profile;

    if (user != null) {
      _nameController.text = user.name;
    }
    if (profile != null) {
      _phoneController.text = profile['phone'] as String? ?? '';
      _selectedCity = profile['city'] as String?;
      _selectedTopSize = profile['top_size'] as String?;
      _selectedBottomSize = profile['bottom_size'] as String?;

      final styles = profile['style_prefs'] as List<dynamic>?;
      if (styles != null) {
        _selectedStyles.addAll(styles.whereType<String>());
      }

      final langs = profile['languages'] as List<dynamic>?;
      if (langs != null) {
        _selectedLanguages
          ..clear()
          ..addAll(langs.whereType<String>());
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final result = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _ImageSourceSheet(),
    );

    if (result == null) return;
    final picked = await picker.pickImage(source: result, imageQuality: 80);
    if (picked != null) {
      setState(() => _pickedImage = File(picked.path));
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    try {
      final userId = ref.read(authProvider).user?.id;
      if (userId == null) throw Exception('Not authenticated');

      final data = <String, dynamic>{
        'full_name': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        if (_selectedCity != null) 'city': _selectedCity,
        if (_selectedTopSize != null) 'top_size': _selectedTopSize,
        if (_selectedBottomSize != null) 'bottom_size': _selectedBottomSize,
        'style_prefs': _selectedStyles.toList(),
        'languages': _selectedLanguages.toList(),
        'updated_at': DateTime.now().toIso8601String(),
      };

      await _apiService.updateUserProfile(userId, data);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text('Profile updated successfully'),
            ],
          ),
          backgroundColor: Colors.green[700],
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update profile: $e'),
          backgroundColor: Colors.red[700],
        ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final email = user?.email ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AfmColors.navy800,
        foregroundColor: Colors.white,
        title: const Text(
          'Edit Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Avatar ────────────────────────────────────────────────────
            Center(child: _AvatarSection(
              pickedImage: _pickedImage,
              initial: _nameController.text.isNotEmpty
                  ? _nameController.text[0].toUpperCase()
                  : 'U',
              onTap: _pickImage,
            )),
            const SizedBox(height: 24),

            // ── Basic info ────────────────────────────────────────────────
            _FormCard(
              title: 'Basic Information',
              children: [
                _FormField(
                  controller: _nameController,
                  label: 'Full Name',
                  hint: 'Enter your full name',
                  icon: Icons.person_outline,
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Name is required' : null,
                ),
                const SizedBox(height: 16),
                _ReadOnlyField(
                  label: 'Email',
                  value: email,
                  icon: Icons.email_outlined,
                ),
                const SizedBox(height: 16),
                _FormField(
                  controller: _phoneController,
                  label: 'Phone Number',
                  hint: '+91 98765 43210',
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
                _DropdownField<String>(
                  label: 'Default City',
                  icon: Icons.location_city_outlined,
                  value: _selectedCity,
                  items: _cities,
                  itemLabel: (c) => c,
                  onChanged: (v) => setState(() => _selectedCity = v),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // ── Size preferences ──────────────────────────────────────────
            _FormCard(
              title: 'Size Preferences',
              children: [
                _DropdownField<String>(
                  label: 'Top Size',
                  icon: Icons.straighten,
                  value: _selectedTopSize,
                  items: _topSizes,
                  itemLabel: (s) => s,
                  onChanged: (v) => setState(() => _selectedTopSize = v),
                ),
                const SizedBox(height: 16),
                _DropdownField<String>(
                  label: 'Bottom Size (waist in inches)',
                  icon: Icons.straighten,
                  value: _selectedBottomSize,
                  items: _bottomSizes,
                  itemLabel: (s) => s,
                  onChanged: (v) => setState(() => _selectedBottomSize = v),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // ── Style preferences ─────────────────────────────────────────
            _FormCard(
              title: 'Style Preferences',
              children: [
                Text(
                  'Select all that apply',
                  style:
                      TextStyle(color: Colors.grey[500], fontSize: 12),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _stylePrefs.map((style) {
                    final selected = _selectedStyles.contains(style);
                    return FilterChip(
                      label: Text(style),
                      selected: selected,
                      onSelected: (val) {
                        setState(() {
                          if (val) {
                            _selectedStyles.add(style);
                          } else {
                            _selectedStyles.remove(style);
                          }
                        });
                      },
                      selectedColor: AfmColors.magenta600.withValues(alpha: 0.15),
                      checkmarkColor: AfmColors.magenta600,
                      labelStyle: TextStyle(
                        color: selected
                            ? AfmColors.magenta600
                            : Colors.grey[600],
                        fontSize: 13,
                      ),
                      side: BorderSide(
                        color: selected
                            ? AfmColors.magenta600
                            : Colors.grey[300]!,
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // ── Language ──────────────────────────────────────────────────
            _FormCard(
              title: 'Preferred Language',
              children: [
                ..._languages.map(
                  (lang) => CheckboxListTile(
                    value: _selectedLanguages.contains(lang),
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          _selectedLanguages.add(lang);
                        } else {
                          // Keep at least one
                          if (_selectedLanguages.length > 1) {
                            _selectedLanguages.remove(lang);
                          }
                        }
                      });
                    },
                    title: Text(lang,
                        style: const TextStyle(fontSize: 14)),
                    activeColor: AfmColors.magenta600,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // ── Save button ───────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AfmColors.magenta600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Save Profile',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Avatar section
// ---------------------------------------------------------------------------

class _AvatarSection extends StatelessWidget {
  const _AvatarSection({
    required this.pickedImage,
    required this.initial,
    required this.onTap,
  });

  final File? pickedImage;
  final String initial;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        alignment: Alignment.bottomRight,
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: AfmColors.magenta600,
            backgroundImage:
                pickedImage != null ? FileImage(pickedImage!) : null,
            child: pickedImage == null
                ? Text(
                    initial,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AfmColors.navy800,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Image source sheet
// ---------------------------------------------------------------------------

class _ImageSourceSheet extends StatelessWidget {
  const _ImageSourceSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Change Profile Photo',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ListTile(
            leading: const Icon(Icons.camera_alt_outlined),
            title: const Text('Take Photo'),
            onTap: () => Navigator.of(context).pop(ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library_outlined),
            title: const Text('Choose from Gallery'),
            onTap: () => Navigator.of(context).pop(ImageSource.gallery),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------

class _FormCard extends StatelessWidget {
  const _FormCard({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AfmColors.navy800,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  const _FormField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.icon,
    this.validator,
    this.keyboardType,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final IconData icon;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: Colors.grey[500], size: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AfmColors.magenta600, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }
}

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return InputDecorator(
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Colors.grey[400], size: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        filled: true,
        fillColor: Colors.grey[50],
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      child: Text(
        value,
        style: TextStyle(color: Colors.grey[500], fontSize: 14),
      ),
    );
  }
}

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.icon,
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
  });

  final String label;
  final IconData icon;
  final T? value;
  final List<T> items;
  final String Function(T) itemLabel;
  final void Function(T?) onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Colors.grey[500], size: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AfmColors.magenta600, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      items: items
          .map(
            (item) => DropdownMenuItem<T>(
              value: item,
              child: Text(itemLabel(item)),
            ),
          )
          .toList(),
    );
  }
}
