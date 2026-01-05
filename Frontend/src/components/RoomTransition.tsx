import { motion } from 'framer-motion';

interface RoomTransitionProps {
  type: 'creating' | 'joining';
}

export function RoomTransition({ type }: RoomTransitionProps) {
  const isCreating = type === 'creating';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-dark-bg z-50 flex flex-col items-center justify-center"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center shadow-lg shadow-accent-primary/30">
          <motion.span 
            className="text-5xl"
            animate={{ 
              rotate: isCreating ? [0, 10, -10, 0] : 0,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 0.5, 
              repeat: Infinity, 
              repeatDelay: 0.5 
            }}
          >
            {isCreating ? '🚀' : '🔗'}
          </motion.span>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-dark-text mb-2"
      >
        {isCreating ? 'Creating Room' : 'Joining Room'}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-dark-text-secondary mb-8"
      >
        {isCreating ? 'Setting up your anonymous space...' : 'Connecting to the room...'}
      </motion.p>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-64 h-1.5 bg-dark-elevated rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-accent-primary to-purple-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Dots animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 mt-6"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-accent-primary"
            animate={{
              y: [-3, 3, -3],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
