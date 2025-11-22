'use client';

/**
 * Controls component
 * Bet adjustment, Deal, and Draw buttons
 */

import { motion } from 'framer-motion';
import ResultMessage from './ResultMessage';
import type { HandEvaluation } from '@/lib/types';
import { playBetSound } from '@/lib/sounds';

interface ControlsProps {
  bet: number;
  balance: number;
  phase: 'BETTING' | 'DEALT' | 'DRAWN';
  onBetChange: (bet: number) => void;
  onDeal: () => void;
  onDraw: () => void;
  isProcessing: boolean;
  lastResult: HandEvaluation | null;
}

export default function Controls({
  bet,
  balance,
  phase,
  onBetChange,
  onDeal,
  onDraw,
  isProcessing,
  lastResult,
}: ControlsProps) {
  const canIncreaseBet = bet < 5 && bet < balance;
  const canDecreaseBet = bet > 1;
  // Allow dealing in both BETTING phase (initial) and DRAWN phase (deal again)
  const canDeal = (phase === 'BETTING' || phase === 'DRAWN') && balance >= bet && !isProcessing;
  const canDraw = phase === 'DEALT' && !isProcessing;

  return (
    <motion.div
      className="bg-poker-green-dark/50 rounded-lg border-2 border-poker-gold/40 p-4 backdrop-blur-sm shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Bet Controls with Deal Button - Show during BETTING and DRAWN phases */}
        {(phase === 'BETTING' || phase === 'DRAWN') && (
          <motion.div
            className="flex items-center gap-6 w-full justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Result Message on the left */}
            {phase === 'DRAWN' && (
              <div className="flex-shrink-0">
                <ResultMessage result={lastResult} />
              </div>
            )}

            {/* Spacer when no result */}
            {phase === 'BETTING' && <div className="flex-1" />}

            {/* Deal/Deal Again button in the middle */}
            <motion.button
              onClick={onDeal}
              disabled={!canDeal}
              className={`
                px-12 py-3 rounded-xl font-bold text-xl uppercase tracking-wider
                transition-all duration-200 border-3 min-w-[180px]
                ${canDeal
                  ? 'bg-gradient-to-b from-poker-gold via-poker-gold to-poker-gold-dark border-poker-gold-dark text-poker-green-dark shadow-xl hover:shadow-2xl transform hover:scale-105'
                  : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
              style={{
                textShadow: canDeal ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none',
              }}
              initial={phase === 'DRAWN' ? { scale: 0 } : {}}
              animate={{ scale: 1 }}
              transition={phase === 'DRAWN' ? { type: 'spring', stiffness: 300, delay: 0.3 } : {}}
              whileHover={canDeal ? { scale: 1.05 } : {}}
              whileTap={canDeal ? { scale: 0.95 } : {}}
            >
              {isProcessing ? 'DEALING...' : phase === 'DRAWN' ? 'DEAL AGAIN' : 'DEAL'}
            </motion.button>

            {/* Spacer to balance layout */}
            <div className="flex-1" />

            {/* Bet controls on the right */}
            <div className="flex items-center gap-3 flex-shrink-0 pr-8">
              <motion.button
                onClick={() => {
                  if (canDecreaseBet) playBetSound();
                  onBetChange(bet - 1);
                }}
                disabled={!canDecreaseBet}
                className={`
                  relative w-9 h-9 rounded-full font-black text-xl
                  transition-all duration-200 border-3
                  ${canDecreaseBet
                    ? 'bg-gradient-to-br from-poker-gold via-yellow-500 to-poker-gold-dark border-poker-gold-dark text-poker-green-dark shadow-lg hover:shadow-xl hover:from-yellow-400 hover:via-poker-gold hover:to-yellow-600'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-800 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={canDecreaseBet ? { scale: 1.1, rotate: -10 } : {}}
                whileTap={canDecreaseBet ? { scale: 0.9 } : {}}
              >
                <span className="absolute inset-0 flex items-center justify-center">−</span>
              </motion.button>

              <div className="flex flex-col items-center min-w-20 bg-gradient-to-b from-poker-green-dark/90 to-poker-green-dark/70 rounded-lg p-2 border-2 border-poker-gold/50 shadow-lg">
                <span className="text-[10px] text-poker-gold/70 uppercase tracking-wider font-bold">Bet</span>
                <motion.span
                  key={bet}
                  className="text-2xl font-black text-poker-gold drop-shadow-lg"
                  initial={{ scale: 1.3, color: '#FFD700' }}
                  animate={{ scale: 1, color: '#FFD700' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                >
                  {bet}
                </motion.span>
                <span className="text-[9px] text-gray-400 mt-0.5">credits</span>
              </div>

              <motion.button
                onClick={() => {
                  if (canIncreaseBet) playBetSound();
                  onBetChange(bet + 1);
                }}
                disabled={!canIncreaseBet}
                className={`
                  relative w-9 h-9 rounded-full font-black text-xl
                  transition-all duration-200 border-3
                  ${canIncreaseBet
                    ? 'bg-gradient-to-br from-poker-gold via-yellow-500 to-poker-gold-dark border-poker-gold-dark text-poker-green-dark shadow-lg hover:shadow-xl hover:from-yellow-400 hover:via-poker-gold hover:to-yellow-600'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-800 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={canIncreaseBet ? { scale: 1.1, rotate: 10 } : {}}
                whileTap={canIncreaseBet ? { scale: 0.9 } : {}}
              >
                <span className="absolute inset-0 flex items-center justify-center">+</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Draw Button - Only show during DEALT phase */}
        {phase === 'DEALT' && (
          <motion.button
            onClick={onDraw}
            disabled={!canDraw}
            className={`
              px-16 py-3.5 rounded-xl font-bold text-2xl uppercase tracking-wider
              transition-all duration-200 border-3 min-w-[200px]
              ${canDraw
                ? 'bg-gradient-to-b from-poker-gold via-poker-gold to-poker-gold-dark border-poker-gold-dark text-poker-green-dark shadow-xl hover:shadow-2xl transform hover:scale-105 animate-pulse-glow'
                : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
              }
            `}
            style={{
              textShadow: canDraw ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            whileHover={canDraw ? { scale: 1.05 } : {}}
            whileTap={canDraw ? { scale: 0.95 } : {}}
          >
            {isProcessing ? 'DRAWING...' : 'DRAW'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
