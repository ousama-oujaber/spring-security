
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

export const askGemini = async (messages: ChatMessage[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: "You are an expert Spring Boot Security consultant. Provide clear, concise, and code-heavy answers. If a user asks about a specific feature, try to provide a Java snippet. Focus on modern Spring Security 6+ best practices (e.g., Lambda configuration, SecurityFilterChain beans).",
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Unable to connect to the AI assistant. Please check your network or try again later.";
  }
};
