'use client';

/**
 * Controls component
 * Bet adjustment, Deal, and Draw buttons
 */

import { motion } from 'framer-motion';

interface ControlsProps {
  bet: number;
  balance: number;
  phase: 'BETTING' | 'DEALT' | 'DRAWN';
  onBetChange: (bet: number) => void;
  onDeal: () => void;
  onDraw: () => void;
  isProcessing: boolean;
}

export default function Controls({
  bet,
  balance,
  phase,
  onBetChange,
  onDeal,
  onDraw,
  isProcessing,
}: ControlsProps) {
  const canIncreaseBet = bet < 5 && bet < balance;
  const canDecreaseBet = bet > 1;
  // Allow dealing in both BETTING phase (initial) and DRAWN phase (deal again)
  const canDeal = (phase === 'BETTING' || phase === 'DRAWN') && balance >= bet && !isProcessing;
  const canDraw = phase === 'DEALT' && !isProcessing;

  return (
    <motion.div
      className="bg-poker-green-dark/50 rounded-lg border-2 border-poker-gold/40 p-3 backdrop-blur-sm shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Bet Controls - Show during BETTING and DRAWN phases */}
        {(phase === 'BETTING' || phase === 'DRAWN') && (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => onBetChange(bet - 1)}
              disabled={!canDecreaseBet}
              className={`
                px-4 py-2 rounded-lg font-bold text-sm
                transition-all duration-200 border-2
                ${canDecreaseBet
                  ? 'bg-gradient-to-b from-poker-green-light to-poker-green border-poker-gold/50 text-white shadow-md hover:shadow-lg hover:scale-105 hover:border-poker-gold'
                  : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              - BET
            </button>

            <div className="flex flex-col items-center min-w-20 bg-poker-green-dark/70 rounded-lg p-2 border border-poker-gold/30">
              <span className="text-[10px] text-gray-300 uppercase">Bet</span>
              <motion.span
                key={bet}
                className="text-2xl font-bold text-poker-gold"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                {bet}
              </motion.span>
            </div>

            <button
              onClick={() => onBetChange(bet + 1)}
              disabled={!canIncreaseBet}
              className={`
                px-4 py-2 rounded-lg font-bold text-sm
                transition-all duration-200 border-2
                ${canIncreaseBet
                  ? 'bg-gradient-to-b from-poker-green-light to-poker-green border-poker-gold/50 text-white shadow-md hover:shadow-lg hover:scale-105 hover:border-poker-gold'
                  : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              + BET
            </button>
          </motion.div>
        )}

        {/* Main Action Buttons */}
        <div className="flex gap-3">
          {phase === 'BETTING' && (
            <motion.button
              onClick={onDeal}
              disabled={!canDeal}
              className={`
                px-10 py-2.5 rounded-xl font-bold text-lg
                transition-all duration-200 border-3
                ${canDeal
                  ? 'bg-gradient-to-b from-poker-gold via-poker-gold to-poker-gold-dark border-poker-gold-dark text-poker-green-dark shadow-xl hover:shadow-neon transform hover:scale-105'
                  : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
              whileHover={canDeal ? { scale: 1.05 } : {}}
              whileTap={canDeal ? { scale: 0.95 } : {}}
            >
              {isProcessing ? 'DEALING...' : 'DEAL'}
            </motion.button>
          )}

          {phase === 'DEALT' && (
            <motion.button
              onClick={onDraw}
              disabled={!canDraw}
              className={`
                px-10 py-2.5 rounded-xl font-bold text-lg
                transition-all duration-200 border-3
                ${canDraw
                  ? 'bg-gradient-to-b from-poker-gold via-poker-gold to-poker-gold-dark border-poker-gold-dark text-poker-green-dark shadow-xl hover:shadow-neon transform hover:scale-105 animate-pulse-glow'
                  : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              whileHover={canDraw ? { scale: 1.05 } : {}}
              whileTap={canDraw ? { scale: 0.95 } : {}}
            >
              {isProcessing ? 'DRAWING...' : 'DRAW'}
            </motion.button>
          )}

          {phase === 'DRAWN' && (
            <motion.button
              onClick={onDeal}
              disabled={!canDeal}
              className={`
                px-10 py-2.5 rounded-xl font-bold text-lg
                transition-all duration-200 border-3
                ${canDeal
                  ? 'bg-gradient-to-b from-poker-gold via-poker-gold to-poker-gold-dark border-poker-gold-dark text-poker-green-dark shadow-xl hover:shadow-neon transform hover:scale-105'
                  : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
              whileHover={canDeal ? { scale: 1.05 } : {}}
              whileTap={canDeal ? { scale: 0.95 } : {}}
            >
              {isProcessing ? 'DEALING...' : 'DEAL AGAIN'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
