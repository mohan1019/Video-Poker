'use client';

/**
 * CardRow component
 * Displays 5 cards horizontally with hold logic
 */

import { AnimatePresence } from 'framer-motion';
import Card from './Card';
import type { Card as CardType } from '@/lib/types';

interface CardRowProps {
  cards: CardType[];
  held: boolean[];
  winningIndices?: number[];
  onToggleHold: (index: number) => void;
  isDealing?: boolean;
  isDrawing?: boolean;
}

export default function CardRow({
  cards,
  held,
  winningIndices = [],
  onToggleHold,
  isDealing = false,
  isDrawing = false,
}: CardRowProps) {
  if (cards.length === 0) {
    return (
      <div className="flex justify-center items-center h-52 text-gray-400 text-lg">
        Click DEAL to start playing
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3" style={{ perspective: '1200px' }}>
      {cards.map((card, index) => (
        <div key={index} className="relative" style={{ width: '130px', height: '190px' }}>
          <AnimatePresence initial={false}>
            <Card
              key={card.id}
              card={card}
              isHeld={held[index]}
              isWinning={winningIndices.includes(index)}
              onToggleHold={() => onToggleHold(index)}
              index={index}
              isDealing={isDealing}
              isDrawing={isDrawing}
            />
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
