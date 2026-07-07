import { checkRateLimit, handleOptions, normalizeAnthropicBody, requireStaff, sendError, setCors } from './_auth.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const { decoded } = await requireStaff(req);
    checkRateLimit(decoded.uid, 25);
    const body = normalizeAnthropicBody(req.body, { maxTokens: 8000 });

    // ── PROMPT CACHING ────────────────────────────────────────
    // Системный промпт кэшируется на 5 минут.
    // 1-й вызов: записывает в кэш (1.25× цена)
    // 2-й+ вызов в течение 5 мин: читает из кэша (0.1× цена) → экономия ~87%
    if (typeof body.system === 'string' && body.system.length > 0) {
      body.system = [
        { type: 'text', text: body.system, cache_control: { type: 'ephemeral' } }
      ];
    } else if (Array.isArray(body.system) && body.system.length > 0) {
      const blocks = [...body.system];
      const last = blocks[blocks.length - 1];
      if (!last.cache_control) {
        blocks[blocks.length - 1] = { ...last, cache_control: { type: 'ephemeral' } };
        body.system = blocks;
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (err) {
      data = { error: { message: response.ok ? 'Invalid provider response' : 'Anthropic API error' } };
    }

    // Логируем стоимость в Vercel Functions → Logs
    if (data.usage) {
      const u = data.usage;
      const fresh   = u.input_tokens || 0;
      const written = u.cache_creation_input_tokens || 0;
      const hit     = u.cache_read_input_tokens || 0;
      const out     = u.output_tokens || 0;
      const cost    = (fresh * 3 + written * 3.75 + hit * 0.3 + out * 15) / 1_000_000;
      console.log(`[proxy] fresh:${fresh} cache_write:${written} cache_hit:${hit} out:${out} | $${cost.toFixed(5)}`);
    }

    return res.status(response.status).json(data);
  } catch (e) {
    return sendError(res, e);
  }
}
