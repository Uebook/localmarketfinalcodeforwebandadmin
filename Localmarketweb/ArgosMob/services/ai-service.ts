import { GoogleGenerativeAI } from '@google/genai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt to restrict AI to app-related questions only
const SYSTEM_PROMPT = `You are an AI assistant for LocalMarket, a mobile app that helps users find local services, vendors, and businesses nearby.

YOUR ROLE:
- Help users find local services (plumbers, electricians, restaurants, repair shops, etc.)
- Ask relevant questions to understand their needs (service type, urgency, budget, location)
- Provide helpful recommendations based on their requirements
- Keep conversations focused on finding local services

STRICT RULES:
1. ONLY respond to questions about finding local services, vendors, or businesses
2. If a user asks about anything else (weather, news, jokes, general knowledge, etc.), politely redirect them: "I'm here to help you find local services and vendors. What service are you looking for today?"
3. Keep responses concise and conversational (2-3 sentences max)
4. Always guide the conversation toward gathering: service type, work details, timing/urgency, and budget
5. Be friendly but stay on topic

CONVERSATION FLOW:
1. Understand what service they need
2. Ask about specific work details
3. Determine urgency/timing
4. Understand budget preferences
5. Provide recommendations

Remember: You are NOT a general-purpose chatbot. You are a specialized assistant for finding local services only.`;

// Service-related keywords for pre-filtering
const SERVICE_KEYWORDS = [
    'plumber', 'electrician', 'carpenter', 'painter', 'cleaning', 'pest', 'control', 'ac', 'appliance', 'repair', 'fix', 'install', 'installation', 'water', 'solar', 'geyser', 'chimney', 'sofa', 'carpet', 'septic', 'tank', 'mason', 'architect', 'interior', 'construction', 'renovation', 'tiles', 'granite', 'marble', 'hardware', 'locks', 'keys', 'windows', 'doors', 'aluminum', 'glass',
    'doctor', 'clinic', 'hospital', 'pharmacy', 'medical', 'health', 'medicine', 'diagnostic', 'lab', 'dentist', 'ayurvedic', 'homeopathic', 'physiotherapy', 'nurse', 'ambulance', 'veterinary', 'gym', 'fitness', 'yoga', 'spa', 'salon', 'beauty', 'makeup', 'barber', 'haircut', 'optical', 'blood',
    'restaurant', 'food', 'cafe', 'bakery', 'catering', 'snacks', 'bar', 'pub', 'dining', 'delivery', 'sweet', 'fruit', 'vegetable', 'meat', 'chicken', 'grocery', 'milk', 'dairy', 'store', 'shop', 'market',
    'mechanic', 'garage', 'puncture', 'tire', 'car', 'bike', 'wash', 'detailing', 'battery', 'towing', 'spares', 'showroom', 'driving', 'school',
    'lawyer', 'advocate', 'accountant', 'ca', 'consultant', 'tax', 'notary', 'developer', 'marketing', 'printing', 'security', 'guard', 'placement', 'courier', 'shipping', 'movers', 'packers',
    'school', 'tuition', 'tutor', 'college', 'training', 'coaching', 'music', 'dance', 'language', 'preschool',
    'event', 'planner', 'photography', 'photo', 'video', 'decoration', 'florist', 'gift', 'banquet', 'venue', 'dj', 'band',
    'hotel', 'resort', 'travel', 'agency', 'visa', 'ticket', 'tour', 'rental',
    'find', 'look', 'need', 'want', 'search', 'hire', 'book', 'urgent', 'emergency', 'asap', 'today', 'tomorrow', 'schedule', 'budget', 'price', 'cost', 'cheap', 'affordable', 'premium', 'near', 'nearby', 'local', 'area', 'location', 'distance', 'service', 'vendor', 'business'
];

/**
 * Check if user input is likely app-related using keyword matching
 */
export function isLikelyAppRelated(userInput: string): boolean {
    const lowerInput = userInput.toLowerCase();
    return SERVICE_KEYWORDS.some(keyword => lowerInput.includes(keyword));
}

/**
 * Use Gemini AI to classify if a question is app-related
 */
export async function classifyQuestion(userInput: string): Promise<{ isAppRelated: boolean; confidence: number }> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });


        const prompt = `Is this question related to finding local services, vendors, or businesses? Answer with just "YES" or "NO" and a confidence score (0-100).

Question: "${userInput}"

Format your response as: YES/NO|confidence
Example: YES|95 or NO|80`;

        const result = await model.generateContent(prompt);
        const response = result.response.text().trim();

        const [answer, confidenceStr] = response.split('|');
        const isAppRelated = answer.toUpperCase().includes('YES');
        const confidence = parseInt(confidenceStr) || 50;

        return { isAppRelated, confidence };
    } catch (error) {
        console.error('Error classifying question:', error);
        // Fallback to keyword matching
        return { isAppRelated: isLikelyAppRelated(userInput), confidence: 50 };
    }
}

/**
 * Generate AI response with conversation context
 */
export async function generateAIResponse(
    userInput: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    context: any = {}
): Promise<string> {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Build conversation history
        const messages = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'Understood. I will only help users find local services and vendors, and politely redirect any off-topic questions.' }] },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            { role: 'user', parts: [{ text: userInput }] }
        ];

        const chat = model.startChat({
            history: messages.slice(0, -1),
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(userInput);
        const response = result.response.text();

        return response.trim();
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw error;
    }
}

/**
 * Extract structured information from user response
 */
export async function extractInformation(
    userInput: string,
    questionType: 'service_type' | 'work_details' | 'timing' | 'budget'
): Promise<any> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let prompt = '';
        switch (questionType) {
            case 'service_type':
                prompt = `Extract the service type from this user input. Return a JSON object with: { "serviceType": "category", "details": "specific service" }

User input: "${userInput}"

Examples:
- "I need a plumber" -> { "serviceType": "home_services", "details": "plumbing" }
- "Looking for a restaurant" -> { "serviceType": "food", "details": "dining" }
- "Laptop repair" -> { "serviceType": "electronics_repair", "details": "laptop" }`;
                break;

            case 'work_details':
                prompt = `Extract work details from this user input. Return a JSON object with: { "workType": "type", "description": "details" }

User input: "${userInput}"`;
                break;

            case 'timing':
                prompt = `Extract timing/urgency from this user input. Return a JSON object with: { "urgency": "emergency|today|schedule", "preferredDate": "date if mentioned" }

User input: "${userInput}"`;
                break;

            case 'budget':
                prompt = `Extract budget information from this user input. Return a JSON object with: { "budgetRange": "low|medium|high|flexible", "amount": "number if mentioned" }

User input: "${userInput}"`;
                break;
        }

        const result = await model.generateContent(prompt);
        const response = result.response.text().trim();

        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { raw: userInput };
    } catch (error) {
        console.error('Error extracting information:', error);
        return { raw: userInput };
    }
}

/**
 * Generate personalized vendor recommendations explanation
 */
export async function generateRecommendationExplanation(
    vendor: any,
    userContext: any
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `Generate a brief (1 sentence) explanation for why this vendor matches the user's needs.

Vendor: ${vendor.name} - ${vendor.service}
Rating: ${vendor.rating}
Distance: ${vendor.distance}
Price: ${vendor.price}

User needs:
- Service: ${userContext.intent || 'service'}
- Details: ${userContext.details || 'N/A'}
- Urgency: ${userContext.urgency || 'N/A'}
- Budget: ${userContext.budget || 'N/A'}

Keep it concise and highlight the best match factor.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Error generating explanation:', error);
        return 'Good match for your requirements.';
    }
}

export default {
    isLikelyAppRelated,
    classifyQuestion,
    generateAIResponse,
    extractInformation,
    generateRecommendationExplanation
};
