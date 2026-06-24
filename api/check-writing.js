export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentText, task, level, criteria } = req.body || {};
  if (!studentText || !task) return res.status(400).json({ error: 'Missing studentText or task' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const targetLevel = level || 'B2';

  const systemPrompt = `Sa oled eesti keele eksami hindaja. Sinu ülesanne on hinnata õpilase kirjalikku tööd taseme ${targetLevel} kriteeriumide järgi.

Hinda järgmisi aspekte ja anna konkreetne, konstruktiivne tagasiside EESTI KEELES:

1. **Ülesande täitmine** — kas kõik nõutud punktid on käsitletud?
2. **Maht** — kas tekst vastab nõutud pikkusele (umbes ${targetLevel === 'B2' ? '140–180' : '100–140'} sõna)?
3. **Struktuur** — kas tekstil on selge ülesehitus (sissejuhatus, põhiosa, kokkuvõte)?
4. **Keelekasutus** — grammatika, sõnavara, lauseehitus taseme ${targetLevel} tasemel
5. **Stiil** — kas stiil vastab tekstiliigile (kiri, arutlus, seletuskiri vms)?

Lõpus anna **kokkuvõttev hinnang** skaalal: Väga hea / Hea / Rahuldav / Vajab parandamist

Ole sõbralik ja motiveeriv. Märgi ka häid kohti, mitte ainult vigu.`;

  const userPrompt = `ÜLESANNE:
${task}

${criteria ? `HINDAMISKRITEERIUMID:\n${criteria}\n\n` : ''}ÕPILASE TEKST:
${studentText}

Anna üksikasjalik tagasiside.`;

  try {
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
      return res.status(502).json({ error: 'Anthropic API error', detail: err });
    }

    const data = await response.json();
    const feedback = data.content?.[0]?.text || '';
    const wordCount = studentText.trim().split(/\s+/).filter(Boolean).length;

    return res.status(200).json({ feedback, wordCount });
  } catch (e) {
    console.error('Handler error:', e);
    return res.status(500).json({ error: 'Internal error', detail: e.message });
  }
}
