import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// CORS headers helper
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { step, answer, context } = body;

        // context stores previous answers: { intent: '...', details: '...', urgency: '...' }
        const newContext = { ...context, [step]: answer };

        let response = {};

        switch (step) {
            case 'intent':
                // VALIDATION: Check if the intent is service-related
                const intentLower = answer.toLowerCase();

                // List of valid service-related keywords
                const validKeywords = [
                    'plumber', 'electrician', 'carpenter', 'painter', 'cleaning', 'pest', 'control', 'ac', 'appliance', 'repair', 'fix', 'install', 'installation', 'water', 'solar', 'geyser', 'chimney', 'sofa', 'carpet', 'septic', 'tank', 'mason', 'architect', 'interior', 'construction', 'renovation', 'tiles', 'granite', 'marble', 'hardware', 'locks', 'keys', 'windows', 'doors', 'aluminum', 'glass',
                    'doctor', 'clinic', 'hospital', 'pharmacy', 'medical', 'mediacl', 'health', 'medicine', 'medicne', 'diagnostic', 'lab', 'dentist', 'ayurvedic', 'homeopathic', 'physiotherapy', 'nurse', 'ambulance', 'veterinary', 'gym', 'fitness', 'yoga', 'spa', 'salon', 'beauty', 'makeup', 'barber', 'haircut', 'optical', 'blood',
                    'restaurant', 'food', 'cafe', 'bakery', 'catering', 'snacks', 'bar', 'pub', 'dining', 'delivery', 'sweet', 'fruit', 'vegetable', 'meat', 'chicken', 'grocery', 'milk', 'dairy', 'store', 'shop', 'market',
                    'mechanic', 'garage', 'puncture', 'tire', 'car', 'bike', 'wash', 'detailing', 'battery', 'towing', 'spares', 'showroom', 'driving', 'school',
                    'lawyer', 'advocate', 'accountant', 'ca', 'consultant', 'tax', 'notary', 'developer', 'marketing', 'printing', 'security', 'guard', 'placement', 'courier', 'shipping', 'movers', 'packers',
                    'school', 'tuition', 'tutor', 'college', 'training', 'coaching', 'music', 'dance', 'language', 'preschool',
                    'event', 'planner', 'photography', 'photo', 'video', 'decoration', 'florist', 'gift', 'banquet', 'venue', 'dj', 'band',
                    'hotel', 'resort', 'travel', 'agency', 'visa', 'ticket', 'tour', 'rental',
                    'find', 'look', 'need', 'want', 'search', 'hire', 'book', 'urgent', 'emergency', 'asap', 'today', 'tomorrow', 'schedule', 'budget', 'price', 'cost', 'cheap', 'affordable', 'premium', 'near', 'nearby', 'local', 'area', 'location', 'distance', 'service', 'vendor', 'business'
                ];

                const hasValidKeyword = validKeywords.some(keyword => intentLower.includes(keyword));

                if (!hasValidKeyword) {
                    return NextResponse.json({
                        error: 'invalid_query',
                        message: "I'm your Local Market assistant! I can help you find local vendors, services, and products. Please ask about things like home services, food, repairs, or shopping.\n\nWhat would you like to find today?",
                        nextStep: 'intent',
                        question: "What are you looking for today?",
                        options: [
                            { label: "🛒 Shopping & Groceries", value: "grocery" },
                            { label: "🛠️ Home Services", value: "home_services" },
                            { label: "📱 Electronics Repair", value: "electronics_repair" },
                            { label: "🍕 Food & Dining", value: "food" }
                        ]
                    }, { headers: corsHeaders() });
                }

                // Use Gemini to generate contextual next step
                try {
                    const apiKey = process.env.GEMINI_API_KEY || '';
                    const genAI = new GoogleGenerativeAI(apiKey);
                    // Use Gemini 2.0 Flash which is available for this key
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

                    const prompt = `User search: "${answer}"
Goal: Generate the next logical question for a local market app to help find a specific vendor or product.
Also provide 3 relevant suggestion options/buttons.

Return ONLY JSON format:
{
  "question": "The question string",
  "options": [
    {"label": "Button Text 1", "value": "value1"},
    {"label": "Button Text 2", "value": "value2"},
    {"label": "Button Text 3", "value": "value3"}
  ]
}

Ensure the question is friendly and specific to the intent (e.g., if "Snacks", ask about snack types/delivery, not "What kind of work").`;

                    const result = await model.generateContent(prompt);
                    const aiContent = result.response.text();
                    const cleanJson = aiContent.replace(/```json|```/g, '').trim();
                    const parsed = JSON.parse(cleanJson);

                    response = {
                        nextStep: 'details',
                        question: parsed.question,
                        options: parsed.options,
                        inputMetadata: { type: 'selection_or_text' }
                    };
                } catch (aiError) {
                    console.error('AI Flow Error:', aiError);

                    // Fallback to basic logic based on intent
                    if (intentLower.includes('food') || intentLower.includes('craving') || intentLower.includes('hungry')) {
                        response = {
                            nextStep: 'details',
                            question: "What kind of food are you craving?",
                            options: [
                                { label: "🍱 North Indian", value: "north_indian" },
                                { label: "🍔 Fast Food", value: "fast_food" },
                                { label: "🥗 Healthy", value: "healthy" }
                            ],
                            inputMetadata: { type: 'selection_or_text' }
                        };
                    } else if (intentLower.includes('grocery') || intentLower.includes('shopping') || intentLower.includes('milk') || intentLower.includes('fruit')) {
                        response = {
                            nextStep: 'details',
                            question: "What do you need to buy?",
                            options: [
                                { label: "🥛 Daily Dairy", value: "dairy" },
                                { label: "🍎 Fresh Fruits", value: "fruits" },
                                { label: "📦 Monthly Grocery", value: "monthly_grocery" }
                            ],
                            inputMetadata: { type: 'selection_or_text' }
                        };
                    } else if (intentLower.includes('repair') || intentLower.includes('fix') || intentLower.includes('broken')) {
                        response = {
                            nextStep: 'details',
                            question: "What needs to be fixed?",
                            options: [
                                { label: "🔧 Plumbing", value: "plumbing" },
                                { label: "⚡ Electrical", value: "electrical" },
                                { label: "🛠️ Appliance Repair", value: "appliance" }
                            ],
                            inputMetadata: { type: 'selection_or_text' }
                        };
                    } else {
                        // General fallback
                        response = {
                            nextStep: 'details',
                            question: "Can you provide more details about what you're looking for?",
                            options: [
                                { label: "Daily Needs", value: "daily" },
                                { label: "Emergency", value: "emergency" },
                                { label: "Professional", value: "professional" }
                            ],
                            inputMetadata: { type: 'selection_or_text' }
                        };
                    }
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
                    message: "Finding the best matches for you...",
                    ready: true
                };
                break;

            default:
                response = { error: "Unknown step" };
        }

        return NextResponse.json({ ...response, updatedContext: newContext }, { headers: corsHeaders() });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process answer' },
            { status: 500, headers: corsHeaders() }
        );
    }
}
