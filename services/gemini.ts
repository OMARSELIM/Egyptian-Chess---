import { GoogleGenAI, Type } from "@google/genai";
import { AIMoveResponse, Difficulty } from "../types";

const API_KEY = process.env.API_KEY || '';

// Fallback if no key is provided, though the app assumes it exists.
if (!API_KEY) {
  console.warn("Gemini API Key is missing!");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
You are a wise Ancient Egyptian Grandmaster, playing a game of chess against a challenger. 
You speak Arabic. Your tone is regal, ancient, wise, and slightly intimidating, but fair.
You are playing the BLACK pieces.
Your goal is to choose the best chess move from the provided list of legal moves based on the current board state (FEN) and the difficulty level.

Response Format:
You must return a JSON object with two fields:
1. "move": The SAN (Standard Algebraic Notation) string of the move you chose (e.g., "Nf6", "e5", "O-O").
2. "comment": A short, one-sentence commentary in Arabic about your move or the current state of the game. Use Egyptian metaphors (Nile, Pyramids, Ra, Anubis, Desert, etc.).

Difficulty Guidance:
- Novice (مبتدئ): Make decent moves but overlook complex traps. Be encouraging.
- Scholar (حكيم): Play solidly. Comment on strategy.
- Egyptian (مصري): Play ruthless, best-possible moves. Be arrogant and show your dominance.
`;

export const getBestMove = async (
  fen: string,
  legalMoves: string[],
  difficulty: Difficulty,
  moveHistory: string[]
): Promise<AIMoveResponse> => {
  try {
    const modelId = "gemini-3-flash-preview"; 
    
    // Construct the prompt
    const prompt = `
      Current Game State (FEN): ${fen}
      Difficulty Level: ${difficulty}
      Recent Move History: ${moveHistory.slice(-5).join(', ')}
      
      List of Legal Moves for Black:
      ${JSON.stringify(legalMoves)}
      
      Please select one move from the "Legal Moves" list. 
      If the list is empty, the game is over.
      
      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.STRING, description: "The chosen chess move in SAN format." },
            comment: { type: Type.STRING, description: "A brief comment in Arabic." }
          },
          required: ["move", "comment"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");

    const result = JSON.parse(jsonText) as AIMoveResponse;
    
    // Validate that the returned move is actually in the legal moves list to prevent hallucinations
    // Note: Gemini might normalize SAN (e.g. "Nf3" vs "Nf3+"). We do a loose check or trust chess.js to validate later.
    // For safety, we just return it. The UI handles invalid moves by trying again or picking random.
    return result;

  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback behavior if API fails
    return {
      move: legalMoves[Math.floor(Math.random() * legalMoves.length)] || "",
      comment: "لقد شتتت الآلهة انتباهي... سأتحرك بصمت." // "The gods distracted me... I move in silence."
    };
  }
};