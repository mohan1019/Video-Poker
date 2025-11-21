'use client';

/**
 * Card component with beautiful animations
 * Displays a poker card with suit and rank
 * Supports hold state with visual feedback
 */

import { motion } from 'framer-motion';
import type { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
  isHeld: boolean;
  isWinning?: boolean;
  onToggleHold: () => void;
  index: number;
  isDealing?: boolean;
  isDrawing?: boolean;
}

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export default function Card({
  card,
  isHeld,
  isWinning = false,
  onToggleHold,
  index,
  isDealing = false,
  isDrawing = false,
}: CardProps) {
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];

  return (
    <motion.div
      className="absolute inset-0"
      key={card.id} // Force re-render when card changes
      initial={isDealing ? { opacity: 0, y: -150, x: 0, rotateY: -90, scale: 0.8 } :
              (isDrawing && !isHeld) ? { opacity: 0, rotateY: 90, scale: 0.9 } : {}}
      animate={{
        opacity: 1,
        y: isHeld ? -24 : 0,
        x: 0,
        rotateY: 0,
        scale: 1,
      }}
      exit={isDrawing && !isHeld ? { opacity: 0, rotateY: -90, scale: 0.9 } : {}}
      transition={{
        delay: index * 0.12,
        duration: isDrawing && !isHeld ? 0.6 : 0.5,
        type: 'spring',
        stiffness: isDrawing && !isHeld ? 150 : 200,
        damping: isDrawing && !isHeld ? 20 : 18,
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Hold Badge */}
      {isHeld && (
        <motion.div
          className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-poker-gold text-poker-green-dark font-bold px-4 py-1.5 rounded-full text-sm shadow-neon z-10"
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          HELD
        </motion.div>
      )}

      {/* Winning Card Glow Effect */}
      {isWinning && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0) 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      )}

      {/* Card */}
      <motion.button
        onClick={onToggleHold}
        className={`
          relative w-full h-full rounded-xl
          flex flex-col items-center justify-between p-3
          cursor-pointer select-none
          transition-all duration-300
          ${isWinning
            ? 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 ring-[6px] ring-green-500 shadow-2xl z-10'
            : 'bg-white shadow-card'
          }
          ${isHeld && !isWinning ? 'ring-4 ring-poker-gold shadow-card-held' : ''}
          ${!isWinning && !isHeld ? 'hover:shadow-2xl hover:scale-105' : ''}
        `}
        animate={isWinning ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 30px 5px rgba(34, 197, 94, 0.6), 0 0 60px 10px rgba(34, 197, 94, 0.3)',
            '0 0 50px 10px rgba(34, 197, 94, 0.9), 0 0 80px 15px rgba(34, 197, 94, 0.5)',
            '0 0 30px 5px rgba(34, 197, 94, 0.6), 0 0 60px 10px rgba(34, 197, 94, 0.3)',
          ],
        } : {}}
        transition={isWinning ? {
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        } : {}}
        whileHover={{ scale: isHeld || isWinning ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
          {/* Top Left Corner */}
          <div className={`flex flex-col items-center ${suitColor}`}>
            <span className="text-2xl font-bold leading-none">{card.rank}</span>
            <span className="text-2xl leading-none">{suitSymbol}</span>
          </div>

          {/* Center Symbol */}
          <div className={`text-5xl ${suitColor}`}>
            {suitSymbol}
          </div>

          {/* Bottom Right Corner (rotated, except 6 and 9 to avoid confusion) */}
          <div className={`flex flex-col items-center ${card.rank === '6' || card.rank === '9' ? '' : 'rotate-180'} ${suitColor}`}>
            <span className="text-2xl font-bold leading-none">{card.rank}</span>
            <span className="text-2xl leading-none">{suitSymbol}</span>
          </div>
        </motion.button>
    </motion.div>
  );
}
