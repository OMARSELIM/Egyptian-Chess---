import React, { useState } from 'react';
import { Chess, Square, Move } from 'chess.js';
import Piece from './Piece';

interface BoardProps {
  game: Chess;
  onMove: (from: Square, to: Square) => boolean;
  disabled: boolean;
  lastMove: { from: Square; to: Square } | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const Board: React.FC<BoardProps> = ({ game, onMove, disabled, lastMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

  const board = game.board();

  const getLegalMovesForSquare = (square: Square) => {
    const moves = game.moves({ square, verbose: true }) as Move[];
    return moves.map(m => m.to);
  };

  const handleSquareClick = (square: Square) => {
    if (disabled) return;

    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Attempt to move
    if (selectedSquare) {
      const success = onMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }

    // Select new piece
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setPossibleMoves(getLegalMovesForSquare(square));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  return (
    <div className="relative p-2 bg-[#2d1b0e] rounded-lg shadow-2xl border-4 border-[#d4af37]">
        {/* Decorative Egyptian Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#d4af37] -mt-1 -ml-1"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#d4af37] -mt-1 -mr-1"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#d4af37] -mb-1 -ml-1"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#d4af37] -mb-1 -mr-1"></div>

      <div className="grid grid-cols-8 grid-rows-8 w-full max-w-[600px] aspect-square mx-auto border-2 border-[#8B4513]">
        {RANKS.map((rank, rankIndex) => (
          FILES.map((file, fileIndex) => {
            const square = `${file}${rank}` as Square;
            const isDark = (rankIndex + fileIndex) % 2 === 1;
            const piece = game.get(square);
            const isSelected = selectedSquare === square;
            const isPossibleMove = possibleMoves.includes(square);
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

            // Theme Colors
            // Light squares: Sand/Papyrus
            // Dark squares: Lapis Lazuli / Dark Blue Stone
            const baseColor = isDark ? 'bg-[#1e3a8a]' : 'bg-[#f5deb3]';
            const highlightColor = isSelected ? 'bg-amber-500/80 ring-inset ring-4 ring-amber-300' : '';
            const lastMoveColor = isLastMove ? 'bg-emerald-500/40' : '';
            const moveIndicator = isPossibleMove && !piece 
                ? 'after:content-[""] after:w-3 after:h-3 after:bg-green-600/50 after:rounded-full after:absolute' 
                : '';
            const captureIndicator = isPossibleMove && piece
                ? 'ring-inset ring-4 ring-red-500/50'
                : '';

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`
                  relative flex items-center justify-center
                  ${baseColor}
                  ${highlightColor}
                  ${lastMoveColor}
                  ${moveIndicator}
                  ${captureIndicator}
                  transition-colors duration-200
                `}
              >
                {/* Coordinates */}
                {file === 'a' && (
                  <span className={`absolute top-0.5 left-0.5 text-[10px] ${isDark ? 'text-[#f5deb3]' : 'text-[#1e3a8a]'}`}>
                    {rank}
                  </span>
                )}
                {rank === '1' && (
                  <span className={`absolute bottom-0 right-0.5 text-[10px] ${isDark ? 'text-[#f5deb3]' : 'text-[#1e3a8a]'}`}>
                    {file}
                  </span>
                )}
                
                {piece && (
                  <Piece type={piece.type} color={piece.color} />
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default Board;