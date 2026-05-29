# QueueWatch AI

QueueWatch AI is an AI-powered operational intelligence platform that monitors background workflows and translates technical failures into clear business impact. Built for modern engineering teams and founders, it bridges the gap between raw queue metrics and actual business revenue.

## Problem
Modern businesses rely on background workflows (email delivery, payments, customer onboarding). When these fail, current tools only show technical metrics (e.g., `Failed jobs`, `Queue backlogs`). Non-technical stakeholders struggle to understand the business impact, and engineers spend hours investigating.

## Solution
Instead of telling teams: *"Email worker crashed"*, QueueWatch AI explains: *"2,347 users are unable to complete onboarding because OTP emails are not being delivered. Estimated impact: ₦12.5 million."*

## Tech Stack
*   **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons
*   **Backend:** Next.js API Routes (Node.js/TypeScript)
*   **AI Engine:** Google Gemini 2.5 Flash
*   **Data Storage:** In-Memory Singleton DB (Hackathon MVP)

## Hackathon Demo Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env.local` file in the root directory and add your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:3000` (or 3001 if 3000 is occupied).*

4. **Simulate an Incident**
   - Open the dashboard in your browser.
   - You will see the system is "Healthy".
   - Click the **"Simulate Incident"** button. This will trigger the backend SDK to pump 50 failed "email_delivery" jobs and 5 failed "image_processing" jobs into the datastore.
   - The dashboard will automatically fetch the latest data and use Gemini AI to translate the raw technical JSON errors into actionable business impact alerts.

## Project Structure
- `src/app/page.tsx`: The main real-time dashboard UI.
- `src/app/api/analyze/route.ts`: The Gemini AI integration that maps technical errors to business rules.
- `src/app/api/simulate/route.ts`: The traffic simulation engine.
- `src/lib/sdk.ts`: The lightweight QueueWatch SDK for client applications.
- `src/lib/db.ts`: In-memory data store.
