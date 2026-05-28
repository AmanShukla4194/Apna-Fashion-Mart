import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';
import '../services/api_service.dart';
import 'auth_provider.dart';

// ---------------------------------------------------------------------------
// Wishlist notifier – stores product IDs locally, syncs to API when auth
// ---------------------------------------------------------------------------
class WishlistNotifier extends StateNotifier<List<String>> {
  final Ref _ref;
  final ApiService _apiService;

  WishlistNotifier(this._ref, this._apiService) : super([]) {
    _load();
  }

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(AppConstants.wishlistKey);
      if (raw != null && raw.isNotEmpty) {
        final list = (jsonDecode(raw) as List<dynamic>).cast<String>();
        state = list;
      }

      // If authenticated, merge with server wishlist
      final user = _ref.read(currentUserProvider);
      if (user != null) {
        final serverIds = await _apiService.getWishlist(user.id);
        final merged = <String>{...state, ...serverIds}.toList();
        state = merged;
        await _persist();
      }
    } catch (_) {
      // Local load failure is non-fatal
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.wishlistKey, jsonEncode(state));
  }

  Future<void> addProduct(String productId) async {
    if (state.contains(productId)) return;
    state = [...state, productId];
    await _persist();

    final user = _ref.read(currentUserProvider);
    if (user != null) {
      await _apiService.addToWishlist(user.id, productId);
    }
  }

  Future<void> removeProduct(String productId) async {
    state = state.where((id) => id != productId).toList();
    await _persist();

    final user = _ref.read(currentUserProvider);
    if (user != null) {
      await _apiService.removeFromWishlist(user.id, productId);
    }
  }

  Future<void> toggleProduct(String productId) async {
    if (state.contains(productId)) {
      await removeProduct(productId);
    } else {
      await addProduct(productId);
    }
  }

  bool isWishlisted(String productId) => state.contains(productId);

  Future<void> clearWishlist() async {
    state = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.wishlistKey);
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
final _apiServiceProvider =
    Provider<ApiService>((_) => ApiService.instance);

final wishlistProvider =
    StateNotifierProvider<WishlistNotifier, List<String>>((ref) {
  return WishlistNotifier(ref, ref.read(_apiServiceProvider));
});

final isWishlistedProvider = Provider.family<bool, String>((ref, productId) {
  return ref.watch(wishlistProvider).contains(productId);
});

final wishlistCountProvider = Provider<int>((ref) {
  return ref.watch(wishlistProvider).length;
});
