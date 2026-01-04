import React from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: string;
  username: string;
  timestamp: string;
  isSelf: boolean;
}

export function MessageBubble({
  message,
  username,
  timestamp,
  isSelf,
}: MessageBubbleProps) {
  // Check if message is a GIF URL
  const isGif =
    message.startsWith('https://media') || message.toLowerCase().endsWith('.gif');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full mb-4 ${isSelf ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-[80%] md:max-w-[70%] ${
          isSelf ? 'flex-row-reverse' : 'flex-row'
        } items-end gap-2`}
      >
        {/* DiceBear Avatar */}
        <div className="flex-shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
              username
            )}&backgroundColor=1E2430`}
            alt={username}
            className="h-8 w-8 rounded-full bg-dark-elevated border border-dark-border"
          />
        </div>

        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-medium text-dark-text-secondary">
              {username}
            </span>
            <span className="text-[10px] text-dark-text-muted">{timestamp}</span>
          </div>

          <div
            className={`${
              isGif ? 'p-1' : 'px-4 py-3'
            } rounded-2xl text-sm leading-relaxed shadow-lg ${
              isSelf
                ? 'bg-accent-primary text-white rounded-br-sm'
                : 'bg-dark-elevated text-dark-text border border-dark-border rounded-bl-sm'
            }`}
          >
            {isGif ? (
              <img
                src={message}
                alt="GIF"
                className="rounded-xl max-w-[250px] w-full h-auto"
                loading="lazy"
              />
            ) : (
              message
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}