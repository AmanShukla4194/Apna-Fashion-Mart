import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';

// ---------------------------------------------------------------------------
// Recently-viewed notifier – stores up to 12 product IDs (most recent first)
// ---------------------------------------------------------------------------
class RecentlyViewedNotifier extends StateNotifier<List<String>> {
  RecentlyViewedNotifier() : super([]) {
    _load();
  }

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(AppConstants.recentlyViewedKey);
      if (raw != null && raw.isNotEmpty) {
        final list = (jsonDecode(raw) as List<dynamic>).cast<String>();
        state = list;
      }
    } catch (_) {
      state = [];
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
        AppConstants.recentlyViewedKey, jsonEncode(state));
  }

  Future<void> trackView(String productId) async {
    // Remove duplicate if already present, then prepend
    final updated = [
      productId,
      ...state.where((id) => id != productId),
    ];
    // Trim to max
    state = updated.take(AppConstants.maxRecentlyViewed).toList();
    await _persist();
  }

  List<String> getRecentlyViewed() => List.unmodifiable(state);

  Future<void> clear() async {
    state = [];
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.recentlyViewedKey);
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
final recentlyViewedProvider =
    StateNotifierProvider<RecentlyViewedNotifier, List<String>>((ref) {
  return RecentlyViewedNotifier();
});
