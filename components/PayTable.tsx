'use client';

/**
 * PayTable component
 * Displays the payout table for all hands
 */

import { motion } from 'framer-motion';
import { getPayTable } from '@/lib/game/paytable';

interface PayTableProps {
  currentBet: number;
}

export default function PayTable({ currentBet }: PayTableProps) {
  const payTable = getPayTable();

  return (
    <motion.div
      className="bg-poker-green-dark/70 border-2 border-poker-gold/50 rounded-lg p-2.5 flex-1 backdrop-blur-sm shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="grid grid-cols-6 gap-x-1 gap-y-0.5 text-xs">
        {/* Header Row */}
        <div className="text-poker-gold font-bold text-xs">Hand</div>
        {[1, 2, 3, 4, 5].map(bet => (
          <motion.div
            key={bet}
            className={`text-center font-bold text-xs ${
              bet === currentBet ? 'text-poker-gold' : 'text-gray-400'
            }`}
            animate={{
              scale: bet === currentBet ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {bet}
          </motion.div>
        ))}

        {/* Pay Table Rows */}
        {payTable.map((row, index) => (
          <motion.div
            key={row.hand}
            className="contents"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.03 }}
          >
            <div className="text-white text-xs font-medium truncate">{row.hand}</div>
            {row.payouts.map((payout, betIndex) => (
              <motion.div
                key={betIndex}
                className={`text-center text-xs font-semibold rounded px-1 py-0.5 ${
                  betIndex + 1 === currentBet
                    ? 'text-poker-gold bg-poker-green-light/40'
                    : 'text-gray-300'
                }`}
                animate={{
                  scale: betIndex + 1 === currentBet ? 1.03 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {payout}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
