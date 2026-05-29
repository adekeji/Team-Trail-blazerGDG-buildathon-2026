import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queue_name, status, metadata } = body;

    if (!queue_name || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = db.addEvent({
      queue_name,
      status,
      metadata,
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  // Returns all events for the dashboard
  return NextResponse.json({ events: db.getEvents() });
}
