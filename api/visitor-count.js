// Vercel serverless function (Node runtime, zero dependencies — talks to
// Supabase's PostgREST API directly via fetch, same style as
// removal-request.js, rather than adding the supabase-js SDK).
//
// GET  -> just returns the current total (no insert)
// POST -> records one visit (one row in mera_radio_visits), then returns
//         the new total. The client only calls POST once per browser
//         (gated by localStorage — see js/visitor-count.js) so refreshes
//         don't inflate the count; every other page load just GETs it.

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ success: false, error: 'Visitor count is not configured on the server.' });
    return;
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'POST') {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/mera_radio_visits`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({}),
      });
      if (!insertRes.ok) {
        res.status(502).json({ success: false, error: 'Failed to record visit.' });
        return;
      }
    }

    // PostgREST returns the total row count in the Content-Range response
    // header (e.g. "0-0/1234") when asked with Prefer: count=exact.
    const countRes = await fetch(`${supabaseUrl}/rest/v1/mera_radio_visits?select=id&limit=1`, {
      headers: { ...headers, Prefer: 'count=exact' },
    });
    if (!countRes.ok) {
      res.status(502).json({ success: false, error: 'Failed to read visitor count.' });
      return;
    }
    const contentRange = countRes.headers.get('content-range') || '';
    const count = Number(contentRange.split('/')[1]) || 0;

    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch visitor count.' });
  }
};
