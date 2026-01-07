import { Square, PieceSymbol, Color } from 'chess.js';

export interface GameState {
  fen: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  turn: Color;
  lastMove: { from: Square; to: Square } | null;
  capturedPieces: {
    w: PieceSymbol[];
    b: PieceSymbol[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AIMoveResponse {
  move: string;
  comment: string;
}

export enum Difficulty {
  Novice = 'مبتدئ',
  Scholar = 'حكيم',
  Egyptian = 'مصري'
}