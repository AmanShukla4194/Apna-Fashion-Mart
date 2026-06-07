import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/app_constants.dart';
import '../constants/env.dart';

/// Singleton REST API client that replaces SupabaseService.
/// All callers that previously used SupabaseService should use ApiService.instance.
class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  static const _tokenKey = 'auth_token';

  final _storage = const FlutterSecureStorage();
  late final Dio _dio = _buildDio();

  // ---------------------------------------------------------------------------
  // Dio setup
  // ---------------------------------------------------------------------------
  Dio _buildDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: Env.apiUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: _tokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          handler.next(error);
        },
      ),
    );

    return dio;
  }

  // ---------------------------------------------------------------------------
  // Token management
  // ---------------------------------------------------------------------------
  Future<void> setAuthToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<void> clearAuthToken() async {
    await _storage.delete(key: _tokenKey);
  }

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getProducts({
    String? category,
    String? search,
    String? sortBy,
    String? gender,
    String? storeId,
    int page = 0,
    int pageSize = AppConstants.defaultPageSize,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'pageSize': pageSize,
    };
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (sortBy != null && sortBy.isNotEmpty) params['sortBy'] = sortBy;
    if (gender != null && gender.isNotEmpty) params['gender'] = gender;
    if (storeId != null && storeId.isNotEmpty) params['storeId'] = storeId;

    final response = await _dio.get('/products', queryParameters: params);
    return _parseList(response.data);
  }

  Future<Map<String, dynamic>?> getProductById(String id) async {
    try {
      final response = await _dio.get('/products/$id');
      return _parseMap(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getFeaturedProducts({
    int page = 0,
    int pageSize = AppConstants.defaultPageSize,
  }) async {
    final response = await _dio.get('/products/featured', queryParameters: {
      'page': page,
      'pageSize': pageSize,
    });
    return _parseList(response.data);
  }

  Future<List<Map<String, dynamic>>> searchProducts(
    String query, {
    int page = 0,
    int pageSize = AppConstants.defaultPageSize,
  }) async {
    final response = await _dio.get('/products/search', queryParameters: {
      'q': query,
      'page': page,
      'pageSize': pageSize,
    });
    return _parseList(response.data);
  }

  // ---------------------------------------------------------------------------
  // Shops
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getShops({
    double? lat,
    double? lng,
    double radiusKm = AppConstants.nearbyRadiusKm,
    String? city,
    int page = 0,
    int pageSize = AppConstants.defaultPageSize,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'pageSize': pageSize,
    };
    if (lat != null) params['lat'] = lat;
    if (lng != null) params['lng'] = lng;
    if (lat != null && lng != null) params['radiusKm'] = radiusKm;
    if (city != null && city.isNotEmpty) params['city'] = city;

    final response = await _dio.get('/shops', queryParameters: params);
    return _parseList(response.data);
  }

  Future<Map<String, dynamic>?> getShopById(String id) async {
    try {
      final response = await _dio.get('/shops/$id');
      return _parseMap(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getNearbyShops({
    required double lat,
    required double lng,
    double radiusKm = AppConstants.nearbyRadiusKm,
    int page = 0,
    int pageSize = AppConstants.defaultPageSize,
  }) async {
    final response = await _dio.get('/shops/nearby', queryParameters: {
      'lat': lat,
      'lng': lng,
      'radius': radiusKm,
      'limit': pageSize,
      'offset': page * pageSize,
    });
    return _parseList(response.data);
  }

  Future<List<Map<String, dynamic>>> getFeaturedShops({
    int page = 0,
    int pageSize = AppConstants.defaultPageSize,
  }) async {
    final response = await _dio.get('/shops/featured', queryParameters: {
      'page': page,
      'pageSize': pageSize,
    });
    return _parseList(response.data);
  }

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getReviews(String productId) async {
    final response = await _dio.get('/reviews', queryParameters: {
      'productId': productId,
    });
    return _parseList(response.data);
  }

  Future<void> submitReview(Map<String, dynamic> data) async {
    await _dio.post('/reviews', data: data);
  }

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getOrders(String userId) async {
    final response = await _dio.get('/orders');
    return _parseList(response.data);
  }

  Future<Map<String, dynamic>?> getOrderById(String orderId) async {
    try {
      final response = await _dio.get('/orders/$orderId');
      return _parseMap(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createRazorpayOrder(int amountPaise) async {
    final response = await _dio.post('/razorpay/create-order', data: {'amount': amountPaise});
    return _parseMap(response.data) ?? {};
  }

  Future<String> createOrder(Map<String, dynamic> data) async {
    final response = await _dio.post('/orders', data: data);
    final body = _parseMap(response.data);
    return body?['id'] as String? ?? body?['orderId'] as String? ?? '';
  }

  Future<void> updateOrderStatus(String orderId, String status) async {
    await _dio.patch('/orders/$orderId/status', data: {'status': status});
  }

  // ---------------------------------------------------------------------------
  // Cart
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getCartItems(String userId) async {
    final response = await _dio.get('/cart');
    return _parseList(response.data);
  }

  Future<void> addCartItem(Map<String, dynamic> data) async {
    await _dio.post('/cart', data: data);
  }

  Future<void> updateCartItem(String id, Map<String, dynamic> data) async {
    await _dio.put('/cart/$id', data: data);
  }

  Future<void> deleteCartItem(String id) async {
    await _dio.delete('/cart/$id');
  }

  Future<void> clearCart() async {
    await _dio.delete('/cart');
  }

  Future<void> syncCartToServer(
      String userId, List<Map<String, dynamic>> items) async {
    await _dio.delete('/cart');
    if (items.isNotEmpty) {
      for (final item in items) {
        await _dio.post('/cart', data: item);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Wishlist
  // ---------------------------------------------------------------------------
  Future<List<String>> getWishlist(String userId) async {
    final response = await _dio.get('/wishlist');
    final list = _parseList(response.data);
    return list.map((e) => e['product_id'] as String? ?? '').where((id) => id.isNotEmpty).toList();
  }

  Future<void> addToWishlist(String userId, String productId) async {
    await _dio.post('/wishlist', data: {'productId': productId});
  }

  Future<void> removeFromWishlist(String userId, String productId) async {
    await _dio.delete('/wishlist/$productId');
  }

  // ---------------------------------------------------------------------------
  // Addresses
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getAddresses(String userId) async {
    final response = await _dio.get('/addresses');
    return _parseList(response.data);
  }

  Future<String> addAddress(Map<String, dynamic> data) async {
    final response = await _dio.post('/addresses', data: data);
    final body = _parseMap(response.data);
    return body?['id'] as String? ?? '';
  }

  Future<void> updateAddress(String id, Map<String, dynamic> data) async {
    await _dio.put('/addresses/$id', data: data);
  }

  Future<void> deleteAddress(String id) async {
    await _dio.delete('/addresses/$id');
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------
  Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final response = await _dio.get('/profile');
      return _parseMap(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<void> updateUserProfile(
      String userId, Map<String, dynamic> data) async {
    await _dio.put('/profile', data: data);
  }

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getNotifications(String userId) async {
    final response = await _dio.get('/notifications');
    return _parseList(response.data);
  }

  Future<void> markNotificationRead(String id) async {
    await _dio.patch('/notifications/$id/read');
  }

  Future<void> markAllNotificationsRead(String userId) async {
    await _dio.patch('/notifications/read-all');
  }

  // ---------------------------------------------------------------------------
  // Returns
  // ---------------------------------------------------------------------------
  Future<List<Map<String, dynamic>>> getReturns(String userId) async {
    final response = await _dio.get('/returns');
    return _parseList(response.data);
  }

  Future<String> createReturn(Map<String, dynamic> data) async {
    final response = await _dio.post('/returns', data: data);
    final body = _parseMap(response.data);
    return body?['id'] as String? ?? '';
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  List<Map<String, dynamic>> _parseList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().toList();
    }
    if (data is Map<String, dynamic>) {
      // Check common envelope keys first
      for (final key in ['data', 'items', 'results', 'records',
                         'products', 'shops', 'orders', 'categories',
                         'addresses', 'reviews', 'notifications', 'returns']) {
        if (data[key] is List) {
          return (data[key] as List).whereType<Map<String, dynamic>>().toList();
        }
      }
      // Fall back: return first list value found in the map
      for (final value in data.values) {
        if (value is List) {
          return value.whereType<Map<String, dynamic>>().toList();
        }
      }
    }
    return [];
  }

  Map<String, dynamic>? _parseMap(dynamic data) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      // Unwrap common envelope keys
      for (final key in ['data', 'item', 'result', 'record']) {
        if (data[key] is Map<String, dynamic>) {
          return data[key] as Map<String, dynamic>;
        }
      }
      return data;
    }
    return null;
  }
}
