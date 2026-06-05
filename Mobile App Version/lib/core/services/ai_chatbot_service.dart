import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';

import '../constants/app_constants.dart';

// Apna AI is powered by Groq (Llama 3.3 70B) via the web API.
// The mobile client routes through the Next.js /api/chat endpoint —
// the Groq API key stays server-side only, never in the app.

class AiChatbotService {
  // Route through the web app API — the Anthropic key stays server-side only.
  // This is the correct architecture: no API keys in the mobile app.
  static const String _chatEndpoint = '${AppConstants.websiteUrl}/api/chat';

  final Dio _dio;

  AiChatbotService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                connectTimeout: const Duration(seconds: 30),
                receiveTimeout: const Duration(seconds: 90),
              ),
            );

  /// Sends conversation history and streams plain-text response chunks.
  Stream<String> sendMessage(List<Map<String, dynamic>> messages) async* {
    try {
      final response = await _dio.post<ResponseBody>(
        _chatEndpoint,
        data: jsonEncode({'messages': messages}),
        options: Options(
          headers: {'Content-Type': 'application/json'},
          responseType: ResponseType.stream,
          validateStatus: (status) => status != null && status < 600,
        ),
      );

      final statusCode = response.statusCode ?? 0;

      // Handle non-streaming error responses
      if (statusCode >= 400) {
        String errMsg = 'Sorry, I\'m unable to respond right now. Please try again.';
        try {
          // Collect the error body
          final bytes = <int>[];
          await for (final chunk in (response.data!.stream as Stream<List<int>>)) {
            bytes.addAll(chunk);
          }
          final body = utf8.decode(bytes);
          final json = jsonDecode(body) as Map<String, dynamic>;
          if (statusCode == 503) {
            errMsg = '⚙️ Apna AI is not yet fully configured. Please try again later.';
          } else if (statusCode == 401) {
            errMsg = '🔑 AI service authentication error. Please contact support.';
          } else if (json['error'] != null) {
            errMsg = json['error'] as String;
          }
        } catch (_) { /* ignore parse errors */ }
        yield errMsg;
        return;
      }

      // Stream the plain-text response chunks
      final stream = (response.data!.stream as Stream<List<int>>)
          .transform(utf8.decoder);

      await for (final chunk in stream) {
        if (chunk.isNotEmpty) yield chunk;
      }
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        yield 'Request timed out. Please check your connection and try again.';
      } else if (e.type == DioExceptionType.connectionError) {
        yield 'Could not connect to Apna AI. Please check your internet connection.';
      } else {
        yield 'Unable to reach Apna AI right now. Please try again in a moment.';
      }
    } catch (_) {
      yield 'An unexpected error occurred. Please try again.';
    }
  }

  /// Non-streaming convenience wrapper — returns the full response string.
  Future<String> sendMessageSync(List<Map<String, dynamic>> messages) async {
    final buffer = StringBuffer();
    await for (final chunk in sendMessage(messages)) {
      buffer.write(chunk);
    }
    return buffer.toString();
  }
}
