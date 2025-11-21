'use client';

/**
 * StrategyPanel component
 * Displays optimal play recommendations for the current hand
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/lib/types';
import MiniCard from './MiniCard';

interface StrategyRecommendation {
  holdIndices: number[];
  holdCards: string[];
  ev: number;
  evPercent: number;
  mostLikelyOutcome: string;
  explanation: string;
}

interface StrategyPanelProps {
  hand: Card[];
  phase: 'BETTING' | 'DEALT' | 'DRAWN';
}

export default function StrategyPanel({ hand, phase }: StrategyPanelProps) {
  const [strategies, setStrategies] = useState<StrategyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only analyze when we have a dealt hand (before draw)
    if (phase !== 'DEALT' || hand.length !== 5) {
      setStrategies([]);
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    // Run strategy calculation in a microtask to not block rendering
    Promise.resolve().then(() => {
      if (!abortController.signal.aborted) {
        analyzeHand(abortController.signal);
      }
    });

    return () => {
      abortController.abort();
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hand, phase]);

  const analyzeHand = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      // Convert hand to string format
      const suitMap = {
        hearts: 'H',
        diamonds: 'D',
        clubs: 'C',
        spades: 'S',
      };

      const handStrings = hand.map(card =>
        card.rank + suitMap[card.suit]
      );

      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hand: handStrings }),
        signal,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze hand');
      }

      const data = await response.json();
      setStrategies(data.strategies);
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Strategy analysis error:', err);
      setError('Failed to analyze hand');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'BETTING' || hand.length === 0) {
    return (
      <motion.div
        className="bg-poker-green-dark/70 border-2 border-poker-gold/50 rounded-lg p-3 backdrop-blur-sm shadow-lg h-full max-h-[420px]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-poker-gold font-bold text-sm mb-2 text-center uppercase tracking-wider">
          Strategy Advisor
        </div>
        <div className="text-gray-400 text-xs text-center py-6">
          Deal cards to see optimal play recommendations
        </div>
      </motion.div>
    );
  }

  if (phase === 'DRAWN') {
    return (
      <motion.div
        className="bg-poker-green-dark/70 border-2 border-poker-gold/50 rounded-lg p-3 backdrop-blur-sm shadow-lg h-full max-h-[420px]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-poker-gold font-bold text-sm mb-2 text-center uppercase tracking-wider">
          Strategy Advisor
        </div>
        <div className="text-gray-400 text-xs text-center py-6">
          Deal a new hand to see recommendations
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-poker-green-dark/70 border-2 border-poker-gold/50 rounded-lg p-3 backdrop-blur-sm shadow-lg flex flex-col h-full max-h-[420px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="text-poker-gold font-bold text-sm mb-2 text-center uppercase tracking-wider flex-shrink-0">
        Strategy Advisor
      </div>

      {loading && (
        <div className="text-gray-400 text-xs text-center py-6">
          Analyzing hand...
        </div>
      )}

      {error && (
        <div className="text-red-400 text-xs text-center py-6">
          {error}
        </div>
      )}

      {!loading && !error && strategies.length > 0 && (
        <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
          <AnimatePresence>
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                className={`p-2.5 rounded-lg border-2 ${
                  index === 0
                    ? 'bg-poker-gold/10 border-poker-gold/60'
                    : 'bg-gray-800/30 border-gray-600/40'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Header with rank badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`px-2 py-0.5 rounded font-bold text-xs ${
                    index === 0
                      ? 'bg-poker-gold text-poker-green-dark'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      index === 0 ? 'text-poker-gold' : 'text-gray-300'
                    }`}>
                      EV: {strategy.evPercent}%
                    </div>
                    <div className="text-[10px] text-gray-400">
                      ({strategy.ev.toFixed(4)}x)
                    </div>
                  </div>
                </div>

                {/* Hold cards */}
                <div className="mb-1.5">
                  <div className="text-[10px] text-gray-400 mb-1">HOLD:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {strategy.holdCards.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">Draw all 5</span>
                    ) : (
                      strategy.holdCards.map((card, i) => (
                        <MiniCard
                          key={i}
                          cardString={card}
                          highlighted={index === 0}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Most likely outcome */}
                <div className="mb-1">
                  <div className="text-[10px] text-gray-400 mb-0.5">LIKELY:</div>
                  <div className={`text-xs font-semibold ${
                    index === 0 ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    {strategy.mostLikelyOutcome}
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-[10px] text-gray-400 leading-relaxed">
                  {strategy.explanation}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Info footer */}
          <div className="mt-2 pt-2 border-t border-poker-gold/30">
            <div className="text-[10px] text-gray-500 text-center">
              Based on 9/6 Jacks or Better optimal strategy
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
