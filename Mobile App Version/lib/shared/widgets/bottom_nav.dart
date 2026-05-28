import 'package:badges/badges.dart' as badges;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/cart_provider.dart';
import '../../core/theme/afm_theme.dart';

class AfmBottomNav extends ConsumerWidget {
  const AfmBottomNav({super.key});

  static const _tabs = [
    _NavTab(label: 'Home', icon: Icons.home_outlined, activeIcon: Icons.home, route: '/'),
    _NavTab(label: 'Explore', icon: Icons.explore_outlined, activeIcon: Icons.explore, route: '/nearby'),
    _NavTab(label: 'Wishlist', icon: Icons.favorite_outline, activeIcon: Icons.favorite, route: '/wishlist'),
    _NavTab(label: 'Cart', icon: Icons.shopping_bag_outlined, activeIcon: Icons.shopping_bag, route: '/cart'),
    _NavTab(label: 'Account', icon: Icons.person_outline, activeIcon: Icons.person, route: '/account'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/account')) return 4;
    if (location.startsWith('/cart')) return 3;
    if (location.startsWith('/wishlist')) return 2;
    if (location.startsWith('/nearby')) return 1;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartCountProvider);
    final currentIndex = _currentIndex(context);
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.bottomNavigationBarTheme.backgroundColor ?? Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(_tabs.length, (index) {
              final tab = _tabs[index];
              final isActive = index == currentIndex;
              final color = isActive
                  ? AfmColors.navy800
                  : AfmColors.neutral400;

              Widget iconWidget = Icon(
                isActive ? tab.activeIcon : tab.icon,
                color: color,
                size: 24,
              );

              // Cart badge
              if (index == 3 && cartCount > 0) {
                iconWidget = badges.Badge(
                  badgeContent: Text(
                    cartCount > 99 ? '99+' : cartCount.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  badgeStyle: const badges.BadgeStyle(
                    badgeColor: AfmColors.magenta600,
                    padding: EdgeInsets.all(4),
                  ),
                  child: iconWidget,
                );
              }

              return Expanded(
                child: InkWell(
                  onTap: () => context.go(tab.route),
                  borderRadius: BorderRadius.circular(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      iconWidget,
                      const SizedBox(height: 4),
                      Text(
                        tab.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: isActive
                              ? FontWeight.w600
                              : FontWeight.w400,
                          color: color,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavTab {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;

  const _NavTab({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
  });
}
