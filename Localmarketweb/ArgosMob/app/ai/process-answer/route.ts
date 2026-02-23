import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { step, answer, context } = body;

        // context stores previous answers: { intent: '...', details: '...', urgency: '...' }
        const newContext = { ...context, [step]: answer };

        let response = {};

        switch (step) {
            case 'intent':
                // Logic: Decide Q2 based on Q1 (Intent)
                // Simple heuristic for demo:
                if (answer.toLowerCase().includes('food') || answer === 'food') {
                    response = {
                        nextStep: 'details',
                        question: "What kind of food are you craving?",
                        options: [
                            { label: "North Indian", value: "north_indian" },
                            { label: "Fast Food", value: "fast_food" },
                            { label: "Healthy", value: "healthy" }
                        ],
                        inputMetadata: { type: 'selection_or_text' }
                    };
                } else if (answer.toLowerCase().includes('repair') || answer === 'electronics_repair') {
                    response = {
                        nextStep: 'details',
                        question: "Which device needs repair?",
                        options: [
                            { label: "Mobile Phone", value: "mobile" },
                            { label: "Laptop", value: "laptop" },
                            { label: "AC / Appliance", value: "appliance" }
                        ],
                        inputMetadata: { type: 'selection_or_text' }
                    };
                } else {
                    // Default (e.g. Home Services)
                    response = {
                        nextStep: 'details',
                        question: "What kind of work do you need?",
                        options: [
                            { label: "Repair / Fix", value: "repair" },
                            { label: "Installation", value: "installation" },
                            { label: "Cleaning", value: "cleaning" }
                        ],
                        inputMetadata: { type: 'selection_or_text', placeholder: "e.g. Leaking tap" }
                    };
                }
                break;

            case 'details':
                // Q3: Urgency
                response = {
                    nextStep: 'urgency',
                    question: "When do you need this?",
                    options: [
                        { label: "Immediately (Emergency)", value: "emergency" },
                        { label: "Today", value: "today" },
                        { label: "Schedule for Later", value: "schedule" }
                    ],
                    inputMetadata: { type: 'selection' }
                };
                break;

            case 'urgency':
                // Q4: Budget (Optional) -> or go straight to results
                response = {
                    nextStep: 'budget',
                    question: "Do you have a budget range in mind?",
                    options: [
                        { label: "Low (Budget Friendly)", value: "low" },
                        { label: "Medium (Standard)", value: "medium" },
                        { label: "Premium (High Quality)", value: "high" },
                        { label: "No Preference", value: "any" }
                    ],
                    inputMetadata: { type: 'selection' }
                };
                break;

            case 'budget':
                // Flow Complete -> Fetch Results
                response = {
                    nextStep: 'results',
                    message: "finding the best matches for you...",
                    // In a real flow, the client would then call /api/ai/recommendations
                    // But we can also return results here if we want to combine calls.
                    // For now, let's signal the client to fetch results.
                    ready: true
                };
                break;

            default:
                response = { error: "Unknown step" };
        }

        return NextResponse.json({ ...response, updatedContext: newContext });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process answer' },
            { status: 500 }
        );
    }
}
