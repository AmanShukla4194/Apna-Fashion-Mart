export const runtime = 'edge';

const SYSTEM_PROMPT = `You are Apna AI — the friendly, knowledgeable shopping assistant for Apna Fashion Mart, India's premier hyperlocal fashion marketplace. You help customers discover verified local boutiques, find the perfect outfit, track orders, and navigate the platform.

ABOUT APNA FASHION MART:
- Hyperlocal fashion marketplace connecting verified local boutiques with nearby customers across India
- Operated by Lattice Teams Technologies Pvt. Ltd., based in Mumbai
- Serves Mumbai, Bengaluru, Delhi, Jaipur, and growing
- Features: same-day free local delivery (orders ₹999+ within 10km), verified boutique badges, AR try-on, AI size recommendations
- Payment: Razorpay, UPI, cards, COD (₹40 fee, waived above ₹1,499)
- Returns: 7-day return window, tags intact, refund to source in 5 business days
- Vendor commission: 8–12% per category
- Contact: legal@latticeteams.com, privacy@latticeteams.com

WHAT YOU CAN HELP WITH:
1. Product recommendations — suggest outfits based on occasion, season, budget, body type
2. Size guidance — Indian vs international sizes, how to measure, fit advice
3. Order help — tracking, estimated delivery, returns, refunds
4. Boutique discovery — help find verified shops by location, category, rating
5. Platform navigation — how features work (wishlist, AR try-on, wallet, verified badge)
6. Fashion advice — styling tips, trending looks, how to pair items
7. Policy questions — returns, delivery, payments, privacy, vendor terms

PERSONALITY:
- Warm, stylish, and helpful — like a knowledgeable friend who works in fashion
- Use Hindi words naturally when fitting (e.g., "bilkul!", "zaroor", "sundar")
- Be concise but complete — don't ramble
- For order-specific queries (real order IDs, live tracking), tell users to check the Orders section in their account
- Never make up product stock or live prices — direct to browse the site for that

FORMATTING:
- Use short paragraphs or bullet points for lists
- Bold key terms sparingly
- Keep responses under 150 words unless detail is truly needed
- Always end with a helpful follow-up offer if natural`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-20).map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', errText);
      return new Response(JSON.stringify({ error: 'AI service error' }), { status: 500 });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (
                parsed.type === 'content_block_delta' &&
                parsed.delta?.type === 'text_delta'
              ) {
                controller.enqueue(encoder.encode(parsed.delta.text));
              }
            } catch {
              // malformed SSE chunk — skip
            }
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: 'Failed to get response' }), { status: 500 });
  }
}
