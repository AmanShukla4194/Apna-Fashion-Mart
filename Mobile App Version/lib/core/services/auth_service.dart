// ignore_for_file: avoid_dynamic_calls
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import '../constants/env.dart';
import 'api_service.dart';

/// Lightweight user representation returned by AuthService sign-in/sign-up.
class AuthUser {
  final String id;
  final String email;
  final String name;
  final String role;

  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
  });

  factory AuthUser.fromCognitoTokens(Map<String, dynamic> idTokenClaims) {
    return AuthUser(
      id: idTokenClaims['sub'] as String? ?? '',
      email: idTokenClaims['email'] as String? ?? '',
      name: idTokenClaims['name'] as String? ??
          idTokenClaims['given_name'] as String? ??
          idTokenClaims['cognito:username'] as String? ??
          '',
      role: idTokenClaims['custom:role'] as String? ?? 'customer',
    );
  }
}

class AuthService {
  static const _idTokenKey = 'auth_id_token';
  static const _accessTokenKey = 'auth_access_token';
  static const _refreshTokenKey = 'auth_refresh_token';

  final _storage = const FlutterSecureStorage();

  final _cognitoDio = Dio(
    BaseOptions(
      baseUrl:
          'https://cognito-idp.${Env.cognitoRegion}.amazonaws.com/',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
      },
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
    ),
  );

  // ---------------------------------------------------------------------------
  // Current state helpers
  // ---------------------------------------------------------------------------
  Future<AuthUser?> getCurrentUser() async {
    final idToken = await _storage.read(key: _idTokenKey);
    if (idToken == null || idToken.isEmpty) return null;
    try {
      if (JwtDecoder.isExpired(idToken)) {
        // Attempt a silent refresh before giving up
        final refreshed = await refreshSession();
        if (!refreshed) return null;
        final freshToken = await _storage.read(key: _idTokenKey);
        if (freshToken == null) return null;
        final claims = JwtDecoder.decode(freshToken);
        return AuthUser.fromCognitoTokens(claims);
      }
      final claims = JwtDecoder.decode(idToken);
      return AuthUser.fromCognitoTokens(claims);
    } catch (_) {
      return null;
    }
  }

  Future<bool> isLoggedIn() async {
    final user = await getCurrentUser();
    return user != null;
  }

  // Kept for backwards-compat with AuthNotifier stream listener pattern.
  // Returns a single-event stream that emits the current auth user (or null)
  // and then closes. Real-time session changes are handled via refreshSession().
  Stream<dynamic> get authStateChanges async* {
    yield await getCurrentUser();
  }

  // ---------------------------------------------------------------------------
  // Sign in
  // ---------------------------------------------------------------------------
  Future<AuthUser> signIn(String email, String password) async {
    final response = await _cognitoDio.post(
      '',
      options: Options(headers: {
        'X-Amz-Target':
            'AmazonCognitoIdentityProviderService.InitiateAuth',
      }),
      data: {
        'AuthFlow': 'USER_PASSWORD_AUTH',
        'ClientId': Env.cognitoClientId,
        'AuthParameters': {
          'USERNAME': email.trim(),
          'PASSWORD': password,
        },
      },
    );

    final authResult = response.data['AuthenticationResult'] as Map<String, dynamic>;
    await _storeTokens(authResult);

    final idToken = authResult['IdToken'] as String;
    await ApiService.instance.setAuthToken(idToken);

    final claims = JwtDecoder.decode(idToken);
    return AuthUser.fromCognitoTokens(claims);
  }

  /// Alias kept so that existing callers using signInWithEmail still compile.
  Future<LegacyAuthResponse> signInWithEmail(
      String email, String password) async {
    final user = await signIn(email, password);
    return LegacyAuthResponse(user: user);
  }

  // ---------------------------------------------------------------------------
  // Sign up — does NOT sign in automatically (email verification required)
  // ---------------------------------------------------------------------------
  Future<void> signUp({
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String role = 'customer',
    String? city,
    List<String>? stylePreferences,
  }) async {
    final attributes = <Map<String, String>>[
      {'Name': 'email', 'Value': email.trim()},
      {'Name': 'name', 'Value': fullName.trim()},
      {'Name': 'custom:role', 'Value': role},
    ];
    if (phone != null && phone.trim().isNotEmpty) {
      attributes.add({'Name': 'phone_number', 'Value': _normalisePhone(phone)});
    }

    await _cognitoDio.post(
      '',
      options: Options(headers: {
        'X-Amz-Target': 'AmazonCognitoIdentityProviderService.SignUp',
      }),
      data: {
        'ClientId': Env.cognitoClientId,
        'Username': email.trim(),
        'Password': password,
        'UserAttributes': attributes,
      },
    );
    // Do NOT auto-sign-in: Cognito requires email confirmation first.
    // After confirmSignUp(), the caller should call signIn().
  }

  // ---------------------------------------------------------------------------
  // Confirm email with 6-digit code (sent by Cognito after SignUp)
  // ---------------------------------------------------------------------------
  Future<void> confirmSignUp({
    required String email,
    required String code,
  }) async {
    await _cognitoDio.post(
      '',
      options: Options(headers: {
        'X-Amz-Target':
            'AmazonCognitoIdentityProviderService.ConfirmSignUp',
      }),
      data: {
        'ClientId': Env.cognitoClientId,
        'Username': email.trim(),
        'ConfirmationCode': code.trim(),
      },
    );
  }

  // Resend confirmation code if user didn't receive it
  Future<void> resendConfirmationCode({required String email}) async {
    await _cognitoDio.post(
      '',
      options: Options(headers: {
        'X-Amz-Target':
            'AmazonCognitoIdentityProviderService.ResendConfirmationCode',
      }),
      data: {
        'ClientId': Env.cognitoClientId,
        'Username': email.trim(),
      },
    );
  }

  // ---------------------------------------------------------------------------
  // OTP / phone flows (stub — wire to Cognito SMS MFA if needed)
  // ---------------------------------------------------------------------------
  Future<void> signInWithPhone(String phone) async {
    // Placeholder: initiate custom auth or SMS OTP via Cognito
    throw UnimplementedError(
        'Phone sign-in requires Cognito custom auth flow setup.');
  }

  Future<LegacyAuthResponse> verifyOtp(String phone, String otp) async {
    throw UnimplementedError(
        'OTP verification requires Cognito custom auth flow setup.');
  }

  // ---------------------------------------------------------------------------
  // Password reset
  // ---------------------------------------------------------------------------
  Future<void> resetPassword(String email) async {
    await _cognitoDio.post(
      '',
      options: Options(headers: {
        'X-Amz-Target':
            'AmazonCognitoIdentityProviderService.ForgotPassword',
      }),
      data: {
        'ClientId': Env.cognitoClientId,
        'Username': email.trim(),
      },
    );
  }

  Future<void> confirmResetPassword({
    required String email,
    required String confirmationCode,
    required String newPassword,
  }) async {
    await _cognitoDio.post(
      '',
      options: Options(headers: {
        'X-Amz-Target':
            'AmazonCognitoIdentityProviderService.ConfirmForgotPassword',
      }),
      data: {
        'ClientId': Env.cognitoClientId,
        'Username': email.trim(),
        'ConfirmationCode': confirmationCode.trim(),
        'Password': newPassword,
      },
    );
  }

  Future<void> updatePassword(String newPassword) async {
    final accessToken = await _storage.read(key: _accessTokenKey);
    if (accessToken == null) throw Exception('Not authenticated');
    await _cognitoDio.post(
      '',
      options: Options(headers: {
        'X-Amz-Target':
            'AmazonCognitoIdentityProviderService.ChangePassword',
      }),
      data: {
        'AccessToken': accessToken,
        'PreviousPassword': '',
        'ProposedPassword': newPassword,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Profile update (delegates to ApiService)
  // ---------------------------------------------------------------------------
  Future<void> updateProfile(Map<String, dynamic> data) async {
    final user = await getCurrentUser();
    if (user == null) return;
    await ApiService.instance.updateUserProfile(user.id, data);
  }

  // ---------------------------------------------------------------------------
  // Sign out
  // ---------------------------------------------------------------------------
  Future<void> signOut() async {
    try {
      final accessToken = await _storage.read(key: _accessTokenKey);
      if (accessToken != null && accessToken.isNotEmpty) {
        await _cognitoDio.post(
          '',
          options: Options(headers: {
            'X-Amz-Target':
                'AmazonCognitoIdentityProviderService.GlobalSignOut',
          }),
          data: {'AccessToken': accessToken},
        );
      }
    } catch (_) {
      // Best-effort — always clear local tokens
    } finally {
      await _clearTokens();
      await ApiService.instance.clearAuthToken();
    }
  }

  // ---------------------------------------------------------------------------
  // Token refresh
  // ---------------------------------------------------------------------------
  Future<bool> refreshSession() async {
    try {
      final refreshToken = await _storage.read(key: _refreshTokenKey);
      if (refreshToken == null || refreshToken.isEmpty) return false;

      final response = await _cognitoDio.post(
        '',
        options: Options(headers: {
          'X-Amz-Target':
              'AmazonCognitoIdentityProviderService.InitiateAuth',
        }),
        data: {
          'AuthFlow': 'REFRESH_TOKEN_AUTH',
          'ClientId': Env.cognitoClientId,
          'AuthParameters': {'REFRESH_TOKEN': refreshToken},
        },
      );

      final authResult =
          response.data['AuthenticationResult'] as Map<String, dynamic>;
      await _storeTokens(authResult);
      final idToken = authResult['IdToken'] as String;
      await ApiService.instance.setAuthToken(idToken);
      return true;
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  Future<void> _storeTokens(Map<String, dynamic> authResult) async {
    final idToken = authResult['IdToken'] as String?;
    final accessToken = authResult['AccessToken'] as String?;
    final refreshToken = authResult['RefreshToken'] as String?;

    if (idToken != null) {
      await _storage.write(key: _idTokenKey, value: idToken);
    }
    if (accessToken != null) {
      await _storage.write(key: _accessTokenKey, value: accessToken);
    }
    if (refreshToken != null) {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    }
  }

  Future<void> _clearTokens() async {
    await _storage.delete(key: _idTokenKey);
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  String _normalisePhone(String phone) {
    final trimmed = phone.trim().replaceAll(RegExp(r'\s+'), '');
    if (!trimmed.startsWith('+')) {
      return '+91$trimmed';
    }
    return trimmed;
  }
}

// ---------------------------------------------------------------------------
// Backwards-compatibility shim
// Replaces the supabase_flutter AuthResponse type that callers expected.
// ---------------------------------------------------------------------------
class LegacyAuthResponse {
  final AuthUser? user;
  const LegacyAuthResponse({this.user});
}
