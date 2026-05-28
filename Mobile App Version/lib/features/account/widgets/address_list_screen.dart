import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/core/providers/auth_provider.dart';
import 'package:apna_fashion_mart/core/services/api_service.dart';

// ---------------------------------------------------------------------------
// Address model
// ---------------------------------------------------------------------------

class AddressModel {
  const AddressModel({
    required this.id,
    required this.label,
    required this.recipientName,
    required this.phone,
    required this.line1,
    required this.line2,
    required this.city,
    required this.state,
    required this.pincode,
    required this.isDefault,
  });

  final String id;
  final String label;
  final String recipientName;
  final String phone;
  final String line1;
  final String line2;
  final String city;
  final String state;
  final String pincode;
  final bool isDefault;

  factory AddressModel.fromMap(Map<String, dynamic> map) => AddressModel(
        id: map['id'] as String,
        label: map['label'] as String? ?? 'Home',
        recipientName: map['recipient_name'] as String? ?? '',
        phone: map['phone'] as String? ?? '',
        line1: map['line1'] as String? ?? '',
        line2: map['line2'] as String? ?? '',
        city: map['city'] as String? ?? '',
        state: map['state'] as String? ?? '',
        pincode: map['pincode'] as String? ?? '',
        isDefault: map['is_default'] as bool? ?? false,
      );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class AddressListScreen extends ConsumerStatefulWidget {
  const AddressListScreen({super.key});

  @override
  ConsumerState<AddressListScreen> createState() => _AddressListScreenState();
}

class _AddressListScreenState extends ConsumerState<AddressListScreen> {
  final _service = ApiService.instance;
  List<AddressModel> _addresses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  Future<void> _loadAddresses() async {
    final userId = ref.read(authProvider).user?.id;
    if (userId == null) return;

    try {
      final raw = await _service.getAddresses(userId);
      if (mounted) {
        setState(() {
          _addresses = raw.map(AddressModel.fromMap).toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _deleteAddress(String id) async {
    await _service.deleteAddress(id);
    await _loadAddresses();
  }

  Future<void> _showAddressForm({AddressModel? existing}) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _AddressFormSheet(
        existing: existing,
        onSaved: (data) async {
          final userId = ref.read(authProvider).user?.id;
          if (userId == null) return;

          if (existing == null) {
            await _service.addAddress({'user_id': userId, ...data});
          } else {
            await _service.updateAddress(existing.id, data);
          }
          await _loadAddresses();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppColors.navy800,
        foregroundColor: Colors.white,
        title: const Text(
          'Saved Addresses',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddressForm(),
        backgroundColor: AppColors.magenta600,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Address'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _addresses.isEmpty
              ? _EmptyAddresses(onAdd: () => _showAddressForm())
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                  itemCount: _addresses.length,
                  itemBuilder: (_, i) => _AddressCard(
                    address: _addresses[i],
                    onEdit: () => _showAddressForm(existing: _addresses[i]),
                    onDelete: () => _deleteAddress(_addresses[i].id),
                  ),
                ),
    );
  }
}

// ---------------------------------------------------------------------------
// Address card
// ---------------------------------------------------------------------------

class _AddressCard extends StatelessWidget {
  const _AddressCard({
    required this.address,
    required this.onEdit,
    required this.onDelete,
  });

  final AddressModel address;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: address.isDefault
            ? Border.all(color: AppColors.magenta600, width: 1.5)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.navy800.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    address.label,
                    style: const TextStyle(
                      color: AppColors.navy800,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                if (address.isDefault) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.magenta600.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Default',
                      style: TextStyle(
                        color: AppColors.magenta600,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  color: Colors.grey[500],
                  onPressed: onEdit,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 18),
                  color: Colors.red[400],
                  onPressed: onDelete,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              address.recipientName,
              style: const TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 14),
            ),
            const SizedBox(height: 2),
            Text(
              '${address.line1}, ${address.line2}',
              style: TextStyle(color: Colors.grey[600], fontSize: 13),
            ),
            Text(
              '${address.city}, ${address.state} — ${address.pincode}',
              style: TextStyle(color: Colors.grey[600], fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              address.phone,
              style: TextStyle(color: Colors.grey[500], fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyAddresses extends StatelessWidget {
  const _EmptyAddresses({required this.onAdd});
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_off_outlined, size: 72, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'No saved addresses',
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add your delivery address to get started',
            style: TextStyle(color: Colors.grey[400], fontSize: 13),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Add Address'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.magenta600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Address form bottom sheet
// ---------------------------------------------------------------------------

class _AddressFormSheet extends StatefulWidget {
  const _AddressFormSheet({required this.onSaved, this.existing});

  final Future<void> Function(Map<String, dynamic> data) onSaved;
  final AddressModel? existing;

  @override
  State<_AddressFormSheet> createState() => _AddressFormSheetState();
}

class _AddressFormSheetState extends State<_AddressFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _labelCtrl;
  late final TextEditingController _nameCtrl;
  late final TextEditingController _phoneCtrl;
  late final TextEditingController _line1Ctrl;
  late final TextEditingController _line2Ctrl;
  late final TextEditingController _cityCtrl;
  late final TextEditingController _stateCtrl;
  late final TextEditingController _pincodeCtrl;
  bool _isDefault = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _labelCtrl = TextEditingController(text: e?.label ?? 'Home');
    _nameCtrl = TextEditingController(text: e?.recipientName ?? '');
    _phoneCtrl = TextEditingController(text: e?.phone ?? '');
    _line1Ctrl = TextEditingController(text: e?.line1 ?? '');
    _line2Ctrl = TextEditingController(text: e?.line2 ?? '');
    _cityCtrl = TextEditingController(text: e?.city ?? '');
    _stateCtrl = TextEditingController(text: e?.state ?? '');
    _pincodeCtrl = TextEditingController(text: e?.pincode ?? '');
    _isDefault = e?.isDefault ?? false;
  }

  @override
  void dispose() {
    for (final c in [
      _labelCtrl, _nameCtrl, _phoneCtrl, _line1Ctrl,
      _line2Ctrl, _cityCtrl, _stateCtrl, _pincodeCtrl,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    try {
      await widget.onSaved({
        'label': _labelCtrl.text.trim(),
        'recipient_name': _nameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'line1': _line1Ctrl.text.trim(),
        'line2': _line2Ctrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'state': _stateCtrl.text.trim(),
        'pincode': _pincodeCtrl.text.trim(),
        'is_default': _isDefault,
      });
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving address: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _field(TextEditingController ctrl, String label,
      {TextInputType? type, String? Function(String?)? validator}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: ctrl,
        keyboardType: type,
        validator: validator ??
            (v) => v == null || v.trim().isEmpty ? 'Required' : null,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.existing == null ? 'Add Address' : 'Edit Address',
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _field(_labelCtrl, 'Label (Home / Work / Other)'),
              _field(_nameCtrl, 'Recipient Name'),
              _field(_phoneCtrl, 'Phone',
                  type: TextInputType.phone),
              _field(_line1Ctrl, 'Address Line 1'),
              _field(_line2Ctrl, 'Address Line 2',
                  validator: (_) => null),
              Row(children: [
                Expanded(child: _field(_cityCtrl, 'City')),
                const SizedBox(width: 12),
                Expanded(child: _field(_stateCtrl, 'State')),
              ]),
              _field(_pincodeCtrl, 'Pincode',
                  type: TextInputType.number),
              SwitchListTile(
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v),
                title: const Text('Set as default address'),
                activeThumbColor: AppColors.magenta600,
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.magenta600,
                    foregroundColor: Colors.white,
                    padding:
                        const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          widget.existing == null
                              ? 'Save Address'
                              : 'Update Address',
                          style: const TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w600),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
