import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/db";

// Business rules mapping for the hackathon
const BUSINESS_RULES = {
  "email_delivery": {
    process: "Customer Onboarding / OTP Delivery",
    impactPerFailure: "1 user blocked from platform",
    financialValue: "₦25,000 LTV per user"
  },
  "payment_processing": {
    process: "Transaction Processing",
    impactPerFailure: "Delayed transaction confirmation",
    financialValue: "₦50,000 average transaction size"
  },
  "image_processing": {
    process: "Medical Scan Analysis",
    impactPerFailure: "Delayed diagnosis",
    financialValue: "High patient risk"
  }
};

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set in environment variables." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Get all failed events from the last window (we'll just take all fails in our mock db)
    const allEvents = db.getEvents();
    const failures = allEvents.filter(e => e.status === 'failed');

    if (failures.length === 0) {
      return NextResponse.json({ message: "No failures detected. System is healthy.", incidents: [] });
    }

    // Group failures by queue
    const groupedFailures = failures.reduce((acc, event) => {
      if (!acc[event.queue_name]) acc[event.queue_name] = [];
      acc[event.queue_name].push(event);
      return acc;
    }, {} as Record<string, typeof failures>);

    // Construct the prompt for Gemini
    const prompt = `
You are QueueWatch AI, an operational intelligence assistant.
Analyze the following technical queue failures and translate them into a business impact report.

Business Mapping Rules:
${JSON.stringify(BUSINESS_RULES, null, 2)}

Current Failures:
${JSON.stringify(groupedFailures, null, 2)}

Respond ONLY with a valid JSON array of incident objects. Do not include markdown code blocks like \`\`\`json.
Each incident object must have the following schema:
{
  "title": "Short descriptive title of the incident",
  "severity": "High" | "Medium" | "Low",
  "impact": "A sentence explaining the exact business impact and financial loss based on the rules.",
  "cause": "A sentence explaining the technical cause from the errors.",
  "action": "A single recommended action for the engineering team to fix it."
}
`;

    // Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const incidents = JSON.parse(response.text);

    return NextResponse.json({ success: true, incidents });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
