'use client';

/**
 * Main Video Poker game page
 * Manages game state and API communication
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import CardRow from '@/components/CardRow';
import Controls from '@/components/Controls';
import BalanceDisplay from '@/components/BalanceDisplay';
import PayTable from '@/components/PayTable';
import HandHistory, { type HandHistoryEntry } from '@/components/HandHistory';
import StrategyPanel from '@/components/StrategyPanel';
import type { GameState, DealResponse, DrawResponse } from '@/lib/types';
import { playDealSound, playDrawSound, playWinSound, playLoseSound, playButtonClick } from '@/lib/sounds';

const INITIAL_BALANCE = 1000;

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    balance: INITIAL_BALANCE,
    bet: 5,
    hand: [],
    held: [false, false, false, false, false],
    phase: 'BETTING',
    lastResult: null,
    handId: null,
    seedCommitment: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [handHistory, setHandHistory] = useState<HandHistoryEntry[]>([]);
  const [showStrategy, setShowStrategy] = useState(true);

  const handleBetChange = (newBet: number) => {
    if (newBet >= 1 && newBet <= 5 && newBet <= gameState.balance) {
      setGameState(prev => ({ ...prev, bet: newBet }));
    }
  };

  const handleDeal = async () => {
    if (gameState.balance < gameState.bet) {
      alert('Insufficient balance!');
      return;
    }

    playDealSound();
    setIsProcessing(true);
    setIsDealing(true);

    try {
      const response = await fetch('/api/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bet: gameState.bet,
          balance: gameState.balance,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deal');
      }

      const data: DealResponse = await response.json();

      setGameState(prev => ({
        ...prev,
        hand: data.hand,
        balance: data.balance,
        held: [false, false, false, false, false],
        phase: 'DEALT',
        lastResult: null,
        handId: data.handId,
        seedCommitment: data.seedCommitment,
      }));
    } catch (error) {
      console.error('Deal error:', error);
      alert('Failed to deal cards. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setIsDealing(false), 500);
    }
  };

  const handleDraw = async () => {
    if (!gameState.handId) {
      alert('No active hand!');
      return;
    }

    playDrawSound();
    setIsProcessing(true);
    setIsDrawing(true);

    try {
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handId: gameState.handId,
          held: gameState.held,
          balance: gameState.balance,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to draw');
      }

      const data: DrawResponse = await response.json();

      // Add to history
      const historyEntry: HandHistoryEntry = {
        id: Date.now(),
        handRank: data.evaluation.rank,
        bet: gameState.bet,
        payout: data.evaluation.payout,
      };
      setHandHistory(prev => [...prev, historyEntry]);

      // Update hand immediately to trigger flip animation on unheld cards
      setGameState(prev => ({
        ...prev,
        hand: data.hand,
        balance: data.balance,
        phase: 'DRAWN',
        lastResult: data.evaluation,
      }));

      // Wait for flip animation to complete before resetting isDrawing flag
      setTimeout(() => {
        setIsDrawing(false);
      }, 800);

      // Play win/lose sound based on result
      if (data.evaluation.payout > 0) {
        const isLargeWin = data.evaluation.payout >= gameState.bet * 10;
        playWinSound(isLargeWin);
      } else {
        playLoseSound();
      }
    } catch (error) {
      console.error('Draw error:', error);
      alert('Failed to draw cards. Please try again.');
      setIsDrawing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleHold = (index: number) => {
    if (gameState.phase !== 'DEALT') return;

    setGameState(prev => ({
      ...prev,
      held: prev.held.map((h, i) => (i === index ? !h : h)),
    }));
  };

  const handleReset = () => {
    if (confirm('Reset balance to ' + INITIAL_BALANCE + ' credits?')) {
      playButtonClick();
      setGameState({
        balance: INITIAL_BALANCE,
        bet: 5,
        hand: [],
        held: [false, false, false, false, false],
        phase: 'BETTING',
        lastResult: null,
        handId: null,
        seedCommitment: null,
      });
      setHandHistory([]);
    }
  };

  return (
    <main
      className="h-screen overflow-hidden flex flex-col p-2 pb-3 relative"
      style={{
        backgroundImage: 'url(/pattern.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Header */}
      <motion.div
        className="text-center mb-1 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold text-poker-gold tracking-widest drop-shadow-2xl uppercase"
          style={{
            textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.3)',
            fontFamily: 'serif',
          }}
        >
          VIDEO POKER
        </h1>
        <div className="text-xs text-poker-gold-light tracking-wide font-semibold mt-0.5">
          Jacks or Better
        </div>
      </motion.div>

      {/* Pay Table with Balance, History and Reset inline */}
      <div className="mb-1 relative z-10">
        <div className="max-w-7xl mx-auto px-2 flex items-start justify-between gap-2">
          <PayTable currentBet={gameState.bet} />
          <div className="flex gap-2">
            <HandHistory history={handHistory} />
            <div className="flex flex-col gap-1.5 min-w-[220px]">
              <BalanceDisplay balance={gameState.balance} initialBalance={INITIAL_BALANCE} />
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-gradient-to-b from-poker-gold/20 to-poker-gold/10 hover:from-poker-gold/30 hover:to-poker-gold/20 text-poker-gold text-xs font-semibold rounded-lg border-2 border-poker-gold/40 hover:border-poker-gold/60 transition-all hover:scale-105 shadow-lg"
              >
                RESET
              </button>

              {/* Strategy Toggle */}
              <button
                onClick={() => {
                  playButtonClick();
                  setShowStrategy(!showStrategy);
                }}
                className="px-4 py-1.5 bg-gradient-to-b from-poker-gold/20 to-poker-gold/10 hover:from-poker-gold/30 hover:to-poker-gold/20 text-poker-gold text-xs font-semibold rounded-lg border-2 border-poker-gold/40 hover:border-poker-gold/60 transition-all hover:scale-105 shadow-lg"
              >
                {showStrategy ? '🎯 HIDE STRATEGY' : '🎯 SHOW STRATEGY'}
              </button>

              {/* Disclaimer */}
              <div className="bg-poker-green-dark/40 border border-poker-gold/30 rounded-lg p-1.5 backdrop-blur-sm shadow-md">
                <div className="flex items-start gap-1.5">
                  <span className="text-poker-gold text-xs flex-shrink-0">⚠️</span>
                  <div className="text-[9px] text-gray-300 leading-snug">
                    <strong className="text-poker-gold block text-[10px]">Game for Fun</strong>
                    No gambling or real money. Virtual credits only.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Container with Strategy Panel */}
      <div className="flex-1 relative z-10 min-h-0">
        <div className={`max-w-7xl mx-auto px-2 ${showStrategy ? 'flex items-start gap-3' : ''} h-full`}>
          {/* Game area */}
          <div className={`flex flex-col gap-2 ${showStrategy ? 'flex-1' : 'max-w-4xl mx-auto'}`}>
            {/* Card Display Area */}
            <motion.div
              className="bg-poker-green-dark/30 rounded-xl border-2 border-poker-gold/50 pt-12 pb-3 px-4 shadow-xl backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CardRow
                cards={gameState.hand}
                held={gameState.held}
                winningIndices={gameState.lastResult?.winningCardIndices || []}
                onToggleHold={handleToggleHold}
                isDealing={isDealing}
                isDrawing={isDrawing}
              />
            </motion.div>

            {/* Controls */}
            <Controls
              bet={gameState.bet}
              balance={gameState.balance}
              phase={gameState.phase}
              onBetChange={handleBetChange}
              onDeal={handleDeal}
              onDraw={handleDraw}
              isProcessing={isProcessing}
              lastResult={gameState.lastResult}
            />
          </div>

          {/* Right side - Strategy Panel */}
          {showStrategy && (
            <motion.div
              className="w-[300px] flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <StrategyPanel hand={gameState.hand} phase={gameState.phase} />
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
