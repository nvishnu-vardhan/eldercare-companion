
import { GoogleGenAI } from "@google/genai";
import { PARENT_SYSTEM_INSTRUCTION, CHILD_SYSTEM_INSTRUCTION } from "../constants";
import { UserRole, Media } from "../types";

export const generateElderResponse = async (
  prompt: string, 
  role: UserRole, 
  history: { role: string; content: string; media?: Media }[]
) => {
  // Always use a named parameter and direct process.env.API_KEY access as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = role === UserRole.PARENT 
    ? PARENT_SYSTEM_INSTRUCTION 
    : CHILD_SYSTEM_INSTRUCTION;

  // Manual history formatting for the generateContent call
  const contents = history.map(h => {
    const parts: any[] = [{ text: h.content }];
    if (h.media) {
      parts.push({
        inlineData: {
          data: h.media.data,
          mimeType: h.media.mimeType
        }
      });
    }
    return {
      role: h.role === 'assistant' ? 'model' : 'user',
      parts
    };
  });
  
  // Add the current user prompt if not already in history
  if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Access .text property directly as per guidelines
    return response.text || "I'm sorry, I'm having trouble connecting right now. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Could not reach ElderCare. Please check your internet connection.";
  }
};
