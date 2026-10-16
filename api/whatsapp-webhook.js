const crypto = require("crypto");

const MAX_BODY_BYTES = 1_000_000;

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
      return res.status(503).type("text/plain").send("Webhook verification is not configured");
    }
    if (mode === "subscribe" && token && token === expectedToken && challenge) {
      return res.status(200).type("text/plain").send(challenge);
    }
    return res.status(403).type("text/plain").send("Webhook verification failed");
  }

  if (req.method === "POST") {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      return res.status(503).json({ ok: false, error: "Webhook signature verification is not configured" });
    }

    try {
      const rawBody = await readRawBody(req);
      const signature = req.headers["x-hub-signature-256"];
      if (!isValidSignature(rawBody, signature, appSecret)) {
        return res.status(401).json({ ok: false, error: "Invalid webhook signature" });
      }

      // This endpoint intentionally does not store message content or personal data.
      // It acknowledges valid Meta events; event-specific processing can be added later.
      return res.status(200).json({ ok: true });
    } catch (error) {
      const status = Number(error?.statusCode) || 400;
      return res.status(status).json({ ok: false, error: status === 413 ? "Payload too large" : "Invalid webhook request" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
