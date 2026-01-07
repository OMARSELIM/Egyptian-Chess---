import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Bot, User, RefreshCw, Trophy, Crown, Scroll, Send } from 'lucide-react';
import Board from './components/Board';
import { Difficulty, ChatMessage, GameState } from './types';
import { getBestMove } from './services/gemini';

// Initialize chess instance
const chess = new Chess();

function App() {
  const [gameState, setGameState] = useState<GameState>({
    fen: chess.fen(),
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    turn: 'w',
    lastMove: null,
    capturedPieces: { w: [], b: [] },
  });

  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Scholar);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: 'أهلاً بك أيها المتحدي. هل تظن أنك تملك الحكمة لهزيمة المصري؟',
      timestamp: Date.now()
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Update Game State Helper
  const updateGameState = useCallback((lastMoveDetails: { from: Square, to: Square } | null = null) => {
    setGameState({
      fen: chess.fen(),
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isDraw: chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition(),
      turn: chess.turn(),
      lastMove: lastMoveDetails,
      capturedPieces: {
        w: [], // TODO: Implement proper capture tracking if needed, simpler to just show count or score
        b: []
      }
    });
  }, []);

  // AI Turn Handling
  useEffect(() => {
    if (gameState.turn === 'b' && !gameState.isCheckmate && !gameState.isDraw) {
      const makeAiMove = async () => {
        setIsAiThinking(true);
        
        // Brief delay for realism
        await new Promise(resolve => setTimeout(resolve, 1000));

        const moves = chess.moves();
        if (moves.length === 0) {
            setIsAiThinking(false);
            return;
        }

        const history = chess.history();
        const response = await getBestMove(chess.fen(), moves, difficulty, history);

        try {
          const moveResult = chess.move(response.move);
          if (moveResult) {
            updateGameState({ from: moveResult.from, to: moveResult.to });
            
            // Add Commentary
            if (response.comment) {
              setChatHistory(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                text: response.comment,
                timestamp: Date.now()
              }]);
            }
          } else {
             // Fallback if AI gave invalid move (rare but possible)
             const randomMove = moves[Math.floor(Math.random() * moves.length)];
             const res = chess.move(randomMove);
             if (res) updateGameState({ from: res.from, to: res.to });
          }
        } catch (e) {
          console.error("Move error", e);
          // Last resort fallback
           const randomMove = moves[Math.floor(Math.random() * moves.length)];
           const res = chess.move(randomMove);
           if (res) updateGameState({ from: res.from, to: res.to });
        }
        
        setIsAiThinking(false);
      };

      makeAiMove();
    }
  }, [gameState.turn, gameState.isCheckmate, gameState.isDraw, difficulty, updateGameState]);


  const handleHumanMove = (from: Square, to: Square): boolean => {
    if (gameState.turn !== 'w' || isAiThinking) return false;

    try {
      const move = chess.move({ from, to, promotion: 'q' }); // Auto promote to queen for simplicity
      if (move) {
        updateGameState({ from, to });
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const resetGame = () => {
    chess.reset();
    setChatHistory([{
      id: Date.now().toString(),
      sender: 'ai',
      text: 'لنبدأ من جديد. النيل يجدد نفسه، وكذلك نحن.',
      timestamp: Date.now()
    }]);
    updateGameState(null);
  };

  // Status Message
  let statusMessage = "دورك (Your Turn)";
  if (gameState.turn === 'b') statusMessage = "المصري يفكر... (The Egyptian is thinking)";
  if (gameState.isCheck) statusMessage = "كش! (Check!)";
  if (gameState.isCheckmate) statusMessage = gameState.turn === 'w' ? "خسرت! (You Lost)" : "فزت! (You Won)";
  if (gameState.isDraw) statusMessage = "تعادل (Draw)";

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="min-h-screen bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4">
        
        {/* Header */}
        <header className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="w-10 h-10 text-[#d4af37]" />
            <h1 className="text-4xl md:text-5xl font-amiri text-[#d4af37] drop-shadow-lg font-bold">
              الشطرنج المصري
            </h1>
            <Crown className="w-10 h-10 text-[#d4af37]" />
          </div>
          <p className="text-gray-300 font-amiri text-lg">Egyptian Chess Challenge</p>
        </header>

        <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Stats & Controls */}
          <div className="order-2 lg:order-1 flex flex-col gap-4 bg-[#1e293b]/90 p-6 rounded-xl border border-[#d4af37]/30 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-[#1e293b]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#f5deb3]">أنت (You)</h3>
                  <span className="text-xs text-green-400">White Pieces</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-6 gap-2">
              <div className="text-2xl font-amiri text-[#d4af37] text-center">{statusMessage}</div>
              {gameState.isCheck && !gameState.isCheckmate && (
                <div className="animate-pulse text-red-500 font-bold">الملك في خطر!</div>
              )}
            </div>

            <div className="space-y-4">
               <div className="flex flex-col gap-2">
                 <label className="text-sm text-gray-400">مستوى الصعوبة (Difficulty)</label>
                 <div className="grid grid-cols-3 gap-2">
                   {Object.values(Difficulty).map((lvl) => (
                     <button
                       key={lvl}
                       onClick={() => setDifficulty(lvl)}
                       className={`py-2 px-1 text-sm rounded border transition-colors font-amiri
                         ${difficulty === lvl 
                           ? 'bg-[#d4af37] text-[#0f172a] border-[#d4af37] font-bold' 
                           : 'bg-transparent text-gray-400 border-gray-600 hover:border-[#d4af37]'}
                       `}
                     >
                       {lvl}
                     </button>
                   ))}
                 </div>
               </div>

               <button 
                 onClick={resetGame}
                 className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-[#b45309] to-[#d4af37] hover:from-[#d4af37] hover:to-[#b45309] text-white font-bold rounded shadow-lg transform active:scale-95 transition-all"
               >
                 <RefreshCw className="w-5 h-5" />
                 لعبة جديدة (New Game)
               </button>
            </div>
          </div>

          {/* Center: The Board */}
          <div className="order-1 lg:order-2 flex flex-col items-center justify-center">
            <Board 
              game={chess} 
              onMove={handleHumanMove} 
              disabled={gameState.turn === 'b' || gameState.isCheckmate} 
              lastMove={gameState.lastMove}
            />
          </div>

          {/* Right Panel: Chat with Egyptian */}
          <div className="order-3 flex flex-col bg-[#1e293b]/90 rounded-xl border border-[#d4af37]/30 shadow-2xl overflow-hidden h-[500px] lg:h-auto">
            <div className="p-4 bg-[#0f172a] border-b border-[#d4af37]/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-black border border-[#d4af37] flex items-center justify-center">
                 <Bot className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#d4af37]">المصري (The Egyptian)</h3>
                <p className="text-xs text-gray-400">Gemini AI</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-lg text-sm font-amiri leading-relaxed shadow-md
                      ${msg.sender === 'user' 
                        ? 'bg-[#d4af37] text-[#0f172a] rounded-tr-none' 
                        : 'bg-[#1e3a8a] text-white rounded-tl-none border border-[#d4af37]/20'}
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                 <div className="flex justify-start">
                   <div className="bg-[#1e3a8a] p-3 rounded-lg rounded-tl-none border border-[#d4af37]/20 flex gap-2 items-center">
                     <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                     <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                     <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                   </div>
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Note: User chat input is disabled to focus on Chess, 
                but we could add it if we wanted full chat. 
                For now, the user communicates via moves. */}
            <div className="p-3 bg-[#0f172a] text-center text-xs text-gray-500 font-amiri border-t border-[#d4af37]/20">
              تحدث مع المصري عبر تحركاتك على الرقعة
              <br/>
              (Speak to the Egyptian through your moves)
            </div>
          </div>

        </main>
        
        <footer className="mt-8 text-gray-400 text-sm flex gap-4">
           <span>Powered by Google Gemini</span>
           <span>•</span>
           <span>Built with React & Chess.js</span>
        </footer>

      </div>
    </div>
  );
}

export default App;