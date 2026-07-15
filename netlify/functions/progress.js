const { getStore } = require("@netlify/blobs");

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  const store = getStore({ name: "rfid-progress", consistency: "strong" });

  if (event.httpMethod === "GET") {
    let data = null;
    try {
      data = await store.get("state", { type: "json" });
    } catch (e) {
      data = null;
    }
    return {
      statusCode: 200,
      headers: { "content-type": "application/json", ...CORS },
      body: JSON.stringify(data || null),
    };
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json", ...CORS },
        body: JSON.stringify({ error: "invalid json" }),
      };
    }
    if (!body || typeof body !== "object" || !body.tagged) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json", ...CORS },
        body: JSON.stringify({ error: "invalid payload" }),
      };
    }
    body.updatedAt = new Date().toISOString();
    await store.setJSON("state", body);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json", ...CORS },
      body: JSON.stringify({ ok: true, updatedAt: body.updatedAt }),
    };
  }

  return { statusCode: 405, headers: CORS, body: "Method not allowed" };
};
