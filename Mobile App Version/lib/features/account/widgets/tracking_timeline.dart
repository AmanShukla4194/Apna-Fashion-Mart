import 'package:flutter/material.dart';
import 'package:apna_fashion_mart/core/theme/app_colors.dart';
import 'package:apna_fashion_mart/features/account/orders_screen.dart';

class TrackingTimeline extends StatelessWidget {
  const TrackingTimeline({super.key, required this.steps});

  final List<TrackingStep> steps;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(steps.length, (i) {
        final step = steps[i];
        final isLast = i == steps.length - 1;
        return _TimelineRow(
          step: step,
          isLast: isLast,
        );
      }),
    );
  }
}

class _TimelineRow extends StatefulWidget {
  const _TimelineRow({required this.step, required this.isLast});

  final TrackingStep step;
  final bool isLast;

  @override
  State<_TimelineRow> createState() => _TimelineRowState();
}

class _TimelineRowState extends State<_TimelineRow>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.4).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    if (widget.step.stepStatus == StepStatus.current) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color get _dotColor {
    switch (widget.step.stepStatus) {
      case StepStatus.done:
        return Colors.green[600]!;
      case StepStatus.current:
        return AppColors.magenta600;
      case StepStatus.pending:
        return Colors.grey[300]!;
    }
  }

  Color get _lineColor {
    if (widget.step.stepStatus == StepStatus.done) {
      return Colors.green[300]!;
    }
    return Colors.grey[200]!;
  }

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Left column: dot + line ──────────────────────────────────────
          SizedBox(
            width: 32,
            child: Column(
              children: [
                _buildDot(),
                if (!widget.isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      color: _lineColor,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // ── Right column: label + timestamp ──────────────────────────────
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  const SizedBox(height: 1),
                  Text(
                    widget.step.label,
                    style: TextStyle(
                      fontWeight:
                          widget.step.stepStatus == StepStatus.current
                              ? FontWeight.bold
                              : FontWeight.w500,
                      fontSize: 13,
                      color: widget.step.stepStatus == StepStatus.pending
                          ? Colors.grey[400]
                          : const Color(0xFF1A1A2E),
                    ),
                  ),
                  if (widget.step.timestamp != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      widget.step.timestamp!,
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 11,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot() {
    if (widget.step.stepStatus == StepStatus.done) {
      return Container(
        width: 22,
        height: 22,
        decoration: BoxDecoration(
          color: Colors.green[600],
          shape: BoxShape.circle,
        ),
        child: const Icon(
          Icons.check,
          color: Colors.white,
          size: 13,
        ),
      );
    }

    if (widget.step.stepStatus == StepStatus.current) {
      return AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (_, __) {
          return Stack(
            alignment: Alignment.center,
            children: [
              // Outer pulse ring
              Transform.scale(
                scale: _pulseAnimation.value,
                child: Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    color: AppColors.magenta600.withValues(alpha: 0.25),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              // Inner solid dot
              Container(
                width: 14,
                height: 14,
                decoration: const BoxDecoration(
                  color: AppColors.magenta600,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          );
        },
      );
    }

    // Pending
    return Container(
      width: 14,
      height: 14,
      margin: const EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        shape: BoxShape.circle,
        border: Border.all(color: Colors.grey[300]!, width: 1.5),
      ),
    );
  }
}
