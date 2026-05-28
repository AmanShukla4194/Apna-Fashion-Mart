import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/core/providers/cart_provider.dart';
import 'package:apna_fashion_mart/core/providers/auth_provider.dart';
import 'package:apna_fashion_mart/models/cart_item_model.dart';
import 'package:apna_fashion_mart/features/cart/widgets/cart_item_tile.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final _couponController = TextEditingController();
  String? _appliedCoupon;
  double _discountRate = 0;
  bool _applyingCoupon = false;

  static const _validCoupons = <String, double>{
    'SAVE10': 0.10,
    'FIRST5': 0.05,
    'AFM20': 0.20,
  };

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  Future<void> _applyCoupon() async {
    final code = _couponController.text.trim().toUpperCase();
    if (code.isEmpty) return;
    setState(() => _applyingCoupon = true);
    await Future.delayed(const Duration(milliseconds: 600));
    final rate = _validCoupons[code];
    if (!mounted) return;
    setState(() {
      _applyingCoupon = false;
      if (rate != null) {
        _appliedCoupon = code;
        _discountRate = rate;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Coupon $code applied! ${(rate * 100).toInt()}% off'),
            backgroundColor: Colors.green[700],
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      } else {
        _appliedCoupon = null;
        _discountRate = 0;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Invalid coupon code'),
            backgroundColor: Colors.red[700],
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    });
  }

  void _handleCheckout(bool isAuthenticated) {
    if (!isAuthenticated) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text(
            'Sign in to continue',
            style: TextStyle(fontWeight: FontWeight.w700, color: AfmColors.navy800),
          ),
          content: const Text(
            'Please sign in to proceed with your checkout.',
            style: TextStyle(color: AfmColors.neutral500),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AfmColors.neutral500)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.push('/login?redirect=/checkout');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AfmColors.magenta600,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Sign In'),
            ),
          ],
        ),
      );
    } else {
      context.push('/checkout');
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);
    final cartCount = ref.watch(cartCountProvider);
    final cartTotal = ref.watch(cartTotalProvider); // int (paise-free rupees)
    final isAuthenticated = ref.watch(isAuthenticatedProvider);

    const deliveryThreshold = 999;
    const deliveryFee = 49;
    final deliveryCharge = cartTotal >= deliveryThreshold ? 0 : deliveryFee;
    final discountAmount = (cartTotal * _discountRate).round();
    final finalTotal = cartTotal + deliveryCharge - discountAmount;

    return Scaffold(
      backgroundColor: AfmColors.neutral50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Text(
          cartCount == 0 ? 'Your Bag' : 'Your Bag ($cartCount)',
          style: const TextStyle(fontWeight: FontWeight.w700, color: AfmColors.navy800),
        ),
        actions: [
          if (cartItems.isNotEmpty)
            TextButton(
              onPressed: () => showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  title: const Text('Clear cart?'),
                  content: const Text('Remove all items from your bag?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                    TextButton(
                      onPressed: () {
                        ref.read(cartProvider.notifier).clearCart();
                        Navigator.pop(ctx);
                      },
                      child: Text('Clear', style: TextStyle(color: Colors.red[700])),
                    ),
                  ],
                ),
              ),
              child: const Text('Clear', style: TextStyle(color: AfmColors.neutral500, fontSize: 13)),
            ),
        ],
      ),
      body: cartItems.isEmpty
          ? _buildEmptyCart()
          : _buildCartContent(
              cartItems: cartItems,
              cartTotal: cartTotal,
              deliveryCharge: deliveryCharge,
              discountAmount: discountAmount,
              finalTotal: finalTotal,
            ),
      bottomNavigationBar: cartItems.isEmpty
          ? null
          : _buildCheckoutBar(finalTotal, isAuthenticated),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: const BoxDecoration(color: AfmColors.magenta100, shape: BoxShape.circle),
              child: const Icon(Icons.shopping_bag_outlined, size: 56, color: AfmColors.magenta600),
            ),
            const SizedBox(height: 24),
            const Text(
              'Your bag is empty',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AfmColors.navy800),
            ),
            const SizedBox(height: 8),
            const Text(
              'Discover amazing fashion from boutiques near you',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: AfmColors.neutral500, height: 1.5),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AfmColors.navy800, Color(0xFF6D1B5C), AfmColors.magenta600],
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: ElevatedButton(
                  onPressed: () => context.go('/'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text(
                    'Start Shopping',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCartContent({
    required List<CartItemModel> cartItems,
    required int cartTotal,
    required int deliveryCharge,
    required int discountAmount,
    required int finalTotal,
  }) {
    return ListView(
      padding: const EdgeInsets.only(bottom: 120),
      children: [
        // Delivery banner
        if (deliveryCharge > 0)
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF8E1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFFFCC02)),
            ),
            child: Row(
              children: [
                const Icon(Icons.local_shipping_outlined, size: 18, color: Color(0xFF856404)),
                const SizedBox(width: 8),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(fontSize: 12, color: Color(0xFF856404)),
                      children: [
                        const TextSpan(text: 'Add '),
                        TextSpan(
                          text: '₹${999 - cartTotal}',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        const TextSpan(text: ' more for FREE delivery!'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

        // Cart items
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${cartItems.length} ${cartItems.length == 1 ? 'item' : 'items'} in your bag',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AfmColors.neutral500),
              ),
              const SizedBox(height: 12),
              ...cartItems.map((item) => CartItemTile(
                item: item,
                onQuantityChanged: (newQty) => ref.read(cartProvider.notifier).updateQuantity(
                  item.productId, item.size, item.color, newQty,
                ),
                onRemove: () => ref.read(cartProvider.notifier).removeItem(
                  item.productId, item.size, item.color,
                ),
              )),
            ],
          ),
        ),

        // Coupon section
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: _buildCouponSection(),
        ),

        // Savings summary
        if (_appliedCoupon != null && discountAmount > 0)
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF16A34A)),
            ),
            child: Row(
              children: [
                const Icon(Icons.savings_outlined, size: 18, color: Color(0xFF16A34A)),
                const SizedBox(width: 8),
                Text(
                  'You are saving ₹$discountAmount on this order!',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF16A34A)),
                ),
              ],
            ),
          ),

        // Price breakdown
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: _buildPriceBreakdown(
            subtotal: cartTotal,
            deliveryCharge: deliveryCharge,
            discountAmount: discountAmount,
            finalTotal: finalTotal,
          ),
        ),

        // You may also like
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
          child: Text(
            'You may also like',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AfmColors.navy800),
          ),
        ),
        SizedBox(
          height: 240,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: 4,
            itemBuilder: (context, index) => _buildRecommendedCard(context, index),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildCouponSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AfmColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.discount_outlined, size: 18, color: AfmColors.magenta600),
              SizedBox(width: 8),
              Text(
                'Apply Coupon',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AfmColors.navy800),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _couponController,
                  textCapitalization: TextCapitalization.characters,
                  decoration: InputDecoration(
                    hintText: 'Enter coupon code',
                    hintStyle: const TextStyle(color: AfmColors.neutral500, fontSize: 13),
                    filled: true,
                    fillColor: AfmColors.neutral50,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AfmColors.neutral200),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AfmColors.neutral200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AfmColors.magenta600, width: 1.5),
                    ),
                    suffixIcon: _appliedCoupon != null
                        ? GestureDetector(
                            onTap: () => setState(() {
                              _appliedCoupon = null;
                              _discountRate = 0;
                              _couponController.clear();
                            }),
                            child: const Icon(Icons.close, size: 18, color: AfmColors.neutral500),
                          )
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                height: 46,
                child: ElevatedButton(
                  onPressed: _applyingCoupon ? null : _applyCoupon,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AfmColors.magenta600,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                  ),
                  child: _applyingCoupon
                      ? const SizedBox(
                          width: 18, height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Apply', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
          if (_appliedCoupon != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, size: 16, color: Color(0xFF16A34A)),
                  const SizedBox(width: 6),
                  Text(
                    '$_appliedCoupon applied (${(_discountRate * 100).toInt()}% off)',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF16A34A), fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPriceBreakdown({
    required int subtotal,
    required int deliveryCharge,
    required int discountAmount,
    required int finalTotal,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AfmColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Price Details',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AfmColors.navy800),
          ),
          const SizedBox(height: 12),
          _PriceRow(label: 'Subtotal', value: '₹$subtotal'),
          const SizedBox(height: 8),
          _PriceRow(
            label: 'Delivery',
            value: deliveryCharge == 0 ? 'FREE' : '₹$deliveryCharge',
            valueColor: deliveryCharge == 0 ? const Color(0xFF16A34A) : null,
          ),
          if (discountAmount > 0) ...[
            const SizedBox(height: 8),
            _PriceRow(
              label: 'Coupon Discount',
              value: '− ₹$discountAmount',
              valueColor: const Color(0xFF16A34A),
            ),
          ],
          const SizedBox(height: 12),
          const Divider(color: AfmColors.neutral200),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total Amount',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AfmColors.navy800),
              ),
              Text(
                '₹$finalTotal',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AfmColors.navy800),
              ),
            ],
          ),
          if (deliveryCharge == 0)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'Free delivery on this order',
                  style: TextStyle(fontSize: 12, color: Color(0xFF16A34A), fontWeight: FontWeight.w500),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildRecommendedCard(BuildContext context, int index) {
    final products = [
      {'name': 'Printed Cotton Kurta', 'price': '₹1,299', 'shop': 'Ethnic Closet'},
      {'name': 'Block Print Dupatta', 'price': '₹699', 'shop': 'Zara Boutique'},
      {'name': 'Silk Saree Blouse', 'price': '₹899', 'shop': 'Bridal Bazaar'},
      {'name': 'Embroidered Palazzos', 'price': '₹1,599', 'shop': 'Fashion Hub'},
    ];
    final imageUrls = [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300',
      'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=300',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
      'https://images.unsplash.com/photo-1631216516726-e98a4bbf64f2?w=300',
    ];
    final p = products[index];

    return GestureDetector(
      onTap: () => context.push('/product/${index + 1}'),
      child: Container(
        width: 150,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: CachedNetworkImage(
                imageUrl: imageUrls[index],
                width: 150, height: 150, fit: BoxFit.cover,
                placeholder: (_, __) => Container(color: AfmColors.neutral100, child: const Center(child: Icon(Icons.image_outlined, color: AfmColors.neutral500))),
                errorWidget: (_, __, ___) => Container(color: AfmColors.neutral100, child: const Center(child: Icon(Icons.image_not_supported_outlined, color: AfmColors.neutral500))),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['name']!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AfmColors.navy800), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text(p['price']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AfmColors.magenta600)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckoutBar(int finalTotal, bool isAuthenticated) {
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total: ₹$finalTotal', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
                Text(
                  _appliedCoupon != null ? 'Coupon applied' : 'Incl. all taxes',
                  style: const TextStyle(fontSize: 11, color: AfmColors.neutral500),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AfmColors.navy800, Color(0xFF6D1B5C), AfmColors.magenta600],
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: AfmColors.magenta600.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: ElevatedButton(
                  onPressed: () => _handleCheckout(isAuthenticated),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text(
                    'Proceed to Checkout',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.3),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  const _PriceRow({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AfmColors.neutral500)),
        Text(
          value,
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: valueColor ?? AfmColors.neutral700),
        ),
      ],
    );
  }
}
