import { checkRateLimit, handleOptions, requireFirebaseUser, sendError, setCors } from './_auth.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentText, task, level, criteria } = req.body || {};
  if (!studentText || !task) return res.status(400).json({ error: 'Missing studentText or task' });
  if (String(studentText).length > 12000 || String(task).length > 4000) {
    return res.status(413).json({ error: 'Submitted text is too large' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const targetLevel = level || 'B2';

  const systemPrompt = `Sa oled eesti keele eksami hindaja. Hinda õpilase teksti taseme ${targetLevel} järgi ja anna tagasiside TÄPSELT selles formaadis. Ära lisa midagi muud peale selle formaadi.

HINDED:
Ülesande täitmine: X/5
Maht: X/5
Struktuur: X/5
Keelekasutus: X/5
Stiil: X/5
KOKKU: X/25

VEAD:
(Kirjuta iga viga eraldi real. Kasuta täpselt seda formaati:)
❌ [vale tekstikatke originaalist] → ✅ [õige variant] — [lühike selgitus]
(Kui vigu pole, kirjuta ainult: Vigu ei leitud.)

TUGEVUSED:
(2-3 lühikest plusspunkti, iga punkt uuel real)

KOKKUVÕTE:
(1 lause üldhinnangu ja peamise soovitusega)`;

  const userPrompt = `ÜLESANNE:
${task}

${criteria ? `HINDAMISKRITEERIUMID:\n${criteria}\n\n` : ''}ÕPILASE TEKST:
${studentText}`;

  try {
    const decoded = await requireFirebaseUser(req);
    checkRateLimit(decoded.uid, 20);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'Anthropic API error' });
    }

    const data = await response.json();
    const feedback = data.content?.[0]?.text || '';
    const wordCount = studentText.trim().split(/\s+/).filter(Boolean).length;

    return res.status(200).json({ feedback, wordCount });
  } catch (e) {
    console.error('Handler error:', e);
    return sendError(res, e);
  }
}
