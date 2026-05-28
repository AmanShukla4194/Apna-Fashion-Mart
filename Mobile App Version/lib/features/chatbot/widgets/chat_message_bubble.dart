import 'package:flutter/material.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/features/chatbot/chatbot_screen.dart';

/// A single chat bubble — user (right, magenta gradient) or
/// assistant (left, white card with avatar).
class ChatMessageBubble extends StatelessWidget {
  final ChatMessage message;
  final VoidCallback? onCopy;

  const ChatMessageBubble({
    super.key,
    required this.message,
    this.onCopy,
  });

  bool get _isUser => message.role == 'user';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: _isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!_isUser) ...[_AssistantAvatar(), const SizedBox(width: 8)],
          Flexible(
            child: _isUser
                ? _UserBubble(message: message, onCopy: onCopy)
                : _AssistantBubble(message: message, onCopy: onCopy),
          ),
          if (_isUser) ...[const SizedBox(width: 8), _UserAvatar()],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// User bubble
// ---------------------------------------------------------------------------

class _UserBubble extends StatelessWidget {
  final ChatMessage message;
  final VoidCallback? onCopy;
  const _UserBubble({required this.message, this.onCopy});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: onCopy,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF6D1B5C), AfmColors.magenta600],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(18),
            topRight: Radius.circular(18),
            bottomLeft: Radius.circular(18),
            bottomRight: Radius.circular(4),
          ),
          boxShadow: [
            BoxShadow(color: AfmColors.magenta600.withValues(alpha: 0.25), blurRadius: 10, offset: const Offset(0, 3)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            _RichText(
              text: message.content,
              baseStyle: const TextStyle(fontSize: 14, color: Colors.white, height: 1.45),
              boldStyle: const TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.w800, height: 1.45),
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(message.timestamp),
              style: TextStyle(fontSize: 10, color: Colors.white.withValues(alpha: 0.7)),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Assistant bubble
// ---------------------------------------------------------------------------

class _AssistantBubble extends StatelessWidget {
  final ChatMessage message;
  final VoidCallback? onCopy;
  const _AssistantBubble({required this.message, this.onCopy});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: onCopy,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(18),
            bottomLeft: Radius.circular(18),
            bottomRight: Radius.circular(18),
          ),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.07), blurRadius: 12, offset: const Offset(0, 3)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (message.isStreaming && message.content.isEmpty)
              _TypingIndicator()
            else ...[
              _RichText(
                text: message.content,
                baseStyle: const TextStyle(fontSize: 14, color: AfmColors.neutral800, height: 1.55),
                boldStyle: const TextStyle(fontSize: 14, color: AfmColors.navy800, fontWeight: FontWeight.w700, height: 1.55),
              ),
              if (message.isStreaming)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: _CursorBlink(),
                ),
            ],
            if (!message.isStreaming) ...[
              const SizedBox(height: 4),
              Text(_formatTime(message.timestamp), style: const TextStyle(fontSize: 10, color: AfmColors.neutral500)),
            ],
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Avatars
// ---------------------------------------------------------------------------

class _AssistantAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32, height: 32,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AfmColors.navy800, AfmColors.magenta600],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
      ),
      child: const Center(child: Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14))),
    );
  }
}

class _UserAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32, height: 32,
      decoration: const BoxDecoration(color: AfmColors.neutral200, shape: BoxShape.circle),
      child: const Icon(Icons.person_rounded, size: 18, color: AfmColors.neutral500),
    );
  }
}

// ---------------------------------------------------------------------------
// Typing indicator – 3 animated dots
// ---------------------------------------------------------------------------

class _TypingIndicator extends StatefulWidget {
  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator> with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) => AnimationController(vsync: this, duration: const Duration(milliseconds: 600)));
    _animations = _controllers.map((c) => Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: c, curve: Curves.easeInOut))).toList();
    for (int i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 180), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 20,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (i) => AnimatedBuilder(
          animation: _animations[i],
          builder: (_, __) => Container(
            width: 8, height: 8,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: BoxDecoration(
              color: AfmColors.magenta600.withValues(alpha: 0.3 + _animations[i].value * 0.7),
              shape: BoxShape.circle,
            ),
          ),
        )),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Blinking cursor for streaming
// ---------------------------------------------------------------------------

class _CursorBlink extends StatefulWidget {
  @override
  State<_CursorBlink> createState() => _CursorBlinkState();
}

class _CursorBlinkState extends State<_CursorBlink> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 600))..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) => Opacity(
        opacity: _controller.value,
        child: Container(width: 2, height: 14, color: AfmColors.magenta600),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Rich text parser: **text** → bold
// ---------------------------------------------------------------------------

class _RichText extends StatelessWidget {
  final String text;
  final TextStyle baseStyle;
  final TextStyle boldStyle;

  const _RichText({required this.text, required this.baseStyle, required this.boldStyle});

  List<TextSpan> _parseSpans(String input) {
    final spans = <TextSpan>[];
    final boldRegex = RegExp(r'\*\*(.+?)\*\*');
    int lastEnd = 0;
    for (final match in boldRegex.allMatches(input)) {
      if (match.start > lastEnd) {
        spans.add(TextSpan(text: input.substring(lastEnd, match.start), style: baseStyle));
      }
      spans.add(TextSpan(text: match.group(1), style: boldStyle));
      lastEnd = match.end;
    }
    if (lastEnd < input.length) {
      spans.add(TextSpan(text: input.substring(lastEnd), style: baseStyle));
    }
    return spans.isEmpty ? [TextSpan(text: input, style: baseStyle)] : spans;
  }

  @override
  Widget build(BuildContext context) {
    return RichText(text: TextSpan(children: _parseSpans(text)));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

String _formatTime(DateTime dt) {
  return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
}
