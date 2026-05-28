import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';

import '../constants/env.dart';

class AiChatbotService {
  static const String _anthropicBaseUrl =
      'https://api.anthropic.com/v1/messages';
  static const String _model = 'claude-3-5-sonnet-20241022';

  static const String systemPrompt = '''
You are the AFM Assistant — a friendly, knowledgeable shopping helper for Apna Fashion Mart (AFM), India's leading hyperlocal fashion marketplace that connects customers with nearby boutiques and independent fashion stores.

About Apna Fashion Mart:
- We partner with local boutiques across Indian cities to bring hyperlocal fashion to customers' doorsteps.
- Customers can discover verified nearby shops, browse their collections, and order for delivery or pickup.
- We specialise in Indian ethnic wear, contemporary Indo-western fusion, traditional textiles, and accessories.
- Our "Nearby" feature shows boutiques within 10 km of the customer's location.

Products & Shopping:
- Categories include: Kurtas & Suits, Sarees, Lehengas, Anarkalis, Dupattas, Bottoms, Tops & Tunics, Ethnic Sets, Men's Kurtas, Sherwanis, Indo-Western, Accessories, Footwear, Jewellery, and Kids' Wear.
- Products come with size guides. For ethnic wear, sizing varies by boutique — always check the size chart.
- Customers can filter by category, size, price range, rating, and distance.

Delivery & Logistics:
- Standard delivery: 2–5 business days depending on boutique location.
- Express same-day delivery available for shops within 5 km (select cities).
- Free delivery on orders above ₹999.
- Delivery fee: ₹49 for orders below ₹999.
- Cash on Delivery (COD) is available for orders up to ₹5,000.

Returns & Refunds:
- Return window: 7 days from delivery for unused items in original condition with tags.
- Refund is processed within 5–7 business days after the return is picked up.
- Customised or stitched garments cannot be returned unless defective.
- To initiate a return, go to Account → Orders → select order → Request Return.

Payments:
- We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery.
- Razorpay is our secure payment gateway.
- EMI options are available on orders above ₹3,000.

Your role:
- Help users find products, understand sizing, track orders, initiate returns, and answer general questions.
- Always be warm, helpful, and culturally aware. Use simple English; you can sprinkle common Hindi/Hinglish phrases where appropriate.
- Do not fabricate product availability or prices — always refer the user to the app's catalogue.
- If a query requires account-specific information (order status, return status), politely ask them to check Account → Orders in the app, or contact support@apnafashionmart.in.
- Keep responses concise and helpful. Avoid markdown — respond in plain readable text.
''';

  final Dio _dio;

  AiChatbotService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                connectTimeout: const Duration(seconds: 30),
                receiveTimeout: const Duration(seconds: 60),
              ),
            );

  /// Sends a conversation and returns a stream of delta text chunks.
  Stream<String> sendMessage(List<Map<String, dynamic>> messages) async* {
    final controller = StreamController<String>();

    try {
      final response = await _dio.post<ResponseBody>(
        _anthropicBaseUrl,
        data: jsonEncode({
          'model': _model,
          'max_tokens': 1024,
          'stream': true,
          'system': systemPrompt,
          'messages': messages,
        }),
        options: Options(
          headers: {
            'x-api-key': Env.anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          responseType: ResponseType.stream,
        ),
      );

      final stream = (response.data!.stream as Stream<List<int>>)
          .transform(utf8.decoder)
          .transform(const LineSplitter());

      await for (final line in stream) {
        if (line.startsWith('data: ')) {
          final data = line.substring(6).trim();
          if (data == '[DONE]') break;
          try {
            final json = jsonDecode(data) as Map<String, dynamic>;
            if (json['type'] == 'content_block_delta') {
              final delta = json['delta'] as Map<String, dynamic>?;
              if (delta?['type'] == 'text_delta') {
                final text = delta!['text'] as String? ?? '';
                if (text.isNotEmpty) yield text;
              }
            }
          } catch (_) {
            // Malformed SSE line — skip
          }
        }
      }
    } on DioException catch (e) {
      yield 'Sorry, I\'m unable to respond right now. Please try again in a moment. (${e.message})';
    } catch (e) {
      yield 'An unexpected error occurred. Please try again.';
    } finally {
      await controller.close();
    }
  }

  /// Non-streaming convenience method — returns full response as a string.
  Future<String> sendMessageSync(
      List<Map<String, dynamic>> messages) async {
    final buffer = StringBuffer();
    await for (final chunk in sendMessage(messages)) {
      buffer.write(chunk);
    }
    return buffer.toString();
  }
}
