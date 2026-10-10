import { GoogleGenAI } from '@google/genai';

let ai;

export const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not configured on the backend');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }

  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
};
