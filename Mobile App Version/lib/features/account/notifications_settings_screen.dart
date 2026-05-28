import 'package:flutter/material.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class _NotificationSetting {
  _NotificationSetting({
    required this.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.enabled,
  });

  final String key;
  final String title;
  final String subtitle;
  final IconData icon;
  bool enabled;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  bool _saving = false;

  final List<_NotificationSetting> _settings = [
    _NotificationSetting(
      key: 'price_drop',
      title: 'Price Drop Alerts',
      subtitle: 'Get notified when wishlisted items go on sale',
      icon: Icons.trending_down,
      enabled: true,
    ),
    _NotificationSetting(
      key: 'back_in_stock',
      title: 'Back in Stock',
      subtitle: 'Know when a sold-out item is available again',
      icon: Icons.inventory_2_outlined,
      enabled: true,
    ),
    _NotificationSetting(
      key: 'order_updates',
      title: 'Order Updates',
      subtitle: 'Track your orders with real-time delivery updates',
      icon: Icons.local_shipping_outlined,
      enabled: true,
    ),
    _NotificationSetting(
      key: 'new_boutiques',
      title: 'New Boutiques Nearby',
      subtitle: 'Discover new boutiques that open near your location',
      icon: Icons.store_outlined,
      enabled: true,
    ),
    _NotificationSetting(
      key: 'weekly_editorial',
      title: 'Weekly Editorial',
      subtitle: 'Curated fashion picks every week from AFM editors',
      icon: Icons.article_outlined,
      enabled: false,
    ),
    _NotificationSetting(
      key: 'marketing_offers',
      title: 'Marketing Offers',
      subtitle: 'Promotional deals, flash sales, and exclusive offers',
      icon: Icons.local_offer_outlined,
      enabled: false,
    ),
  ];

  Future<void> _save() async {
    setState(() => _saving = true);
    // Simulate API call
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.white, size: 18),
            SizedBox(width: 8),
            Text('Notification preferences saved'),
          ],
        ),
        backgroundColor: Colors.green[700],
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Partition into two groups
    final essentialKeys = {'price_drop', 'back_in_stock', 'order_updates', 'new_boutiques'};
    final essential = _settings.where((s) => essentialKeys.contains(s.key)).toList();
    final marketing = _settings.where((s) => !essentialKeys.contains(s.key)).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppColors.navy800,
        foregroundColor: Colors.white,
        title: const Text(
          'Notification Settings',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const _SectionHeader(
            title: 'Shopping & Alerts',
            subtitle: 'Stay informed about your activity',
          ),
          _SettingsCard(settings: essential, onChanged: (s, val) {
            setState(() => s.enabled = val);
          }),
          const SizedBox(height: 20),
          const _SectionHeader(
            title: 'Content & Promotions',
            subtitle: 'Choose what promotional content you receive',
          ),
          _SettingsCard(settings: marketing, onChanged: (s, val) {
            setState(() => s.enabled = val);
          }),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saving ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.magenta600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _saving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Text(
                      'Save Preferences',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text(
              'You can always change these settings later',
              style: TextStyle(color: Colors.grey[400], fontSize: 12),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.navy800,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: TextStyle(color: Colors.grey[500], fontSize: 12),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Settings card
// ---------------------------------------------------------------------------

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({
    required this.settings,
    required this.onChanged,
  });

  final List<_NotificationSetting> settings;
  final void Function(_NotificationSetting setting, bool value) onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
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
        itemCount: settings.length,
        separatorBuilder: (_, __) => Divider(
          height: 1,
          indent: 60,
          color: Colors.grey[100],
        ),
        itemBuilder: (_, i) {
          final s = settings[i];
          return SwitchListTile(
            value: s.enabled,
            onChanged: (val) => onChanged(s, val),
            activeThumbColor: AppColors.magenta600,
            secondary: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: s.enabled
                    ? AppColors.magenta600.withValues(alpha: 0.1)
                    : Colors.grey[100],
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                s.icon,
                size: 18,
                color: s.enabled ? AppColors.magenta600 : Colors.grey[400],
              ),
            ),
            title: Text(
              s.title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: s.enabled ? const Color(0xFF1A1A2E) : Colors.grey[400],
              ),
            ),
            subtitle: Text(
              s.subtitle,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
              ),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          );
        },
      ),
    );
  }
}
