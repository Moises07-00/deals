import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWelcomeMessage = async (userName: string, contactName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, friendly, and casual welcome message (in Spanish) that ${userName} is sending to ${contactName} to invite them to chat on a new app. Do not use quotes. Maximum 20 words.`,
    });
    return response.text || `¡Hola ${contactName}! He empezado a usar esta app, ¡hablemos por aquí!`;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `¡Hola ${contactName}! ¡Hablemos por aquí!`;
  }
};
