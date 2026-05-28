import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../models/cart_item_model.dart';
import '../constants/app_constants.dart';

// ---------------------------------------------------------------------------
// Cart notifier
// ---------------------------------------------------------------------------
class CartNotifier extends StateNotifier<List<CartItemModel>> {
  CartNotifier() : super([]) {
    _load();
  }

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(AppConstants.cartKey);
      if (raw != null && raw.isNotEmpty) {
        final list = jsonDecode(raw) as List<dynamic>;
        state = list
            .map((e) => CartItemModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {
      state = [];
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      AppConstants.cartKey,
      jsonEncode(state.map((e) => e.toJson()).toList()),
    );
  }

  // Adds item or increments quantity if same product+size+color already exists
  Future<void> addItem(CartItemModel item) async {
    final totalItems = state.fold<int>(0, (sum, e) => sum + e.quantity);
    if (totalItems >= AppConstants.maxCartItems) return;

    final idx = state.indexWhere(
      (e) =>
          e.productId == item.productId &&
          e.size == item.size &&
          e.color == item.color,
    );

    if (idx >= 0) {
      final existing = state[idx];
      final newQty =
          (existing.quantity + item.quantity).clamp(1, AppConstants.maxCartItemQuantity);
      state = [
        ...state.sublist(0, idx),
        existing.copyWith(quantity: newQty),
        ...state.sublist(idx + 1),
      ];
    } else {
      state = [...state, item];
    }

    await _persist();
  }

  Future<void> removeItem(String productId, String size, String color) async {
    state = state
        .where(
          (e) =>
              !(e.productId == productId &&
                  e.size == size &&
                  e.color == color),
        )
        .toList();
    await _persist();
  }

  Future<void> updateQuantity(
      String productId, String size, String color, int quantity) async {
    if (quantity <= 0) {
      await removeItem(productId, size, color);
      return;
    }

    final clampedQty = quantity.clamp(1, AppConstants.maxCartItemQuantity);
    state = state.map((e) {
      if (e.productId == productId && e.size == size && e.color == color) {
        return e.copyWith(quantity: clampedQty);
      }
      return e;
    }).toList();

    await _persist();
  }

  Future<void> clearCart() async {
    state = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.cartKey);
  }

  int get totalItems =>
      state.fold<int>(0, (sum, item) => sum + item.quantity);

  int get totalPrice =>
      state.fold<int>(0, (sum, item) => sum + item.price * item.quantity);

  bool containsProduct(String productId) =>
      state.any((e) => e.productId == productId);
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
final cartProvider =
    StateNotifierProvider<CartNotifier, List<CartItemModel>>((ref) {
  return CartNotifier();
});

final cartCountProvider = Provider<int>((ref) {
  return ref
      .watch(cartProvider)
      .fold<int>(0, (sum, item) => sum + item.quantity);
});

final cartTotalProvider = Provider<int>((ref) {
  return ref
      .watch(cartProvider)
      .fold<int>(0, (sum, item) => sum + item.price * item.quantity);
});

final cartDeliveryFeeProvider = Provider<int>((ref) {
  final total = ref.watch(cartTotalProvider);
  return total >= AppConstants.freeDeliveryThreshold
      ? 0
      : AppConstants.defaultDeliveryFee;
});

final cartGrandTotalProvider = Provider<int>((ref) {
  return ref.watch(cartTotalProvider) + ref.watch(cartDeliveryFeeProvider);
});
