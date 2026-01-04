import { useState } from 'react';
import { Copy, Check, Users, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
  roomId: string;
  onlineCount: number;
  capacity?: number;
}

export function RoomHeader({
  roomId,
  onlineCount,
  capacity,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    // Copy only room code and capacity parameter (e.g., "MY563F?capacity=6")
    const inviteCode = capacity ? `${roomId}?capacity=${capacity}` : roomId;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    navigate('/');
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  return (
    <>
      <header className="h-16 border-b border-dark-border bg-dark-card/80 backdrop-blur-md sticky top-0 z-10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Room Info */}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-dark-text flex items-center gap-2">
              Room: <span className="font-mono text-accent-primary">{roomId}</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-dark-text-secondary">
              <div className="flex items-center gap-1.5">
                <Users size={12} />
                {capacity ? `${onlineCount}/${capacity}` : onlineCount}
              </div>
            </div>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-success/10 border border-accent-success/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-success"></span>
            </span>
            <span className="text-xs font-medium text-accent-success">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop version with text */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="hidden sm:flex"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-2 text-accent-success"
                >
                  <Check size={14} />
                  <span>Copied</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Copy size={14} />
                  <span>Copy Invite</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Mobile version - compact button with text */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="sm:hidden text-xs"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="check-mobile"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1.5 text-accent-success"
                >
                  <Check size={14} />
                  <span>Copied</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy-mobile"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy size={14} />
                  <span>Invite</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitClick}
            title="Leave Room"
            className="hover:bg-accent-error/10"
          >
            <LogOut size={18} className="text-red-500" />
          </Button>
        </div>
      </header>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelExit}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              className="fixed top-1/2 left-1/2 w-[85%] max-w-sm bg-dark-card rounded-2xl shadow-2xl p-5 z-50 border border-dark-border"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-error/10 flex items-center justify-center flex-shrink-0">
                    <LogOut size={20} className="text-accent-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-dark-text">
                      Leave Room?
                    </h3>
                    <p className="text-xs text-dark-text-secondary mt-1">
                      Are you sure you want to exit this Q&A room?
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button onClick={confirmExit} variant="danger" className="px-6 py-2 text-sm">
                    Leave
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={cancelExit}
                    className="px-6 py-2 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 