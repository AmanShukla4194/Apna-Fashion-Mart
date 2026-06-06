import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/auth_service.dart';
import '../services/api_service.dart';

// ---------------------------------------------------------------------------
// Auth status enum
// ---------------------------------------------------------------------------
enum AuthStatus { unknown, authenticated, unauthenticated }

// ---------------------------------------------------------------------------
// Auth state value object
// ---------------------------------------------------------------------------
class AuthState {
  final AuthStatus status;
  final AuthUser? user;
  final Map<String, dynamic>? profile;
  final String? error;

  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.profile,
    this.error,
  });

  AuthState copyWith({
    AuthStatus? status,
    AuthUser? user,
    Map<String, dynamic>? profile,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      profile: profile ?? this.profile,
      error: error,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

// ---------------------------------------------------------------------------
// Auth notifier
// ---------------------------------------------------------------------------
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final ApiService _apiService;

  AuthNotifier(this._authService, this._apiService)
      : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    try {
      final currentUser = await _authService.getCurrentUser();
      if (currentUser != null) {
        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: currentUser,
        );
        await _loadProfile(currentUser.id);
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    } catch (_) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> _loadProfile(String userId) async {
    try {
      final profile = await _apiService.getUserProfile(userId);
      if (mounted) state = state.copyWith(profile: profile);
    } catch (_) {
      // Profile load failure is non-fatal
    }
  }

  Future<bool> signIn({required String email, required String password}) async {
    try {
      state = state.copyWith(error: null);
      final user = await _authService.signIn(email, password);
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
      );
      await _loadProfile(user.id);
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: _friendlyError(e),
      );
      return false;
    }
  }

  // Returns true on success — caller should navigate to email verification screen
  Future<bool> signUp({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String? city,
    List<String>? stylePreferences,
  }) async {
    try {
      state = state.copyWith(error: null);
      await _authService.signUp(
        email: email,
        password: password,
        fullName: fullName,
        phone: phone,
        city: city,
        stylePreferences: stylePreferences,
      );
      // Stay unauthenticated — user must verify email first
      return true;
    } catch (e) {
      state = state.copyWith(error: _friendlyError(e));
      return false;
    }
  }

  // Confirm email with 6-digit code, then auto sign-in
  Future<bool> confirmSignUp({
    required String email,
    required String password,
    required String code,
  }) async {
    try {
      state = state.copyWith(error: null);
      await _authService.confirmSignUp(email: email, code: code);
      // Auto sign-in after successful verification
      return await signIn(email: email, password: password);
    } catch (e) {
      state = state.copyWith(error: _friendlyError(e));
      return false;
    }
  }

  Future<void> resendConfirmationCode({required String email}) async {
    await _authService.resendConfirmationCode(email: email);
  }

  Future<void> signOut() async {
    await _authService.signOut();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// OTP verification stub — wire to Cognito custom auth flow when ready.
  Future<bool> verifyOtp({required String phone, required String token}) async {
    try {
      state = state.copyWith(error: null);
      await _authService.verifyOtp(phone, token);
      return false;
    } catch (e) {
      state = state.copyWith(error: _friendlyError(e));
      return false;
    }
  }

  Future<void> resendOtp({required String phone}) async {
    await _authService.signInWithPhone(phone);
  }

  Future<void> sendPasswordResetEmail({required String email}) async {
    await _authService.resetPassword(email);
  }

  Future<void> refreshProfile() async {
    final userId = state.user?.id;
    if (userId != null) await _loadProfile(userId);
  }

  String _friendlyError(Object e) {
    final msg = e.toString().toLowerCase();
    if (msg.contains('notauthorized') || msg.contains('incorrect username or password')) {
      return 'Incorrect email or password.';
    }
    if (msg.contains('usernameexists') || msg.contains('already exists')) {
      return 'An account with this email already exists.';
    }
    if (msg.contains('network') || msg.contains('socketexception')) {
      return 'Network error. Please check your connection.';
    }
    if (msg.contains('otp') || msg.contains('codemismatch')) {
      return 'Invalid or expired OTP. Please try again.';
    }
    if (msg.contains('unimplemented')) {
      return 'This sign-in method is not yet available.';
    }
    return 'Something went wrong. Please try again.';
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
final _authServiceProvider = Provider<AuthService>((_) => AuthService());
final _apiServiceProvider = Provider<ApiService>((_) => ApiService.instance);

final authProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(_authServiceProvider),
    ref.read(_apiServiceProvider),
  );
});

final currentUserProvider = Provider<AuthUser?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).status == AuthStatus.authenticated;
});

final currentProfileProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(authProvider).profile;
});
