import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/core/providers/auth_provider.dart';
import 'package:apna_fashion_mart/features/account/widgets/address_list_screen.dart';

const String _appVersion = '1.0.0';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    if (user == null) {
      return _UnauthenticatedView();
    }
    return _AuthenticatedView(user: user, ref: ref);
  }
}

// ---------------------------------------------------------------------------
// Unauthenticated
// ---------------------------------------------------------------------------

class _UnauthenticatedView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/logo.png',
                width: 120,
                height: 120,
                errorBuilder: (_, __, ___) => Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: AppColors.navy800,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Center(
                    child: Text(
                      'AFM',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Your Fashion Account',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: AppColors.navy800,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),
              Text(
                'Sign in to track orders, manage your wishlist, and explore exclusive deals from local boutiques.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.push('/login'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.magenta600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Sign In',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.push('/register'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.navy800,
                    side: const BorderSide(color: AppColors.navy800, width: 1.5),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Create Account',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => context.push('/browse'),
                child: Text(
                  'Continue browsing as guest',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Authenticated
// ---------------------------------------------------------------------------

class _AuthenticatedView extends StatelessWidget {
  const _AuthenticatedView({required this.user, required this.ref});

  final dynamic user;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final String displayName = user.userMetadata?['full_name'] as String? ??
        user.email?.split('@').first ??
        'Fashion Lover';
    final String email = user.email ?? '';
    final String memberYear = _parseMemberYear(user.createdAt);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: CustomScrollView(
        slivers: [
          // ── Header ────────────────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: AppColors.navy800,
            flexibleSpace: FlexibleSpaceBar(
              background: _ProfileHeader(
                displayName: displayName,
                email: email,
                memberYear: memberYear,
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined, color: Colors.white),
                onPressed: () => context.push('/account/settings'),
              ),
            ],
          ),

          // ── Stats row ─────────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _StatsRow(),
          ),

          // ── Section: Shop ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _AccountSection(
              title: 'Shop',
              items: [
                _AccountItem(
                  icon: Icons.shopping_bag_outlined,
                  label: 'Orders & Tracking',
                  onTap: () => context.push('/account/orders'),
                ),
                _AccountItem(
                  icon: Icons.favorite_border,
                  label: 'Wishlist',
                  onTap: () => context.push('/wishlist'),
                ),
                _AccountItem(
                  icon: Icons.assignment_return_outlined,
                  label: 'Returns & Refunds',
                  onTap: () => context.push('/account/returns'),
                ),
                _AccountItem(
                  icon: Icons.history,
                  label: 'Recently Viewed',
                  trailing: const _CountBadge(count: 12),
                  onTap: () => context.push('/account/recently-viewed'),
                ),
              ],
            ),
          ),

          // ── Section: Account ──────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _AccountSection(
              title: 'Account',
              items: [
                _AccountItem(
                  icon: Icons.person_outline,
                  label: 'Profile',
                  onTap: () => context.push('/account/profile'),
                ),
                _AccountItem(
                  icon: Icons.location_on_outlined,
                  label: 'Saved Addresses',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const AddressListScreen(),
                    ),
                  ),
                ),
                _AccountItem(
                  icon: Icons.account_balance_wallet_outlined,
                  label: 'Payments & Wallet',
                  trailing: const _WalletBadge(),
                  onTap: () => context.push('/account/wallet'),
                ),
                _AccountItem(
                  icon: Icons.notifications_outlined,
                  label: 'Notification Settings',
                  onTap: () =>
                      context.push('/account/notifications/settings'),
                ),
              ],
            ),
          ),

          // ── Section: Help ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _AccountSection(
              title: 'Help',
              items: [
                _AccountItem(
                  icon: Icons.help_outline,
                  label: 'Help Center',
                  onTap: () => context.push('/account/help'),
                ),
                _AccountItem(
                  icon: Icons.privacy_tip_outlined,
                  label: 'Privacy Policy',
                  onTap: () => _launchUrl('https://apnafashionmart.com/legal/privacy'),
                ),
                _AccountItem(
                  icon: Icons.description_outlined,
                  label: 'Terms of Service',
                  onTap: () =>
                      _launchUrl('https://apnafashionmart.com/legal/terms'),
                ),
                _AccountItem(
                  icon: Icons.logout,
                  label: 'Sign Out',
                  labelColor: Colors.red,
                  iconColor: Colors.red,
                  onTap: () => _confirmSignOut(context, ref),
                ),
              ],
            ),
          ),

          // ── Version footer ────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 32, top: 8),
              child: Center(
                child: Text(
                  'Apna Fashion Mart v$_appVersion',
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _parseMemberYear(dynamic createdAt) {
    try {
      if (createdAt is String) {
        return DateTime.parse(createdAt).year.toString();
      }
      if (createdAt is DateTime) {
        return createdAt.year.toString();
      }
    } catch (_) {}
    return DateTime.now().year.toString();
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _confirmSignOut(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text(
              'Sign Out',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(authProvider.notifier).signOut();
    }
  }
}

// ---------------------------------------------------------------------------
// Profile header
// ---------------------------------------------------------------------------

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.displayName,
    required this.email,
    required this.memberYear,
  });

  final String displayName;
  final String email;
  final String memberYear;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.navy800,
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
      child: Row(
        children: [
          CircleAvatar(
            radius: 36,
            backgroundColor: AppColors.magenta600,
            child: Text(
              displayName.isNotEmpty
                  ? displayName[0].toUpperCase()
                  : 'U',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  displayName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 13,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.gold500.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.gold500, width: 1),
                  ),
                  child: Text(
                    'Member since $memberYear',
                    style: const TextStyle(
                      color: AppColors.gold500,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Stats row
// ---------------------------------------------------------------------------

class _StatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          const _StatCell(
            label: 'Orders',
            value: '7',
            icon: Icons.shopping_bag_outlined,
            color: AppColors.navy800,
          ),
          _divider(),
          const _StatCell(
            label: 'Wishlist',
            value: '14',
            icon: Icons.favorite_border,
            color: AppColors.magenta600,
          ),
          _divider(),
          const _StatCell(
            label: 'Wallet',
            value: '₹420',
            icon: Icons.account_balance_wallet_outlined,
            color: AppColors.gold500,
          ),
        ],
      ),
    );
  }

  Widget _divider() => Container(
        width: 1,
        height: 40,
        color: Colors.grey[200],
      );
}

class _StatCell extends StatelessWidget {
  const _StatCell({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section widget
// ---------------------------------------------------------------------------

class _AccountSection extends StatelessWidget {
  const _AccountSection({required this.title, required this.items});

  final String title;
  final List<_AccountItem> items;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Text(
              title.toUpperCase(),
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ListView.separated(
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              itemCount: items.length,
              separatorBuilder: (_, __) => Divider(
                height: 1,
                indent: 56,
                color: Colors.grey[100],
              ),
              itemBuilder: (_, i) => items[i],
            ),
          ),
        ],
      ),
    );
  }
}

class _AccountItem extends StatelessWidget {
  const _AccountItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.trailing,
    this.labelColor,
    this.iconColor,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Widget? trailing;
  final Color? labelColor;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(
        icon,
        color: iconColor ?? AppColors.navy800,
        size: 22,
      ),
      title: Text(
        label,
        style: TextStyle(
          color: labelColor ?? const Color(0xFF1A1A2E),
          fontSize: 15,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: trailing ??
          Icon(
            Icons.chevron_right,
            color: Colors.grey[400],
            size: 20,
          ),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    );
  }
}

// ---------------------------------------------------------------------------
// Badge widgets
// ---------------------------------------------------------------------------

class _CountBadge extends StatelessWidget {
  const _CountBadge({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.navy800.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        '$count',
        style: const TextStyle(
          color: AppColors.navy800,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _WalletBadge extends StatelessWidget {
  const _WalletBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.gold500.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Text(
        '₹420',
        style: TextStyle(
          color: AppColors.gold500,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
