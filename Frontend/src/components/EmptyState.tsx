import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="bg-dark-elevated p-6 rounded-full mb-6 border border-dark-border"
      >
        <HelpCircle size={48} className="text-accent-primary" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-dark-text font-semibold text-xl mb-2"
      >
        No questions yet
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-dark-text-secondary text-sm max-w-xs"
      >
        Go ahead. Speak your mind, leave no trace 💬
      </motion.p>
    </motion.div>
  );
}