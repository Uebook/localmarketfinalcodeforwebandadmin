import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// Note: In a real production app, ensure the API key is strictly environment variable based 
// and potentially proxied through a backend to avoid client-side exposure if not using restricted keys.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSmartSearchResults = async (query: string, location: string) => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Returning mock data or empty results.");
    return [];
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      User is searching for "${query}" in "${location}".
      Suggest 3 categories or specific service types that match this intent.
      Return a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return [];
  } catch (error) {
    console.error("Error fetching smart suggestions:", error);
    return [];
  }
};

export const getHelpBotResponse = async (userQuery: string) => {
  if (!apiKey) {
    return "I am currently offline (API Key missing). Please contact support via email.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      You are the helpful AI support assistant for 'Local'.
      
      About Local:
      - It connects users with nearby vendors, services, and businesses in India.
      - Users can search for plumbers, electricians, groceries, etc.
      - Vendors (Local+ partners) can register, list products, and manage enquiries.
      - Key features: Location-based search, Local+ Dashboard, Analytics, Chat/Enquiry.
      
      Your Goal:
      - Answer user questions about how to use the app.
      - If asked about "Registration", explain the 3-step Local+ onboarding process (Basic Info, Shop Details, KYC).
      - If asked about "KYC", mention it takes 24-48 hours for approval.
      - Keep answers concise, friendly, and helpful.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm not sure how to help with that. Please try rephrasing.";
  } catch (error) {
    console.error("Chatbot Error:", error);
    return "Sorry, I'm having trouble connecting to the server right now.";
  }
};