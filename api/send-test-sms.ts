// 📍 Ruta: api/send-test-sms.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";

type RequestBody = {
  to?: string;
};

function getRequestBody(req: VercelRequest): RequestBody {
  if (!req.body) return {};

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body) as RequestBody;
    } catch {
      return {};
    }
  }

  return req.body as RequestBody;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const body = getRequestBody(req);
    const to =
      req.method === "GET"
        ? String(req.query.to || "").trim()
        : body.to?.trim();

    if (!to) {
      return res.status(400).json({
        success: false,
        error: "Missing phone number",
      });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return res.status(500).json({
        success: false,
        error: "Missing Twilio environment variables",
        missing: {
          TWILIO_ACCOUNT_SID: !accountSid,
          TWILIO_AUTH_TOKEN: !authToken,
          TWILIO_PHONE_NUMBER: !fromNumber,
        },
      });
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      from: fromNumber,
      to,
      body:
        "Velasquez Food Truck 🔥\n\n" +
        "Your order #123 is now being prepared.\n" +
        "Tu orden #123 ya está en preparación.\n\n" +
        "Track / Rastrear:\n" +
        "https://www.velasquezfoodtruck.com/mi-pedido?order=123",
    });

    return res.status(200).json({
      success: true,
      sid: message.sid,
    });
  } catch (error) {
    console.error("Twilio SMS error:", error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Could not send SMS",
    });
  }
}
