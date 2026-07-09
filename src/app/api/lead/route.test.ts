import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const sendMailMock = vi.fn().mockResolvedValue(undefined);

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
  },
}));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/lead", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/lead", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    process.env.GMAIL_USER = "me@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "app-password";
    process.env.LEAD_TO_EMAIL = "garrett.scarlett@axis.com";
  });

  it("drops honeypot submissions without sending mail", async () => {
    const res = await POST(
      makeRequest({ name: "Bot", email: "bot@example.com", website: "http://spam.example" }),
    );
    expect(res.status).toBe(200);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rejects a submission missing a name", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rejects a submission missing both email and phone", async () => {
    const res = await POST(makeRequest({ name: "Jane Doe" }));
    expect(res.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("sends a lead email with a .vcf attachment on a valid submission", async () => {
    const res = await POST(
      makeRequest({ name: "Jane Doe", email: "jane@example.com", eventId: "gpha-annual-meeting" }),
    );
    expect(res.status).toBe(200);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const call = sendMailMock.mock.calls[0][0];
    expect(call.to).toBe("garrett.scarlett@axis.com");
    expect(call.subject).toContain("Jane Doe");
    expect(call.attachments[0].content).toContain("FN:Jane Doe");
  });

  it("still responds ok even if the send fails (no backup layer, §10.4)", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("smtp down"));
    const res = await POST(makeRequest({ name: "Jane Doe", phone: "+15551234567" }));
    expect(res.status).toBe(200);
  });

  it("skips sending when Gmail env vars aren't configured", async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    const res = await POST(makeRequest({ name: "Jane Doe", email: "jane@example.com" }));
    expect(res.status).toBe(200);
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
