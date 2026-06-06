import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/providers/auth_provider.dart';
import 'core/theme/afm_theme.dart';
import 'shared/widgets/bottom_nav.dart';

// Feature screens
import 'features/home/home_screen.dart';
import 'features/nearby/nearby_screen.dart';
import 'features/nearby/shop_detail_screen.dart';
import 'features/wishlist/wishlist_screen.dart';
import 'features/cart/cart_screen.dart';
import 'features/account/account_screen.dart';
import 'features/account/orders_screen.dart';
import 'features/account/order_detail_screen.dart';
import 'features/account/edit_profile_screen.dart';
import 'features/account/notifications_screen.dart';
import 'features/account/returns_screen.dart';
import 'features/search/search_screen.dart';
import 'features/categories/categories_screen.dart';
import 'features/products/product_list_screen.dart';
import 'features/products/product_detail_screen.dart';
import 'features/checkout/checkout_screen.dart';
import 'features/checkout/address_screen.dart';
import 'features/checkout/order_success_screen.dart';
import 'features/chatbot/chatbot_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/auth/otp_screen.dart';
import 'features/auth/verify_email_screen.dart';
import 'features/auth/forgot_password_screen.dart';
import 'features/vendor/vendor_dashboard_screen.dart';
import 'features/vendor/vendor_products_screen.dart';
import 'features/vendor/vendor_add_product_screen.dart';
import 'features/vendor/vendor_orders_screen.dart';
import 'features/vendor/vendor_store_setup_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

// Notifier that triggers router redirect re-evaluation without recreating the router.
class _AuthRouterNotifier extends ChangeNotifier {
  final Ref _ref;
  _AuthRouterNotifier(this._ref) {
    _ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
  }

  bool get isAuthenticated =>
      _ref.read(authProvider).status == AuthStatus.authenticated;
}

final _routerProvider = Provider<GoRouter>((ref) {
  final notifier = _AuthRouterNotifier(ref);
  ref.onDispose(notifier.dispose);

  const publicRoutes = {'/login', '/register', '/otp', '/verify-email', '/forgot-password'};
  const protectedPrefixes = ['/account', '/checkout', '/chatbot'];

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    debugLogDiagnostics: false,
    refreshListenable: notifier,
    redirect: (context, state) {
      final isAuthenticated = notifier.isAuthenticated;
      final isPublic = publicRoutes.contains(state.matchedLocation);
      final needsAuth = protectedPrefixes.any(
        (p) => state.matchedLocation.startsWith(p),
      );

      if (needsAuth && !isAuthenticated) {
        return '/login?redirect=${Uri.encodeComponent(state.uri.toString())}';
      }
      if (isAuthenticated && isPublic) {
        return '/';
      }
      return null;
    },
    routes: [
      // Shell routes (with persistent bottom nav)
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => AfmShell(child: child),
        routes: [
          GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/nearby', builder: (_, __) => const NearbyScreen()),
          GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
          GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
          GoRoute(
            path: '/account',
            builder: (_, __) => const AccountScreen(),
            routes: [
              GoRoute(
                path: 'orders',
                builder: (_, __) => const OrdersScreen(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (_, state) => OrderDetailScreen(
                      orderId: state.pathParameters['id']!,
                    ),
                  ),
                ],
              ),
              GoRoute(path: 'profile', builder: (_, __) => const EditProfileScreen()),
              GoRoute(path: 'notifications', builder: (_, __) => const NotificationsScreen()),
              GoRoute(path: 'returns', builder: (_, __) => const ReturnsScreen()),
            ],
          ),
        ],
      ),

      // Full-screen routes (no bottom nav)
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
      GoRoute(path: '/categories', builder: (_, __) => const CategoriesScreen()),
      GoRoute(
        path: '/products',
        builder: (_, state) => ProductListScreen(
          category: state.uri.queryParameters['category'],
        ),
      ),
      GoRoute(
        path: '/product/:id',
        builder: (_, state) => ProductDetailScreen(
          id: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/shop/:id',
        builder: (_, state) => ShopDetailScreen(
          shopId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/checkout',
        builder: (_, __) => const CheckoutScreen(),
        routes: [
          GoRoute(
            path: 'address',
            builder: (_, state) => AddressScreen(
              addressId: state.uri.queryParameters['edit'],
            ),
          ),
          GoRoute(
            path: 'success/:orderId',
            builder: (_, state) => OrderSuccessScreen(
              orderId: state.pathParameters['orderId']!,
            ),
          ),
        ],
      ),
      GoRoute(path: '/chatbot', builder: (_, __) => const ChatbotScreen()),
      GoRoute(path: '/vendor', builder: (_, __) => const VendorDashboardScreen()),
      GoRoute(path: '/vendor/products', builder: (_, __) => const VendorProductsScreen()),
      GoRoute(path: '/vendor/products/new', builder: (_, __) => const VendorAddProductScreen()),
      GoRoute(
        path: '/vendor/products/edit',
        builder: (context, state) => VendorAddProductScreen(product: state.extra as Map<String, dynamic>?),
      ),
      GoRoute(path: '/vendor/orders', builder: (_, __) => const VendorOrdersScreen()),
      GoRoute(path: '/vendor/store', builder: (_, __) => const VendorStoreSetupScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/otp', builder: (_, __) => const OtpScreen()),
      GoRoute(
        path: '/verify-email',
        builder: (_, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return VerifyEmailScreen(
            email: extra['email'] as String? ?? '',
            password: extra['password'] as String? ?? '',
          );
        },
      ),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
    ],
  );
});

class AfmApp extends ConsumerWidget {
  const AfmApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(_routerProvider);

    return MaterialApp.router(
      title: 'Apna Fashion Mart',
      debugShowCheckedModeBanner: false,
      theme: afmLightTheme(),
      darkTheme: afmDarkTheme(),
      themeMode: ThemeMode.light,
      routerConfig: router,
    );
  }
}

class AfmShell extends StatelessWidget {
  final Widget child;
  const AfmShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: const AfmBottomNav(),
    );
  }
}
