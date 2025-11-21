'use client';

/**
 * ResultMessage component
 * Displays hand result with animation
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { HandEvaluation } from '@/lib/types';
import { getHandName } from '@/lib/game/paytable';

interface ResultMessageProps {
  result: HandEvaluation | null;
}

export default function ResultMessage({ result }: ResultMessageProps) {
  if (!result) {
    return <div className="text-center min-w-[300px] h-10" />;
  }

  const isWin = result.payout > 0;
  const handName = getHandName(result.rank);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.rank}
        className="flex flex-col items-center text-center min-w-[350px]"
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        {isWin ? (
          <motion.div
            className="px-6 py-3 bg-gradient-to-r from-poker-gold/30 via-poker-gold/40 to-poker-gold/30 rounded-xl border-2 border-poker-gold shadow-2xl backdrop-blur-md"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <motion.div
              className="text-2xl font-extrabold text-poker-gold drop-shadow-2xl tracking-wide uppercase"
              style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5)',
              }}
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              {result.rank === 'ROYAL_FLUSH' && '👑 '}
              {handName}!
            </motion.div>
            <motion.div
              className="text-xl font-bold text-green-300 drop-shadow-lg mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                textShadow: '0 0 10px rgba(134, 239, 172, 0.8)',
              }}
            >
              WIN: {result.payout} CREDITS
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="px-6 py-3 bg-gradient-to-r from-red-900/40 via-red-800/50 to-red-900/40 rounded-xl border-2 border-red-600/60 shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-xl font-bold text-red-300 drop-shadow-lg uppercase tracking-wide"
              style={{
                textShadow: '0 0 10px rgba(252, 165, 165, 0.6)',
              }}
            >
              {handName === 'Nothing' ? 'NO WIN' : handName}
            </div>
            <motion.div
              className="text-lg font-bold text-red-400 drop-shadow-lg mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                textShadow: '0 0 10px rgba(252, 165, 165, 0.4)',
              }}
            >
              WIN: 0 CREDITS
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
