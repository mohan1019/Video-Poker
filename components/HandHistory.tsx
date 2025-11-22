'use client';

/**
 * HandHistory component
 * Displays history of all hands played with their payouts
 */

import { motion, AnimatePresence } from 'framer-motion';
import { getHandName } from '@/lib/game/paytable';
import type { HandRank } from '@/lib/types';

export interface HandHistoryEntry {
  id: number;
  handRank: HandRank;
  bet: number;
  payout: number;
}

interface HandHistoryProps {
  history: HandHistoryEntry[];
}

export default function HandHistory({ history }: HandHistoryProps) {
  // Show last 5 hands (most recent first) to match pay table height
  const recentHistory = [...history].reverse().slice(0, 5);

  return (
    <motion.div
      className="bg-poker-green-dark/70 border-2 border-poker-gold/50 rounded-lg p-2.5 backdrop-blur-sm shadow-lg w-[240px] h-fit"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="text-poker-gold font-bold text-xs mb-1.5 text-center uppercase tracking-wider">
        Hand History
      </div>

      <div className="space-y-1 max-h-[155px] overflow-y-auto scrollbar-thin scrollbar-thumb-poker-gold/40 scrollbar-track-poker-green-dark/20">
        <AnimatePresence initial={false}>
          {recentHistory.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">
              No hands played yet
            </div>
          ) : (
            recentHistory.map((entry, index) => (
              <motion.div
                key={entry.id}
                className={`flex flex-col gap-1 px-2 py-1.5 rounded ${
                  entry.payout > 0
                    ? 'bg-green-500/15 border border-green-500/40'
                    : 'bg-red-500/15 border border-red-500/40'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-xs truncate max-w-[130px] ${
                    entry.payout > 0 ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {getHandName(entry.handRank)}
                  </span>
                  <span className={`font-bold text-sm ${
                    entry.payout > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {entry.payout > 0 ? '+' : ''}{entry.payout}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[10px]">
                    Bet: {entry.bet}
                  </span>
                  <span className="text-gray-500 text-[10px]">
                    {entry.payout > 0 ? `${entry.payout / entry.bet}x` : ''}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {recentHistory.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-poker-gold/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-medium">Total Hands:</span>
            <span className="text-poker-gold font-bold text-sm">{history.length}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
