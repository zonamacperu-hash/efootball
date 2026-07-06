export async function onRequestGet(context) {
  try {
    const kv = context.env.EFOOTBALL_KV;
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV database binding EFOOTBALL_KV not found. Please bind EFOOTBALL_KV in Cloudflare dashboard." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const state = await kv.get("state");
    if (!state) {
      // Return empty initial state structure
      return new Response(JSON.stringify({ active: false, players: [], teams: [], fixtures: [], semifinals: null, grandFinal: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(state, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const kv = context.env.EFOOTBALL_KV;
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV database binding EFOOTBALL_KV not found." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify passcode auth in Authorization header
    const authHeader = context.request.headers.get("Authorization");
    if (authHeader !== "admin777") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await context.request.json();
    if (typeof body !== 'object' || body === null || !('active' in body)) {
      return new Response(JSON.stringify({ error: "Invalid state structure" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await kv.put("state", JSON.stringify(body));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
