import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';

class OrderSuccessScreen extends StatefulWidget {
  final String orderId;

  const OrderSuccessScreen({super.key, required this.orderId});

  @override
  State<OrderSuccessScreen> createState() => _OrderSuccessScreenState();
}

class _OrderSuccessScreenState extends State<OrderSuccessScreen>
    with TickerProviderStateMixin {
  late AnimationController _scaleController;
  late AnimationController _fadeController;
  late AnimationController _confettiController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  bool _hasAnimated = false;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _confettiController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    _scaleAnimation = CurvedAnimation(
      parent: _scaleController,
      curve: Curves.elasticOut,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeIn,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _runAnimations();
    });
  }

  Future<void> _runAnimations() async {
    if (_hasAnimated) return;
    _hasAnimated = true;
    HapticFeedback.mediumImpact();
    await _scaleController.forward();
    await _fadeController.forward();
    _confettiController.forward();
  }

  @override
  void dispose() {
    _scaleController.dispose();
    _fadeController.dispose();
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final estimatedDate = DateTime.now().add(const Duration(days: 3));
    final dateStr = _formatDate(estimatedDate);

    return Scaffold(
      backgroundColor: AfmColors.neutral50,
      body: SafeArea(
        child: Stack(
          children: [
            // Confetti particles
            AnimatedBuilder(
              animation: _confettiController,
              builder: (context, _) {
                return CustomPaint(
                  painter: _ConfettiPainter(_confettiController.value),
                  size: Size(
                    MediaQuery.of(context).size.width,
                    MediaQuery.of(context).size.height,
                  ),
                );
              },
            ),

            // Main content
            Column(
              children: [
                // Share button at top right
                Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: IconButton(
                      onPressed: _shareOrder,
                      icon: const Icon(Icons.share_outlined, color: AfmColors.navy800),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.all(10),
                      ),
                    ),
                  ),
                ),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      children: [
                        const SizedBox(height: 16),

                        // Success animation
                        ScaleTransition(
                          scale: _scaleAnimation,
                          child: Container(
                            width: 130,
                            height: 130,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF16A34A), Color(0xFF22C55E)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF16A34A).withValues(alpha: 0.35),
                                  blurRadius: 24,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.check_rounded,
                              size: 72,
                              color: Colors.white,
                            ),
                          ),
                        ),

                        const SizedBox(height: 28),

                        // Heading
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: const Column(
                            children: [
                              Text(
                                'Order Placed!',
                                style: TextStyle(
                                  fontSize: 30,
                                  fontWeight: FontWeight.w800,
                                  color: AfmColors.navy800,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              SizedBox(height: 8),
                              Text(
                                'Thank you for shopping with us.',
                                style: TextStyle(
                                  fontSize: 15,
                                  color: AfmColors.neutral500,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 28),

                        // Order details card
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 16,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                _DetailRow(
                                  icon: Icons.confirmation_number_outlined,
                                  label: 'Order ID',
                                  value: '#${widget.orderId.substring(0, min(8, widget.orderId.length)).toUpperCase()}',
                                  onCopy: () {
                                    Clipboard.setData(ClipboardData(text: widget.orderId));
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: const Text('Order ID copied!'),
                                        backgroundColor: AfmColors.navy800,
                                        behavior: SnackBarBehavior.floating,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        duration: const Duration(seconds: 2),
                                      ),
                                    );
                                  },
                                ),
                                const SizedBox(height: 12),
                                const Divider(color: AfmColors.neutral200),
                                const SizedBox(height: 12),
                                _DetailRow(
                                  icon: Icons.local_shipping_outlined,
                                  label: 'Estimated Delivery',
                                  value: dateStr,
                                ),
                                const SizedBox(height: 12),
                                const Divider(color: AfmColors.neutral200),
                                const SizedBox(height: 12),
                                const _DetailRow(
                                  icon: Icons.notifications_outlined,
                                  label: 'Updates',
                                  value: 'You will receive SMS & email updates',
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Illustration
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFFF8E1), Color(0xFFFFF3E0)],
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Row(
                              children: [
                                Icon(
                                  Icons.verified_user_outlined,
                                  color: AfmColors.gold500,
                                  size: 28,
                                ),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'Your order is confirmed and will be packed by the boutique.',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AfmColors.neutral700,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),

                // Bottom buttons
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: _buildBottomButtons(context),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomButtons(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
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
              child: ElevatedButton.icon(
                onPressed: () => context.go('/account/orders/${widget.orderId}'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.track_changes_rounded, color: Colors.white, size: 20),
                label: const Text(
                  'Track Your Order',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: () => context.go('/'),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AfmColors.navy800),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.storefront_outlined, color: AfmColors.navy800, size: 20),
              label: const Text(
                'Continue Shopping',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AfmColors.navy800,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _shareOrder() {
    Share.share(
      'I just placed an order on Apna Fashion Mart! 🛍️\n'
      'Order ID: #${widget.orderId.substring(0, min(8, widget.orderId.length)).toUpperCase()}\n'
      'Download the app: https://apnafashionmart.in',
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${days[date.weekday - 1]}, ${date.day} ${months[date.month - 1]}';
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onCopy;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.onCopy,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AfmColors.neutral100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: AfmColors.neutral700),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: AfmColors.neutral500,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AfmColors.navy800,
                ),
              ),
            ],
          ),
        ),
        if (onCopy != null)
          IconButton(
            onPressed: onCopy,
            icon: const Icon(Icons.copy_rounded, size: 18, color: AfmColors.neutral500),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Simple confetti painter
// ---------------------------------------------------------------------------

class _ConfettiPainter extends CustomPainter {
  final double progress;
  final List<_ConfettiParticle> _particles;

  _ConfettiPainter(this.progress)
      : _particles = List.generate(
          60,
          (i) => _ConfettiParticle(seed: i),
        );

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    for (final p in _particles) {
      final x = p.x * size.width;
      final y = p.startY + (size.height * 1.4) * progress * p.speed;
      final alpha = (1 - progress) * 255;
      if (y < 0 || y > size.height) continue;
      final paint = Paint()
        ..color = p.color.withValues(alpha: alpha / 255)
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(progress * p.rotation * 2 * pi);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(center: Offset.zero, width: p.size, height: p.size * 0.4),
          const Radius.circular(1),
        ),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ConfettiPainter old) => old.progress != progress;
}

class _ConfettiParticle {
  late double x;
  late double startY;
  late double speed;
  late double size;
  late double rotation;
  late Color color;

  static const _colors = [
    AfmColors.magenta600,
    AfmColors.gold500,
    AfmColors.navy800,
    Color(0xFF16A34A),
    Colors.orange,
    Colors.purple,
  ];

  _ConfettiParticle({required int seed}) {
    final rng = Random(seed * 7919);
    x = rng.nextDouble();
    startY = -rng.nextDouble() * 200;
    speed = 0.3 + rng.nextDouble() * 0.7;
    size = 6 + rng.nextDouble() * 8;
    rotation = rng.nextDouble() * 10 - 5;
    color = _colors[rng.nextInt(_colors.length)];
  }
}
