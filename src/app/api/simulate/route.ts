import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // 1. Simulate normal traffic
    for (let i = 0; i < 50; i++) {
      db.addEvent({ queue_name: "email_delivery", status: "completed", metadata: { user_id: 1000 + i } });
    }
    for (let i = 0; i < 10; i++) {
      db.addEvent({ queue_name: "payment_processing", status: "completed", metadata: { amount: 5000, currency: "NGN" } });
    }

    // 2. Simulate an incident (Email worker crash)
    for (let i = 0; i < 30; i++) {
      db.addEvent({ queue_name: "email_delivery", status: "failed", metadata: { error: "ConnectionTimeout: SMTP server unreachable", user_id: 2000 + i, attempt: 3 } });
    }

    // 3. Simulate another minor incident
    for (let i = 0; i < 5; i++) {
      db.addEvent({ queue_name: "image_processing", status: "failed", metadata: { error: "OutOfMemoryError", file_size_mb: 15 } });
    }

    return NextResponse.json({ success: true, message: "Simulation traffic generated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to simulate traffic" }, { status: 500 });
  }
}
