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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-poker-green-dark/80 to-poker-green-dark/60 rounded-xl border-2 border-poker-gold/50 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-poker-gold/70 uppercase tracking-widest font-bold">Balance</span>

            <div className="flex items-baseline gap-2">
              <motion.div
                key={balance}
                className="text-3xl font-black text-poker-gold drop-shadow-lg"
                initial={{ scale: 1.2, color: '#FFD700' }}
                animate={{ scale: 1, color: '#FFD700' }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                style={{ textShadow: '0 0 15px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.3)' }}
              >
                {balance}
              </motion.div>

              <span className="text-xs text-poker-gold/60 font-semibold">credits</span>
            </div>
          </div>

          {/* Delta Display - Integrated Badge */}
          <AnimatePresence mode="wait">
            {delta !== 0 && (
              <motion.div
                className={`px-2.5 py-1 rounded-lg font-black text-sm shadow-lg border-2 ${
                  delta > 0
                    ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 text-green-300 border-green-500/60'
                    : 'bg-gradient-to-br from-red-500/30 to-red-600/20 text-red-300 border-red-500/60'
                }`}
                initial={{ opacity: 0, scale: 0.8, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -5 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                {delta > 0 ? '+' : ''}{delta}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-[10px] text-gray-400/70 text-center px-2 leading-tight">
        For fun & strategy learning only. No real money.
      </div>
    </div>
  );
}
