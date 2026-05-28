import 'package:flutter/material.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/features/account/orders_screen.dart';
import 'package:apna_fashion_mart/features/account/widgets/tracking_timeline.dart';

// ---------------------------------------------------------------------------
// Return model
// ---------------------------------------------------------------------------

class ReturnModel {
  const ReturnModel({
    required this.id,
    required this.status,
    required this.productName,
    required this.reason,
    required this.refundAmount,
    required this.refundTo,
    required this.steps,
  });

  final String id;
  final String status;
  final String productName;
  final String reason;
  final double refundAmount;
  final String refundTo;
  final List<TrackingStep> steps;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const _mockReturn = ReturnModel(
  id: 'AFM-RET-1042-P7W3',
  status: 'Refund in progress',
  productName: 'Banarasi Silk Saree',
  reason: 'Wrong size received',
  refundAmount: 4899,
  refundTo: 'HDFC Bank Credit Card (•••• 4242)',
  steps: [
    TrackingStep(
      label: 'Return Requested',
      stepStatus: StepStatus.done,
      timestamp: '14 May, 1:00 PM',
    ),
    TrackingStep(
      label: 'Pickup Scheduled',
      stepStatus: StepStatus.done,
      timestamp: '15 May, 9:00 AM',
    ),
    TrackingStep(
      label: 'Item Collected',
      stepStatus: StepStatus.done,
      timestamp: '15 May, 3:30 PM',
    ),
    TrackingStep(
      label: 'Boutique Acknowledged',
      stepStatus: StepStatus.current,
      timestamp: '16 May (expected)',
    ),
    TrackingStep(
      label: 'Refund Credited',
      stepStatus: StepStatus.pending,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ReturnsScreen extends StatelessWidget {
  const ReturnsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: AppColors.navy800,
        foregroundColor: Colors.white,
        title: const Text(
          'Returns & Refunds',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showNewReturnSheet(context),
        backgroundColor: AppColors.magenta600,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Initiate Return'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Active return card ─────────────────────────────────────────
            const _ReturnCard(returnModel: _mockReturn),
            const SizedBox(height: 20),

            // ── Return policy ──────────────────────────────────────────────
            _ReturnPolicyCard(),
          ],
        ),
      ),
    );
  }

  void _showNewReturnSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _NewReturnSheet(),
    );
  }
}

// ---------------------------------------------------------------------------
// Return card
// ---------------------------------------------------------------------------

class _ReturnCard extends StatelessWidget {
  const _ReturnCard({required this.returnModel});
  final ReturnModel returnModel;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.navy800.withValues(alpha: 0.04),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        returnModel.id,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 4),
                      _StatusChip(status: returnModel.status),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '₹${returnModel.refundAmount.toInt()}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: AppColors.navy800,
                      ),
                    ),
                    const Text(
                      'Refund amount',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Product info
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _InfoRow(
                  icon: Icons.checkroom,
                  label: 'Product',
                  value: returnModel.productName,
                ),
                const SizedBox(height: 8),
                _InfoRow(
                  icon: Icons.info_outline,
                  label: 'Reason',
                  value: returnModel.reason,
                ),
                const SizedBox(height: 8),
                _InfoRow(
                  icon: Icons.account_balance_outlined,
                  label: 'Refund to',
                  value: returnModel.refundTo,
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Timeline
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Return Timeline',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: AppColors.navy800,
                  ),
                ),
                const SizedBox(height: 12),
                TrackingTimeline(steps: returnModel.steps),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3CD),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: const TextStyle(
          color: Color(0xFF856404),
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: Colors.grey[400]),
        const SizedBox(width: 8),
        SizedBox(
          width: 80,
          child: Text(
            '$label:',
            style:
                TextStyle(color: Colors.grey[500], fontSize: 12),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Return policy card
// ---------------------------------------------------------------------------

class _ReturnPolicyCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F8FF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBBD6FF), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.policy_outlined, color: AppColors.navy800, size: 18),
              SizedBox(width: 8),
              Text(
                'Return Policy',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: AppColors.navy800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...[
            '7-day return window from delivery date',
            'Items must be unworn, unwashed with tags intact',
            'Refunds are credited within 5–7 business days',
            'Customised or sale items are not eligible for returns',
            'Free pickup available for most pin codes',
          ].map(
            (point) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• ', style: TextStyle(color: Colors.grey)),
                  Expanded(
                    child: Text(
                      point,
                      style:
                          TextStyle(fontSize: 12, color: Colors.grey[700]),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// New return bottom sheet
// ---------------------------------------------------------------------------

class _NewReturnSheet extends StatefulWidget {
  const _NewReturnSheet();

  @override
  State<_NewReturnSheet> createState() => _NewReturnSheetState();
}

class _NewReturnSheetState extends State<_NewReturnSheet> {
  String? _selectedOrderId;

  final _deliverableOrders = [
    {'id': 'AFM-ORD-2845-X9K2', 'product': 'Banarasi Silk Saree'},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Initiate a Return',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            'Select a delivered order to begin the return process.',
            style: TextStyle(color: Colors.grey[600], fontSize: 13),
          ),
          const SizedBox(height: 16),
          ..._deliverableOrders.map(
            (o) => RadioListTile<String>(
              value: o['id']!,
              groupValue: _selectedOrderId,
              onChanged: (v) => setState(() => _selectedOrderId = v),
              title: Text(o['product']!,
                  style: const TextStyle(fontWeight: FontWeight.w500)),
              subtitle: Text(o['id']!,
                  style: const TextStyle(fontSize: 12)),
              activeColor: AppColors.magenta600,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _selectedOrderId == null
                  ? null
                  : () {
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                              'Return initiated. Our team will contact you shortly.'),
                          backgroundColor: AppColors.navy800,
                        ),
                      );
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.magenta600,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                'Continue',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
