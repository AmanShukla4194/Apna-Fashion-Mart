import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../constants/app_constants.dart';
import '../constants/env.dart';

typedef PaymentSuccessCallback = void Function(PaymentSuccessResponse response);
typedef PaymentErrorCallback = void Function(PaymentFailureResponse response);
typedef ExternalWalletCallback = void Function(
    ExternalWalletResponse response);

class RazorpayService {
  Razorpay? _razorpay;

  void initRazorpay({
    required PaymentSuccessCallback onSuccess,
    required PaymentErrorCallback onError,
    required ExternalWalletCallback onExternalWallet,
  }) {
    _razorpay = Razorpay();
    _razorpay!.on(Razorpay.EVENT_PAYMENT_SUCCESS, onSuccess);
    _razorpay!.on(Razorpay.EVENT_PAYMENT_ERROR, onError);
    _razorpay!.on(Razorpay.EVENT_EXTERNAL_WALLET, onExternalWallet);
  }

  /// Opens the Razorpay checkout sheet.
  ///
  /// [amount] must be in **paise** (smallest currency unit).
  /// e.g. ₹299 → 29900
  void openPayment({
    required int amount,
    required String orderId,
    required String name,
    required String email,
    required String phone,
    String? description,
    String? imageUrl,
  }) {
    assert(_razorpay != null,
        'Call initRazorpay() before openPayment()');

    final options = <String, dynamic>{
      'key': Env.razorpayKeyId,
      'amount': amount,
      'order_id': orderId,
      'name': AppConstants.razorpayCompanyName,
      'description':
          description ?? 'Payment for ${AppConstants.appName}',
      'currency': AppConstants.razorpayCurrency,
      'prefill': {
        'name': name,
        'email': email,
        'contact': phone,
      },
      'theme': {
        'color': '#FF1493', // magenta600
      },
      'modal': {
        'confirm_close': true,
        'animation': true,
      },
      if (imageUrl != null) 'image': imageUrl,
    };

    _razorpay!.open(options);
  }

  void dispose() {
    _razorpay?.clear();
    _razorpay = null;
  }
}
