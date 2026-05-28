import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:apna_fashion_mart/core/providers/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _emailSent = false;

  static const Color _navy800 = Color(0xFF001F3F);
  static const Color _magenta600 = Color(0xFFFF1493);
  static const Color _magenta100 = Color(0xFFFFEDF7);
  static const Color _neutral50 = Color(0xFFF8F9FB);
  static const Color _neutral500 = Color(0xFF6B7280);

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _sendResetEmail() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      await ref.read(authProvider.notifier).sendPasswordResetEmail(
            email: _emailController.text.trim(),
          );
      if (mounted) setState(() => _emailSent = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.red[700],
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _neutral50,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: _navy800, size: 20),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _emailSent ? _buildSuccessState() : _buildFormState(),
        ),
      ),
    );
  }

  Widget _buildFormState() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFFEDF7), Color(0xFFFDE8F5)],
              ),
              shape: BoxShape.circle,
              border: Border.all(
                  color: _magenta600.withValues(alpha: 0.3), width: 2),
            ),
            child: const Icon(
              Icons.lock_reset_rounded,
              color: _magenta600,
              size: 36,
            ),
          ),
          const SizedBox(height: 28),
          const Text(
            'Reset password',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: _navy800,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Enter your registered email address and we\'ll send you a password reset link.',
            style: TextStyle(
              fontSize: 14,
              color: _neutral500,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 36),
          const Text(
            'Email Address',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _navy800,
              letterSpacing: 0.2,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            autocorrect: false,
            onFieldSubmitted: (_) => _sendResetEmail(),
            decoration: InputDecoration(
              hintText: 'you@example.com',
              hintStyle:
                  const TextStyle(color: _neutral500, fontSize: 14),
              prefixIcon: const Icon(Icons.mail_outline_rounded,
                  color: _neutral500, size: 20),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                    color: _magenta600, width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                    color: Colors.red[400]!, width: 1.5),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                    color: Colors.red[400]!, width: 1.5),
              ),
            ),
            validator: (v) {
              if (v == null || v.trim().isEmpty) {
                return 'Email is required';
              }
              final emailRegex =
                  RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,}$');
              if (!emailRegex.hasMatch(v.trim())) {
                return 'Enter a valid email address';
              }
              return null;
            },
          ),
          const SizedBox(height: 28),
          SizedBox(
            height: 52,
            child: _isLoading
                ? Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [_navy800, _magenta600],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.5,
                        ),
                      ),
                    ),
                  )
                : DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [_navy800, Color(0xFF6D1B5C), _magenta600],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: _magenta600.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: _sendResetEmail,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: const Text(
                        'Send Reset Link',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
          ),
          const SizedBox(height: 24),
          Center(
            child: GestureDetector(
              onTap: () =>
                  context.canPop() ? context.pop() : context.go('/login'),
              child: const Text(
                'Back to Sign In',
                style: TextStyle(
                  color: _magenta600,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 40),
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: const Color(0xFFDCFCE7),
            shape: BoxShape.circle,
            border: Border.all(
                color: Colors.green.withValues(alpha: 0.3), width: 2),
          ),
          child: const Icon(
            Icons.mark_email_read_outlined,
            color: Colors.green,
            size: 44,
          ),
        ),
        const SizedBox(height: 32),
        const Text(
          'Check your inbox!',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: _navy800,
            letterSpacing: -0.5,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          'We\'ve sent a password reset link to\n${_emailController.text.trim()}',
          style: const TextStyle(
            fontSize: 14,
            color: _neutral500,
            height: 1.6,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        const Text(
          'The link will expire in 1 hour. If you don\'t see it, check your spam folder.',
          style: TextStyle(
            fontSize: 12,
            color: _neutral500,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _magenta100,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _magenta600.withValues(alpha: 0.15)),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline_rounded,
                  color: _magenta600, size: 18),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Didn\'t receive the email? Tap below to resend.',
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFF9D174D),
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        OutlinedButton(
          onPressed: () => setState(() {
            _emailSent = false;
            _emailController.clear();
          }),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: _magenta600, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            minimumSize: const Size(double.infinity, 52),
          ),
          child: const Text(
            'Resend Email',
            style: TextStyle(
              color: _magenta600,
              fontWeight: FontWeight.w700,
              fontSize: 15,
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => context.go('/login'),
          style: TextButton.styleFrom(
            minimumSize: const Size(double.infinity, 52),
          ),
          child: const Text(
            'Back to Sign In',
            style: TextStyle(
              color: _navy800,
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
        ),
      ],
    );
  }
}
