const crypto = require("crypto");

const MAX_BODY_BYTES = 1_000_000;

function sendText(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.end(message);
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(payload));
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function isValidSignature(rawBody, signature, appSecret) {
  if (!signature || !signature.startsWith("sha256=") || !appSecret) return false;
  const suppliedHex = signature.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest();
  const supplied = Buffer.from(suppliedHex, "hex");
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const mode = String(req.query?.["hub.mode"] || "");
    const token = String(req.query?.["hub.verify_token"] || "");
    const challenge = String(req.query?.["hub.challenge"] || "");
    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (!expectedToken) {
      return sendText(res, 503, "Webhook verification is not configured");
    }
    if (mode === "subscribe" && token && token === expectedToken && challenge) {
      return sendText(res, 200, challenge);
    }
    return sendText(res, 403, "Webhook verification failed");
  }

  if (req.method === "POST") {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      return sendJson(res, 503, { ok: false, error: "Webhook signature verification is not configured" });
    }

    try {
      const rawBody = await readRawBody(req);
      const signature = req.headers["x-hub-signature-256"];
      if (!isValidSignature(rawBody, signature, appSecret)) {
        return sendJson(res, 401, { ok: false, error: "Invalid webhook signature" });
      }

      // This endpoint intentionally does not store message content or personal data.
      // It acknowledges valid Meta events; event-specific processing can be added later.
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      const status = Number(error?.statusCode) || 400;
      return sendJson(res, status, { ok: false, error: status === 413 ? "Payload too large" : "Invalid webhook request" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return sendJson(res, 405, { ok: false, error: "Method not allowed" });
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
