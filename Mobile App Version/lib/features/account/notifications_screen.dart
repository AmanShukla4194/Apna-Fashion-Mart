import 'package:flutter/material.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/features/account/widgets/notification_tile.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

enum NotificationType { priceAlert, orderUpdate, newBoutique, rating, offer }

class NotificationModel {
  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.timeAgo,
    required this.isRead,
  });

  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final String timeAgo;
  bool isRead;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

List<NotificationModel> _buildMockNotifications() => [
      NotificationModel(
        id: 'n1',
        title: 'Price Drop Alert!',
        body: 'Banarasi Silk Saree is now ₹4,899 (was ₹6,200). Grab it before it sells out!',
        type: NotificationType.priceAlert,
        timeAgo: '2h ago',
        isRead: false,
      ),
      NotificationModel(
        id: 'n2',
        title: 'Order Out for Delivery',
        body: 'Your order AFM-ORD-2839 is out for delivery. Expected by 2:00 PM.',
        type: NotificationType.orderUpdate,
        timeAgo: '1d ago',
        isRead: true,
      ),
      NotificationModel(
        id: 'n3',
        title: 'New Boutique Nearby',
        body: "'Silk House' just opened 2.3 km from you. Explore their exclusive collection!",
        type: NotificationType.newBoutique,
        timeAgo: '2d ago',
        isRead: false,
      ),
      NotificationModel(
        id: 'n4',
        title: 'Rate Your Experience',
        body: 'Priya, your order was delivered. How was your shopping experience? Share your review!',
        type: NotificationType.rating,
        timeAgo: '3d ago',
        isRead: true,
      ),
      NotificationModel(
        id: 'n5',
        title: 'Flash Sale in 2 Hours',
        body: 'Exclusive Flash Sale starts soon — up to 60% off on sarees and suits!',
        type: NotificationType.offer,
        timeAgo: '5d ago',
        isRead: true,
      ),
    ];

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

enum _Tab { all, unread, orders, offers }

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late List<NotificationModel> _notifications;

  @override
  void initState() {
    super.initState();
    _notifications = _buildMockNotifications();
    _tabController = TabController(length: _Tab.values.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _markAllRead() {
    setState(() {
      for (final n in _notifications) {
        n.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('All notifications marked as read'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _dismissNotification(String id) {
    setState(() {
      _notifications.removeWhere((n) => n.id == id);
    });
  }

  void _tapNotification(NotificationModel n) {
    setState(() => n.isRead = true);
    // Navigate based on type
  }

  List<NotificationModel> _filtered(_Tab tab) {
    switch (tab) {
      case _Tab.all:
        return _notifications;
      case _Tab.unread:
        return _notifications.where((n) => !n.isRead).toList();
      case _Tab.orders:
        return _notifications
            .where((n) => n.type == NotificationType.orderUpdate)
            .toList();
      case _Tab.offers:
        return _notifications
            .where((n) =>
                n.type == NotificationType.priceAlert ||
                n.type == NotificationType.offer)
            .toList();
    }
  }

  int get _unreadCount => _notifications.where((n) => !n.isRead).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppColors.navy800,
        foregroundColor: Colors.white,
        title: Row(
          children: [
            const Text(
              'Notifications',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            if (_unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.magenta600,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$_unreadCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text(
                'Mark all read',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.magenta600,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Unread'),
            Tab(text: 'Orders'),
            Tab(text: 'Offers'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _Tab.values.map((tab) {
          final items = _filtered(tab);
          if (items.isEmpty) {
            return _EmptyNotifications(tab: tab);
          }
          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: items.length,
            itemBuilder: (_, i) {
              final notification = items[i];
              return NotificationTile(
                notification: notification,
                onTap: () => _tapNotification(notification),
                onDismissed: () => _dismissNotification(notification.id),
              );
            },
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyNotifications extends StatelessWidget {
  const _EmptyNotifications({required this.tab});
  final _Tab tab;

  String get _message {
    switch (tab) {
      case _Tab.unread:
        return 'All caught up!\nNo unread notifications.';
      case _Tab.orders:
        return 'No order notifications yet.';
      case _Tab.offers:
        return 'No offers right now.\nCheck back later!';
      default:
        return 'No notifications yet.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            tab == _Tab.unread
                ? Icons.check_circle_outline
                : Icons.notifications_none_outlined,
            size: 72,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            _message,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 15,
              fontWeight: FontWeight.w500,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
