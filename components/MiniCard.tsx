'use client';

/**
 * MiniCard component
 * Small card display for strategy recommendations
 */

interface MiniCardProps {
  cardString: string; // Format: "AS", "KH", etc.
  highlighted?: boolean;
}

const SUIT_SYMBOLS = {
  H: '♥',
  D: '♦',
  C: '♣',
  S: '♠',
};

const SUIT_COLORS = {
  H: 'text-red-600',
  D: 'text-red-600',
  C: 'text-gray-900',
  S: 'text-gray-900',
};

export default function MiniCard({ cardString, highlighted = false }: MiniCardProps) {
  const rank = cardString.slice(0, -1);
  const suitChar = cardString.slice(-1) as keyof typeof SUIT_SYMBOLS;
  const suitSymbol = SUIT_SYMBOLS[suitChar];
  const suitColor = SUIT_COLORS[suitChar];

  return (
    <div
      className={`bg-white rounded border shadow-sm flex flex-col items-center justify-center gap-0.5 p-1.5 w-9 h-12 ${
        highlighted
          ? 'ring-2 ring-poker-gold shadow-md'
          : 'border-gray-300'
      }`}
    >
      <div className={`flex flex-col items-center leading-none ${suitColor}`}>
        <span className="text-sm font-bold">{rank}</span>
        <span className="text-base">{suitSymbol}</span>
      </div>
    </div>
  );
}
