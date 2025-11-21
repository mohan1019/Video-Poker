'use client';

/**
 * BalanceDisplay component
 * Shows current balance with animation on change
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BalanceDisplayProps {
  balance: number;
  initialBalance?: number;
}

export default function BalanceDisplay({ balance, initialBalance = 1000 }: BalanceDisplayProps) {
  const [prevBalance, setPrevBalance] = useState(balance);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    if (balance !== prevBalance) {
      // If balance equals initial balance, it's a reset - don't show delta
      if (balance === initialBalance) {
        setDelta(0);
        setPrevBalance(balance);
      } else {
        setDelta(balance - prevBalance);
        setPrevBalance(balance);

        // Clear delta after animation
        const timer = setTimeout(() => setDelta(0), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [balance, prevBalance, initialBalance]);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-poker-green-dark/50 rounded-lg border-2 border-poker-gold/40 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-poker-gold/70 uppercase tracking-wide font-semibold">Balance:</span>

          <motion.div
            key={balance}
            className="text-2xl font-bold text-poker-gold drop-shadow-lg"
            initial={{ scale: 1.15, color: '#FFD700' }}
            animate={{ scale: 1, color: '#FFD700' }}
            transition={{ duration: 0.3 }}
          >
            {balance}
          </motion.div>

          <span className="text-sm text-poker-gold/60 font-medium">credits</span>
        </div>

        {/* Delta Display - Integrated Badge */}
        <AnimatePresence mode="wait">
          {delta !== 0 && (
            <motion.div
              className={`px-3 py-1 rounded-full font-bold text-sm shadow-lg ${
                delta > 0
                  ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {delta > 0 ? '+' : ''}{delta}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
