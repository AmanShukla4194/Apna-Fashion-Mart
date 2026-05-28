import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:apna_fashion_mart/core/theme/afm_theme.dart';
import 'package:apna_fashion_mart/core/services/ai_chatbot_service.dart';
import 'package:apna_fashion_mart/features/chatbot/widgets/chat_message_bubble.dart';

// ---------------------------------------------------------------------------
// Message model
// ---------------------------------------------------------------------------

class ChatMessage {
  final String id;
  final String role; // 'user' | 'assistant'
  final String content;
  final DateTime timestamp;
  final bool isStreaming;

  const ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
    this.isStreaming = false,
  });

  ChatMessage copyWith({String? content, bool? isStreaming}) => ChatMessage(
    id: id,
    role: role,
    content: content ?? this.content,
    timestamp: timestamp,
    isStreaming: isStreaming ?? this.isStreaming,
  );
}

// ---------------------------------------------------------------------------
// Suggestion chips data
// ---------------------------------------------------------------------------

const _suggestions = [
  'What styles are trending?',
  'Help me find ethnic wear nearby',
  'How do I track my order?',
  'What is your return policy?',
  'How does same-day delivery work?',
  'Find verified boutiques near me',
];

// ---------------------------------------------------------------------------
// ChatbotScreen
// ---------------------------------------------------------------------------

class ChatbotScreen extends ConsumerStatefulWidget {
  const ChatbotScreen({super.key});

  @override
  ConsumerState<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends ConsumerState<ChatbotScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  // Instance of AI service (stateless helper, can be shared)
  final AiChatbotService _aiService = AiChatbotService();

  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String _statusText = 'Online';

  @override
  void initState() {
    super.initState();
    _messages.add(ChatMessage(
      id: 'greeting',
      role: 'assistant',
      content: 'Namaste! 👋 I\'m **Apna AI**, your personal style assistant.\n\n'
          'I can help you discover **fashion trends**, find **boutiques near you**, '
          'track your **orders**, and answer any questions about **Apna Fashion Mart**.\n\n'
          'How can I help you today?',
      timestamp: DateTime.now(),
    ));
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _scrollToBottom({bool animated = true}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        if (animated) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        } else {
          _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
        }
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _isLoading) return;

    _textController.clear();
    final ts = DateTime.now().millisecondsSinceEpoch;
    final userMsgId = 'u_$ts';
    final assistantMsgId = 'a_$ts';

    setState(() {
      _isLoading = true;
      _statusText = 'Thinking...';
      _messages.add(ChatMessage(id: userMsgId, role: 'user', content: trimmed, timestamp: DateTime.now()));
      _messages.add(ChatMessage(id: assistantMsgId, role: 'assistant', content: '', timestamp: DateTime.now(), isStreaming: true));
    });
    _scrollToBottom();

    try {
      // Build conversation history in Anthropic format (exclude the placeholder assistant msg)
      final history = _messages
          .where((m) => m.id != assistantMsgId)
          .map((m) => {'role': m.role, 'content': m.content})
          .toList();

      await for (final chunk in _aiService.sendMessage(history)) {
        if (!mounted) break;
        setState(() {
          final idx = _messages.indexWhere((m) => m.id == assistantMsgId);
          if (idx != -1) {
            _messages[idx] = _messages[idx].copyWith(content: _messages[idx].content + chunk);
          }
        });
        _scrollToBottom();
      }

      if (mounted) {
        setState(() {
          final idx = _messages.indexWhere((m) => m.id == assistantMsgId);
          if (idx != -1) {
            _messages[idx] = _messages[idx].copyWith(isStreaming: false);
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          final idx = _messages.indexWhere((m) => m.id == assistantMsgId);
          if (idx != -1) {
            _messages[idx] = _messages[idx].copyWith(
              content: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false,
            );
          }
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _statusText = 'Online';
        });
        _scrollToBottom();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final showSuggestions = _messages.length <= 1;

    return Scaffold(
      backgroundColor: AfmColors.neutral50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: AfmColors.navy800),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AfmColors.navy800, AfmColors.magenta600],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: const Center(child: Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16))),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Text('Apna AI', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AfmColors.navy800)),
                    SizedBox(width: 6),
                    Icon(Icons.auto_awesome, size: 14, color: AfmColors.gold500),
                  ],
                ),
                Row(
                  children: [
                    Container(
                      width: 7, height: 7,
                      margin: const EdgeInsets.only(right: 4),
                      decoration: BoxDecoration(
                        color: _isLoading ? AfmColors.gold500 : const Color(0xFF16A34A),
                        shape: BoxShape.circle,
                      ),
                    ),
                    Text(_statusText, style: const TextStyle(fontSize: 11, color: AfmColors.neutral500, fontWeight: FontWeight.w500)),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: AfmColors.navy800),
            onPressed: _showChatOptions,
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              itemCount: _messages.length + (showSuggestions ? 1 : 0),
              itemBuilder: (context, index) {
                if (showSuggestions && index == _messages.length) {
                  return _buildSuggestionChips();
                }
                final msg = _messages[index];
                return ChatMessageBubble(
                  message: msg,
                  onCopy: () {
                    Clipboard.setData(ClipboardData(text: msg.content));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Message copied'),
                        backgroundColor: AfmColors.navy800,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Compact suggestion pills when chat is active
          if (!showSuggestions && !_isLoading)
            _buildCompactSuggestions(),

          // Input bar
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildSuggestionChips() {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Suggested questions:', style: TextStyle(fontSize: 12, color: AfmColors.neutral500, fontWeight: FontWeight.w500)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _suggestions.map((s) => GestureDetector(
              onTap: () => _sendMessage(s),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AfmColors.magenta600.withValues(alpha: 0.4)),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2))],
                ),
                child: Text(s, style: const TextStyle(fontSize: 13, color: AfmColors.navy800, fontWeight: FontWeight.w500)),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactSuggestions() {
    return SizedBox(
      height: 40,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        children: _suggestions.take(4).map((s) => GestureDetector(
          onTap: () => _sendMessage(s),
          child: Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AfmColors.neutral200),
            ),
            child: Text(s, style: const TextStyle(fontSize: 12, color: AfmColors.neutral700, fontWeight: FontWeight.w500), maxLines: 1),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 16, right: 16, top: 10,
        bottom: MediaQuery.of(context).padding.bottom + 10,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -3))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: AfmColors.neutral100,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AfmColors.neutral200),
              ),
              child: TextField(
                controller: _textController,
                focusNode: _focusNode,
                minLines: 1, maxLines: 4,
                enabled: !_isLoading,
                textInputAction: TextInputAction.send,
                onSubmitted: _sendMessage,
                decoration: const InputDecoration(
                  hintText: 'Ask me anything about fashion…',
                  hintStyle: TextStyle(color: AfmColors.neutral500, fontSize: 14),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                ),
                style: const TextStyle(fontSize: 14, color: AfmColors.navy800),
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: _isLoading ? null : () => _sendMessage(_textController.text),
            child: Container(
              width: 46, height: 46,
              decoration: BoxDecoration(
                gradient: _isLoading
                    ? null
                    : const LinearGradient(
                        colors: [AfmColors.navy800, AfmColors.magenta600],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                color: _isLoading ? AfmColors.neutral200 : null,
                shape: BoxShape.circle,
                boxShadow: _isLoading ? null : [BoxShadow(color: AfmColors.magenta600.withValues(alpha: 0.35), blurRadius: 10, offset: const Offset(0, 3))],
              ),
              child: Icon(Icons.send_rounded, color: _isLoading ? AfmColors.neutral500 : Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  void _showChatOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AfmColors.neutral200, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 12),
            ListTile(
              leading: const Icon(Icons.delete_outline_rounded, color: Colors.red),
              title: const Text('Clear conversation'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _messages.clear();
                  _messages.add(ChatMessage(
                    id: 'greeting_new',
                    role: 'assistant',
                    content: 'Namaste! 👋 I\'m **Apna AI**, your personal style assistant.\n\nHow can I help you today?',
                    timestamp: DateTime.now(),
                  ));
                });
              },
            ),
            ListTile(
              leading: const Icon(Icons.info_outline_rounded, color: AfmColors.navy800),
              title: const Text('About Apna AI'),
              onTap: () {
                Navigator.pop(context);
                showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    title: const Text('About Apna AI'),
                    content: const Text(
                      'Apna AI is your personal fashion assistant powered by AI. '
                      'It helps you discover styles, find boutiques, track orders, '
                      'and answer questions about Apna Fashion Mart.',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Got it', style: TextStyle(color: AfmColors.magenta600)),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
