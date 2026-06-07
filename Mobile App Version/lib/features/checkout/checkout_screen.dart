import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/core/providers/cart_provider.dart';
import 'package:apna_fashion_mart/core/services/razorpay_service.dart';
import 'package:apna_fashion_mart/core/services/api_service.dart';
import 'package:apna_fashion_mart/models/cart_item_model.dart';

// ---------------------------------------------------------------------------
// Data models
// ---------------------------------------------------------------------------

class DeliveryAddress {
  final String id;
  final String label;
  final String fullName;
  final String phone;
  final String line1;
  final String? line2;
  final String city;
  final String state;
  final String pincode;

  const DeliveryAddress({
    required this.id,
    required this.label,
    required this.fullName,
    required this.phone,
    required this.line1,
    this.line2,
    required this.city,
    required this.state,
    required this.pincode,
  });

  String get formatted =>
      '$fullName\n$line1${line2 != null && line2!.isNotEmpty ? ', $line2' : ''}\n$city, $state – $pincode\n$phone';
}

enum PaymentMethod { razorpay, cod, wallet }

// ---------------------------------------------------------------------------
// CheckoutScreen
// ---------------------------------------------------------------------------

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int _currentStep = 0;
  DeliveryAddress? _selectedAddress;
  PaymentMethod _selectedPayment = PaymentMethod.razorpay;
  String? _selectedOffer;
  bool _isPlacingOrder = false;

  late final RazorpayService _razorpayService;

  List<DeliveryAddress> _savedAddresses = [];
  bool _loadingAddresses = true;

  static const Map<String, double> _offers = {
    'HDFC10': 0.10,
    'FIRST5': 0.05,
  };

  static const double _walletBalance = 420;

  @override
  void initState() {
    super.initState();
    _razorpayService = RazorpayService();
    _razorpayService.initRazorpay(
      onSuccess: _onPaymentSuccess,
      onError: _onPaymentError,
      onExternalWallet: _onExternalWallet,
    );
    _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    try {
      final list = await ApiService.instance.getAddresses('');
      if (!mounted) return;
      setState(() {
        _savedAddresses = list.map((a) => DeliveryAddress(
          id: a['id'] as String? ?? '',
          label: (a['type'] as String? ?? 'home').toUpperCase(),
          fullName: a['full_name'] as String? ?? '',
          phone: a['phone'] as String? ?? '',
          line1: a['line1'] as String? ?? '',
          line2: a['line2'] as String?,
          city: a['city'] as String? ?? '',
          state: a['state'] as String? ?? '',
          pincode: a['pincode'] as String? ?? '',
        )).toList();
        _loadingAddresses = false;
        if (_savedAddresses.isNotEmpty) {
          _selectedAddress = _savedAddresses.first;
        }
      });
    } catch (_) {
      if (mounted) setState(() => _loadingAddresses = false);
    }
  }

  @override
  void dispose() {
    _razorpayService.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Calculations
  // ---------------------------------------------------------------------------

  int get _cartTotal => ref.read(cartTotalProvider);
  int get _offerDiscount => _selectedOffer != null
      ? (_cartTotal * (_offers[_selectedOffer!] ?? 0)).round()
      : 0;
  int get _codFee => _selectedPayment == PaymentMethod.cod && _cartTotal < 1499 ? 40 : 0;
  int get _deliveryFee => _cartTotal >= 999 ? 0 : 49;
  int get _finalTotal => _cartTotal + _deliveryFee + _codFee - _offerDiscount;

  // ---------------------------------------------------------------------------
  // Razorpay callbacks
  // ---------------------------------------------------------------------------

  void _onPaymentSuccess(PaymentSuccessResponse response) async {
    try {
      final cartItems = ref.read(cartProvider);
      final orderItems = cartItems.map((i) => {
        'productId': i.productId,
        'quantity': i.quantity,
        'size': i.size.isNotEmpty ? i.size : null,
        'color': i.color.isNotEmpty ? i.color : null,
      }).toList();

      final orderId = await ApiService.instance.createOrder({
        'items': orderItems,
        'addressId': _selectedAddress!.id,
        'paymentMethod': 'razorpay',
        'razorpayOrderId': response.orderId,
        'razorpayPaymentId': response.paymentId,
        'razorpaySignature': response.signature,
      });

      ref.read(cartProvider.notifier).clearCart();
      if (mounted) context.go('/checkout/success/$orderId');
    } catch (e) {
      if (mounted) _showError('Payment received but order creation failed. Contact support.');
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }

  void _onPaymentError(PaymentFailureResponse response) {
    if (mounted) _showError(response.message ?? 'Payment failed');
    setState(() => _isPlacingOrder = false);
  }

  void _onExternalWallet(ExternalWalletResponse response) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('External wallet selected: ${response.walletName}'),
          backgroundColor: AfmColors.navy800,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AfmColors.neutral50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: AfmColors.navy800),
          onPressed: () {
            if (_currentStep > 0) {
              setState(() => _currentStep--);
            } else {
              context.pop();
            }
          },
        ),
        title: Text(
          ['Delivery', 'Payment', 'Review Order'][_currentStep],
          style: const TextStyle(fontWeight: FontWeight.w700, color: AfmColors.navy800),
        ),
      ),
      body: Column(
        children: [
          _buildStepIndicator(),
          Expanded(
            child: IndexedStack(
              index: _currentStep,
              children: [
                _buildDeliveryStep(),
                _buildPaymentStep(cartItems),
                _buildReviewStep(cartItems),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(cartItems),
    );
  }

  Widget _buildStepIndicator() {
    const steps = ['Delivery', 'Payment', 'Review'];
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      child: Row(
        children: List.generate(steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            final stepIndex = i ~/ 2;
            return Expanded(
              child: Container(
                height: 2,
                color: stepIndex < _currentStep ? AfmColors.magenta600 : AfmColors.neutral200,
              ),
            );
          }
          final stepIndex = i ~/ 2;
          final isDone = stepIndex < _currentStep;
          final isActive = stepIndex == _currentStep;
          return Column(
            children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDone ? AfmColors.magenta600 : isActive ? AfmColors.navy800 : AfmColors.neutral200,
                ),
                child: Center(
                  child: isDone
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text('${stepIndex + 1}', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: isActive ? Colors.white : AfmColors.neutral500)),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                steps[stepIndex],
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  color: isActive ? AfmColors.navy800 : AfmColors.neutral500,
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Step 1: Delivery
  // -------------------------------------------------------------------------

  Widget _buildDeliveryStep() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Select Delivery Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
        const SizedBox(height: 12),
        ..._savedAddresses.map((addr) => _AddressTile(
          address: addr,
          isSelected: _selectedAddress?.id == addr.id,
          onSelect: () => setState(() => _selectedAddress = addr),
        )),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => context.push('/checkout/address'),
          icon: const Icon(Icons.add_location_alt_outlined, color: AfmColors.magenta600),
          label: const Text('Add New Address', style: TextStyle(color: AfmColors.magenta600, fontWeight: FontWeight.w600)),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AfmColors.magenta600),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
        if (_selectedAddress != null) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF16A34A)),
            ),
            child: const Row(
              children: [
                Icon(Icons.local_shipping_outlined, color: Color(0xFF16A34A), size: 20),
                SizedBox(width: 10),
                Expanded(child: Text('Estimated delivery: 2–4 business days', style: TextStyle(fontSize: 13, color: Color(0xFF16A34A), fontWeight: FontWeight.w600))),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // -------------------------------------------------------------------------
  // Step 2: Payment
  // -------------------------------------------------------------------------

  Widget _buildPaymentStep(List<CartItemModel> cartItems) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Choose Payment Method', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
        const SizedBox(height: 12),

        _PaymentOptionTile(
          value: PaymentMethod.razorpay, groupValue: _selectedPayment,
          onChanged: (v) => setState(() => _selectedPayment = v!),
          icon: Icons.payment_rounded, title: 'Razorpay',
          subtitle: 'UPI, Cards, Net Banking, Wallets',
          badge: 'Recommended', badgeColor: AfmColors.magenta600,
        ),
        const SizedBox(height: 8),
        _PaymentOptionTile(
          value: PaymentMethod.cod, groupValue: _selectedPayment,
          onChanged: (v) => setState(() => _selectedPayment = v!),
          icon: Icons.money_outlined, title: 'Cash on Delivery',
          subtitle: _cartTotal >= 1499 ? 'COD fee waived (order above ₹1,499)' : 'Extra ₹40 COD fee applies',
          badge: _cartTotal >= 1499 ? 'FREE COD' : null, badgeColor: const Color(0xFF16A34A),
        ),
        const SizedBox(height: 8),
        _PaymentOptionTile(
          value: PaymentMethod.wallet, groupValue: _selectedPayment,
          onChanged: (v) => setState(() => _selectedPayment = v!),
          icon: Icons.account_balance_wallet_outlined, title: 'Apna Wallet',
          subtitle: 'Balance: ₹${_walletBalance.toStringAsFixed(0)}',
          badge: _walletBalance >= _finalTotal ? 'Full payment' : 'Partial',
          badgeColor: AfmColors.gold500,
        ),

        const SizedBox(height: 20),
        const Text('Available Offers', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
        const SizedBox(height: 10),
        _OfferTile(
          code: 'HDFC10', description: '10% off on HDFC card payments (max ₹300)',
          isSelected: _selectedOffer == 'HDFC10',
          onToggle: () => setState(() { _selectedOffer = _selectedOffer == 'HDFC10' ? null : 'HDFC10'; }),
        ),
        const SizedBox(height: 8),
        _OfferTile(
          code: 'FIRST5', description: '5% off on your first order (max ₹150)',
          isSelected: _selectedOffer == 'FIRST5',
          onToggle: () => setState(() { _selectedOffer = _selectedOffer == 'FIRST5' ? null : 'FIRST5'; }),
        ),
        const SizedBox(height: 20),
        _buildMiniPriceSummary(),
      ],
    );
  }

  Widget _buildMiniPriceSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AfmColors.neutral200)),
      child: Column(
        children: [
          _SummaryRow('Subtotal', '₹$_cartTotal'),
          const SizedBox(height: 6),
          _SummaryRow('Delivery', _deliveryFee == 0 ? 'FREE' : '₹$_deliveryFee', valueColor: _deliveryFee == 0 ? const Color(0xFF16A34A) : null),
          if (_codFee > 0) ...[
            const SizedBox(height: 6),
            _SummaryRow('COD Fee', '₹$_codFee'),
          ],
          if (_offerDiscount > 0) ...[
            const SizedBox(height: 6),
            _SummaryRow('Offer Discount', '− ₹$_offerDiscount', valueColor: const Color(0xFF16A34A)),
          ],
          const SizedBox(height: 10),
          const Divider(color: AfmColors.neutral200),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AfmColors.navy800)),
              Text('₹$_finalTotal', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AfmColors.navy800)),
            ],
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Step 3: Review
  // -------------------------------------------------------------------------

  Widget _buildReviewStep(List<CartItemModel> cartItems) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Order Summary', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
        const SizedBox(height: 12),
        ...cartItems.map((item) => _ReviewItemTile(item: item)),
        const SizedBox(height: 16),

        if (_selectedAddress != null) ...[
          _buildSectionCard(
            icon: Icons.location_on_outlined, title: 'Delivering to',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AfmColors.magenta100, borderRadius: BorderRadius.circular(6)),
                  child: Text(_selectedAddress!.label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AfmColors.magenta600)),
                ),
                const SizedBox(height: 6),
                Text(_selectedAddress!.formatted, style: const TextStyle(fontSize: 13, color: AfmColors.neutral700, height: 1.5)),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],

        _buildSectionCard(
          icon: Icons.payment_outlined, title: 'Payment',
          child: Row(
            children: [
              Icon(_paymentIcon(_selectedPayment), size: 20, color: AfmColors.navy800),
              const SizedBox(width: 8),
              Text(_paymentLabel(_selectedPayment), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AfmColors.navy800)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _buildMiniPriceSummary(),
        const SizedBox(height: 80),
      ],
    );
  }

  Widget _buildSectionCard({required IconData icon, required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AfmColors.neutral200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(icon, size: 18, color: AfmColors.magenta600),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
          ]),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  IconData _paymentIcon(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.razorpay: return Icons.payment_rounded;
      case PaymentMethod.cod: return Icons.money_outlined;
      case PaymentMethod.wallet: return Icons.account_balance_wallet_outlined;
    }
  }

  String _paymentLabel(PaymentMethod method) {
    switch (method) {
      case PaymentMethod.razorpay: return 'Razorpay (UPI / Card / Net Banking)';
      case PaymentMethod.cod: return 'Cash on Delivery';
      case PaymentMethod.wallet: return 'Apna Wallet (₹${_walletBalance.toStringAsFixed(0)})';
    }
  }

  // -------------------------------------------------------------------------
  // Bottom bar
  // -------------------------------------------------------------------------

  Widget _buildBottomBar(List<CartItemModel> cartItems) {
    final isLastStep = _currentStep == 2;
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, -4))],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isLastStep)
              const Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.lock_outline, size: 14, color: AfmColors.neutral500),
                    SizedBox(width: 4),
                    Text('Secured by Razorpay · 256-bit SSL', style: TextStyle(fontSize: 11, color: AfmColors.neutral500)),
                  ],
                ),
              ),
            SizedBox(
              width: double.infinity, height: 52,
              child: _isPlacingOrder
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
                      ),
                      child: ElevatedButton(
                        onPressed: () => _handleNextOrPlace(cartItems),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: Text(
                          isLastStep ? 'Place Order · ₹$_finalTotal' : 'Continue',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleNextOrPlace(List<CartItemModel> cartItems) {
    if (_currentStep == 0) {
      if (_selectedAddress == null) { _showError('Please select a delivery address'); return; }
      setState(() => _currentStep = 1);
    } else if (_currentStep == 1) {
      setState(() => _currentStep = 2);
    } else {
      _placeOrder(cartItems);
    }
  }

  Future<void> _placeOrder(List<CartItemModel> cartItems) async {
    if (_selectedAddress == null) { _showError('No delivery address selected'); return; }
    setState(() => _isPlacingOrder = true);
    try {
      if (_selectedPayment == PaymentMethod.razorpay) {
        // Create Razorpay order on backend first
        final rzpOrder = await ApiService.instance.createRazorpayOrder(_finalTotal * 100);
        _razorpayService.openPayment(
          amount: _finalTotal * 100,
          orderId: rzpOrder['id'] as String,
          name: _selectedAddress!.fullName,
          email: 'user@apnafashionmart.in',
          phone: _selectedAddress!.phone.replaceAll(RegExp(r'[^0-9]'), ''),
          description: 'Apna Fashion Mart Order',
        );
        // Result handled in _onPaymentSuccess / _onPaymentError
      } else {
        // COD — create order directly in DB
        final cartItems = ref.read(cartProvider);
        final orderItems = cartItems.map((i) => {
          'productId': i.productId,
          'quantity': i.quantity,
          'size': i.size.isNotEmpty ? i.size : null,
          'color': i.color.isNotEmpty ? i.color : null,
        }).toList();

        final orderId = await ApiService.instance.createOrder({
          'items': orderItems,
          'addressId': _selectedAddress!.id,
          'paymentMethod': 'cod',
        });
        ref.read(cartProvider.notifier).clearCart();
        if (mounted) context.go('/checkout/success/$orderId');
      }
    } catch (e) {
      if (mounted) _showError(e.toString());
    } finally {
      if (mounted && _selectedPayment != PaymentMethod.razorpay) {
        setState(() => _isPlacingOrder = false);
      }
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
}

// ---------------------------------------------------------------------------
// Sub-widgets
// ---------------------------------------------------------------------------

class _AddressTile extends StatelessWidget {
  final DeliveryAddress address;
  final bool isSelected;
  final VoidCallback onSelect;

  const _AddressTile({required this.address, required this.isSelected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onSelect,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AfmColors.magenta100 : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AfmColors.magenta600 : AfmColors.neutral200, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 20, height: 20,
              margin: const EdgeInsets.only(top: 2),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: isSelected ? AfmColors.magenta600 : AfmColors.neutral500, width: 2),
                color: isSelected ? AfmColors.magenta600 : Colors.transparent,
              ),
              child: isSelected ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isSelected ? AfmColors.magenta600 : AfmColors.neutral200,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(address.label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : AfmColors.neutral700)),
                  ),
                  const SizedBox(height: 6),
                  Text(address.fullName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AfmColors.navy800)),
                  const SizedBox(height: 2),
                  Text(
                    '${address.line1}${address.line2 != null ? ', ${address.line2}' : ''}\n${address.city}, ${address.state} – ${address.pincode}',
                    style: const TextStyle(fontSize: 12, color: AfmColors.neutral500, height: 1.4),
                  ),
                  const SizedBox(height: 4),
                  Text(address.phone, style: const TextStyle(fontSize: 12, color: AfmColors.neutral700, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle_rounded, color: AfmColors.magenta600, size: 22),
          ],
        ),
      ),
    );
  }
}

class _PaymentOptionTile extends StatelessWidget {
  final PaymentMethod value;
  final PaymentMethod groupValue;
  final ValueChanged<PaymentMethod?> onChanged;
  final IconData icon;
  final String title;
  final String subtitle;
  final String? badge;
  final Color? badgeColor;

  const _PaymentOptionTile({
    required this.value, required this.groupValue, required this.onChanged,
    required this.icon, required this.title, required this.subtitle,
    this.badge, this.badgeColor,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? AfmColors.magenta100 : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AfmColors.magenta600 : AfmColors.neutral200, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: isSelected ? AfmColors.magenta600 : AfmColors.neutral100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: isSelected ? Colors.white : AfmColors.neutral700, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AfmColors.navy800)),
                      if (badge != null) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(color: badgeColor ?? AfmColors.magenta600, borderRadius: BorderRadius.circular(6)),
                          child: Text(badge!, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                        ),
                      ],
                    ],
                  ),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: AfmColors.neutral500)),
                ],
              ),
            ),
            Radio<PaymentMethod>(value: value, groupValue: groupValue, onChanged: onChanged, activeColor: AfmColors.magenta600),
          ],
        ),
      ),
    );
  }
}

class _OfferTile extends StatelessWidget {
  final String code;
  final String description;
  final bool isSelected;
  final VoidCallback onToggle;

  const _OfferTile({required this.code, required this.description, required this.isSelected, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0FDF4) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? const Color(0xFF16A34A) : AfmColors.neutral200, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF16A34A) : AfmColors.neutral100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(code, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: isSelected ? Colors.white : AfmColors.navy800, letterSpacing: 0.5)),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(description, style: const TextStyle(fontSize: 12, color: AfmColors.neutral700))),
            Checkbox(
              value: isSelected,
              onChanged: (_) => onToggle(),
              activeColor: const Color(0xFF16A34A),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReviewItemTile extends StatelessWidget {
  final CartItemModel item;
  const _ReviewItemTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: AfmColors.neutral200)),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              item.imageUrl,
              width: 56, height: 56, fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(width: 56, height: 56, color: AfmColors.neutral100, child: const Icon(Icons.image_outlined, size: 24, color: AfmColors.neutral500)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AfmColors.navy800), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text(item.store, style: const TextStyle(fontSize: 11, color: AfmColors.neutral500)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('₹${item.subtotal}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
              Text('Qty: ${item.quantity}', style: const TextStyle(fontSize: 11, color: AfmColors.neutral500)),
            ],
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  const _SummaryRow(this.label, this.value, {this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AfmColors.neutral500)),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: valueColor ?? AfmColors.neutral700)),
      ],
    );
  }
}
