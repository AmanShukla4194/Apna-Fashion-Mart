import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:apna_fashion_mart/core/providers/auth_provider.dart';

class VerifyEmailScreen extends ConsumerStatefulWidget {
  final String email;
  final String password;
  const VerifyEmailScreen({super.key, required this.email, required this.password});

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  bool _isVerifying = false;
  bool _isResending = false;
  int _resendCountdown = 60;
  Timer? _timer;

  static const Color _navy800   = Color(0xFF001F3F);
  static const Color _magenta600 = Color(0xFFFF1493);
  static const Color _neutral50  = Color(0xFFF8F9FB);

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) { c.dispose(); }
    for (final f in _focusNodes) { f.dispose(); }
    super.dispose();
  }

  void _startCountdown() {
    _resendCountdown = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendCountdown <= 0) { t.cancel(); return; }
      setState(() => _resendCountdown--);
    });
  }

  String get _code => _controllers.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_code.length != 6) {
      _showSnack('Please enter the complete 6-digit code', Colors.orange);
      return;
    }
    setState(() => _isVerifying = true);
    try {
      final success = await ref.read(authProvider.notifier).confirmSignUp(
        email: widget.email,
        password: widget.password,
        code: _code,
      );
      if (!mounted) return;
      if (success) {
        context.go('/');
      } else {
        final err = ref.read(authProvider).error ?? 'Verification failed.';
        _showSnack(err, Colors.red[700]!);
      }
    } catch (e) {
      _showSnack('Verification failed. Please try again.', Colors.red[700]!);
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  Future<void> _resend() async {
    if (_resendCountdown > 0 || _isResending) return;
    setState(() => _isResending = true);
    try {
      await ref.read(authProvider.notifier).resendConfirmationCode(
        email: widget.email,
      );
      _showSnack('A new code has been sent to your email.', Colors.green[700]!);
      _startCountdown();
    } catch (e) {
      _showSnack('Failed to resend code. Please try again.', Colors.red[700]!);
    } finally {
      if (mounted) setState(() => _isResending = false);
    }
  }

  void _showSnack(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  Widget _buildOtpBox(int index) {
    return SizedBox(
      width: 46,
      child: TextFormField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(1)],
        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: _navy800),
        decoration: InputDecoration(
          filled: true, fillColor: Colors.white,
          counterText: '',
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E8ED), width: 1.5)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _magenta600, width: 2)),
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
        onChanged: (val) {
          if (val.isNotEmpty && index < 5) {
            _focusNodes[index + 1].requestFocus();
          } else if (val.isEmpty && index > 0) {
            _focusNodes[index - 1].requestFocus();
          }
          if (_code.length == 6) _verify();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _neutral50,
      appBar: AppBar(
        backgroundColor: Colors.transparent, elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: _navy800, size: 20),
          onPressed: () => context.canPop() ? context.pop() : context.go('/register'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 16),

              // Icon
              Container(
                width: 80, height: 80,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [_navy800, _magenta600], begin: Alignment.topLeft, end: Alignment.bottomRight),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.mark_email_unread_outlined, color: Colors.white, size: 36),
              ),
              const SizedBox(height: 20),

              const Text('Verify your email', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: _navy800)),
              const SizedBox(height: 8),
              Text(
                'We sent a 6-digit code to\n${widget.email}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280), height: 1.5),
              ),
              const SizedBox(height: 36),

              // OTP boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, _buildOtpBox),
              ),
              const SizedBox(height: 28),

              // Verify button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isVerifying ? null : _verify,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _magenta600,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: _isVerifying
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                      : const Text('Verify Email', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(height: 20),

              // Resend
              TextButton(
                onPressed: (_resendCountdown > 0 || _isResending) ? null : _resend,
                child: Text(
                  _isResending
                      ? 'Sending…'
                      : _resendCountdown > 0
                          ? 'Resend code in ${_resendCountdown}s'
                          : 'Resend code',
                  style: TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w600,
                    color: (_resendCountdown > 0 || _isResending) ? const Color(0xFF9CA3AF) : _magenta600,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Check your spam folder if you don\'t see it.\nThe code expires in 10 minutes.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF), height: 1.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
