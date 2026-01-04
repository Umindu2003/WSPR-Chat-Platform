import React, { useState, useRef, FormEvent } from 'react';
import { SendHorizontal, Smile, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { GifPicker } from './ui/GifPicker';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: () => void;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢'];
const EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙',
  '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓',
  '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
  '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
  '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱',
  '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮',
  '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '👍', '👎', '👌', '✌️',
  '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️',
  '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '💪', '🦾',
  '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
  '💝', '🔥', '✨', '💫', '⭐', '🌟', '💯', '🎉', '🎊'
];

export function MessageInput({
  onSendMessage,
  onTyping
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const sendQuickReaction = (reaction: string) => {
    onSendMessage(reaction);
  };

  const handleGifSelect = (gifUrl: string) => {
    onSendMessage(gifUrl);
    setShowGifPicker(false);
  };

  return (
    <div className="p-4 bg-dark-card border-t border-dark-border">
      <div className="max-w-4xl mx-auto">
        {/* Quick Reactions Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-3 mb-3"
        >
          <span className="text-xs text-dark-text-muted font-medium">
            Quick React:
          </span>
          {QUICK_REACTIONS.map((reaction, index) => (
            <motion.button
              key={reaction}
              type="button"
              onClick={() => sendQuickReaction(reaction)}
              className="text-2xl hover:scale-125 transition-transform duration-200 cursor-pointer"
              whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {reaction}
            </motion.button>
          ))}
        </motion.div>

        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          {/* Emoji Picker Button */}
          <div className="relative">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGifPicker(false);
              }}
              className="text-dark-text-muted hover:text-accent-primary w-9 h-9 p-1 md:w-10 md:h-10"
            >
              <Smile size={18} />
            </Button>

            {/* Emoji Picker Dropdown */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 bg-dark-elevated rounded-2xl shadow-2xl border border-dark-border p-3 w-72 max-h-64 overflow-y-auto z-50"
                >
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-2xl hover:bg-dark-border rounded p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GIF Button */}
          <div className="relative">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setShowGifPicker(!showGifPicker);
                setShowEmojiPicker(false);
              }}
              className="text-dark-text-muted hover:text-accent-primary w-9 h-9 p-1 md:w-10 md:h-10"
            >
              <ImageIcon size={18} />
            </Button>

            {/* GIF Picker */}
            <AnimatePresence>
              {showGifPicker && (
                <GifPicker
                  onSelect={handleGifSelect}
                  onClose={() => setShowGifPicker(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Message Input */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className="flex-1 bg-dark-elevated text-dark-text placeholder:text-dark-text-muted rounded-2xl px-4 py-3 border border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary transition-all duration-200"
          />

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim()}
            className={`w-12 h-12 flex-shrink-0 md:w-11 md:h-11 ${
              message.trim()
                ? 'bg-accent-primary hover:bg-accent-hover'
                : 'bg-dark-elevated text-dark-text-muted border border-dark-border'
            }`}
          >
            <SendHorizontal size={24} className="md:w-5 md:h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}