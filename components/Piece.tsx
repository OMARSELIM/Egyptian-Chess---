import React from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface PieceProps {
  type: PieceSymbol;
  color: Color;
}

const Piece: React.FC<PieceProps> = ({ type, color }) => {
  // Unicode chess pieces
  // We will style them to look "Egyptian" via colors and shadows
  const getSymbol = (t: PieceSymbol) => {
    switch (t) {
      case 'p': return '♟';
      case 'r': return '♜';
      case 'n': return '♞';
      case 'b': return '♝';
      case 'q': return '♛';
      case 'k': return '♚';
      default: return '';
    }
  };

  const symbol = getSymbol(type);

  // Styling logic
  // White pieces = Gold/Sand
  // Black pieces = Lapis/Obsidian
  const isWhite = color === 'w';

  return (
    <div 
      className={`
        w-full h-full flex items-center justify-center 
        select-none text-4xl sm:text-5xl md:text-6xl cursor-pointer
        transform transition-transform hover:scale-110 active:scale-95
        ${isWhite ? 'text-amber-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-slate-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]'}
      `}
      style={{
        filter: isWhite 
          ? 'drop-shadow(0 0 3px #d4af37)' 
          : 'drop-shadow(0 0 2px #000000)'
      }}
    >
      {symbol}
    </div>
  );
};

export default Piece;