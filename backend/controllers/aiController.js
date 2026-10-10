import { getGeminiClient } from '../config/gemini.js';

export const analyzeDoubt = async (req, res) => {
  const { doubt } = req.body;
  if (!doubt) return res.status(400).json({ message: 'Doubt description is required' });

  try {
    const ai = getGeminiClient();
    const prompt = `Analyze this student doubt: "${doubt}".
Provide a response in strict JSON format with keys:
- "subject": main subject (e.g. Physics, Mathematics, Computer Science)
- "topic": specific topic (e.g. Integration, Recursion, Quantum Mechanics)
- "difficulty": Easy, Medium, or Hard
- "initialExplanation": short concise direct answer explaining the core concept (3-4 sentences)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (err) {
    if (err.code === 'AI_NOT_CONFIGURED') return res.status(503).json({ message: 'AI is not configured. Add GEMINI_API_KEY to the backend deployment environment.' });
    res.status(500).json({ message: 'AI processing error', error: err.message });
  }
};
