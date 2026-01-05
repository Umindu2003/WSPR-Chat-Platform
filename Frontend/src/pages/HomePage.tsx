import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Hash,
  X,
  Users,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Footer } from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function HomePage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [roomCapacity, setRoomCapacity] = useState('10');
  const [showInvalidCodeModal, setShowInvalidCodeModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCreateRoom = () => {
    setShowCapacityModal(true);
  };

  const handleConfirmCapacity = () => {
    const capacity = parseInt(roomCapacity);
    if (capacity >= 2 && capacity <= 100) {
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      navigate(`/room/${newRoomId}?capacity=${capacity}`);
      setShowCapacityModal(false);
    }
  };

  const handleCapacityChange = (amount: number) => {
    setRoomCapacity((prev) => {
      const current = parseInt(prev) || 0;
      const newCapacity = Math.max(2, Math.min(100, current + amount));
      return newCapacity.toString();
    });
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setIsChecking(true);

    // Clean the room code - extract room ID and capacity
    let cleanCode = roomCode.trim().toUpperCase();
    let capacityParam = '';
    
    // Extract capacity if present
    if (cleanCode.includes('?')) {
      const parts = cleanCode.split('?');
      cleanCode = parts[0];
      // Parse capacity from query string
      const params = new URLSearchParams(parts[1]);
      const capacity = params.get('capacity') || params.get('CAPACITY');
      if (capacity) {
        capacityParam = `?capacity=${capacity}`;
      }
    }
    
    // Remove any slashes if user pasted URL path
    if (cleanCode.includes('/')) {
      cleanCode = cleanCode.split('/').pop() || cleanCode;
    }

    try {
      const response = await fetch(`${API_URL}/api/room/${cleanCode}`);
      const data = await response.json();

      if (response.ok && data.success) {
        // Room exists - navigate to it
        navigate(`/room/${cleanCode}${capacityParam}`);
      } else if (response.status === 404) {
        // Room doesn't exist - show invalid code modal
        setShowInvalidCodeModal(true);
        setTimeout(() => {
          setShowInvalidCodeModal(false);
          setRoomCode('');
        }, 2000);
      } else {
        // Other error - still try to navigate (let socket handle it)
        navigate(`/room/${cleanCode}${capacityParam}`);
      }
    } catch (err) {
      // Network error - still try to navigate (let socket handle it)
      navigate(`/room/${cleanCode}${capacityParam}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-dark-bg">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6"
          >
            <img
              src="/ChatLogo.png"
              alt="Unmute Logo"
              className="w-55 h-48 mx-auto object-contain"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-dark-text-secondary"
          >
            Speak unseenly. Ask anonymously.
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-card rounded-3xl p-8 border border-dark-border shadow-xl shadow-black/20"
        >
          <div className="space-y-6">
            {/* Create Room Section */}
            <div>
              <Button
                onClick={handleCreateRoom}
                className="w-full h-14 text-lg font-medium"
              >
                Create Room
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-dark-border"></div>
              <span className="flex-shrink-0 mx-4 text-dark-text-muted text-sm font-medium">
                or join existing
              </span>
              <div className="flex-grow border-t border-dark-border"></div>
            </div>

            {/* Join Room Section */}
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-text-muted">
                  <Hash size={18} />
                </div>
                <Input
                  placeholder="Enter Room Code"
                  value={roomCode}
                  onChange={handleRoomCodeChange}
                  className="pl-11 h-14 text-lg"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  variant="secondary"
                  className={`w-fit px-12 h-12 transition-all duration-300 ${
                    roomCode.trim() && !isChecking
                      ? 'border-2 border-green-400 text-green-400 hover:border-green-300 hover:text-green-300 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                      : 'border border-dark-border text-dark-text-secondary'
                  }`}
                  disabled={!roomCode.trim() || isChecking}
                >
                  {isChecking ? 'Checking...' : 'Join Room'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-dark-text-muted text-sm mt-8"
        >
          No login required. Live chat. Zero receipts.
        </motion.p>
      </motion.div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Invalid Code Modal */}
      <AnimatePresence>
        {showInvalidCodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-3xl shadow-2xl p-8 w-full max-w-md border border-dark-border text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-dark-elevated flex items-center justify-center">
                  <span className="text-5xl">😔</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-dark-text mb-2">
                Invalid Code
              </h3>
              <p className="text-dark-text-secondary text-sm">
                This room does not exist.
              </p>
              <p className="text-dark-text-muted text-xs mt-2">
                Redirecting to home...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capacity Modal */}
      <AnimatePresence>
        {showCapacityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCapacityModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-card rounded-3xl shadow-2xl p-6 w-full max-w-md border border-dark-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark-text flex items-center gap-2">
                  <Users size={24} className="text-accent-primary" />
                  Set Room Capacity
                </h3>
                <button
                  onClick={() => setShowCapacityModal(false)}
                  className="text-dark-text-muted hover:text-dark-text transition-colors p-1 rounded-lg hover:bg-dark-elevated"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-dark-text-secondary mb-6">
                How many students can join this room?
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                    Maximum Members (2-100)
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type="number"
                      min="2"
                      max="100"
                      value={roomCapacity}
                      onChange={(e) => setRoomCapacity(e.target.value)}
                      className="h-16 text-2xl text-center font-bold"
                      placeholder="10"
                    />
                    <div className="absolute right-2 flex flex-col gap-1">
                      <button
                        onClick={() => handleCapacityChange(1)}
                        className="p-1 rounded-md hover:bg-dark-elevated text-dark-text-muted hover:text-dark-text transition-colors"
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button
                        onClick={() => handleCapacityChange(-1)}
                        className="p-1 rounded-md hover:bg-dark-elevated text-dark-text-muted hover:text-dark-text transition-colors"
                      >
                        <ChevronDown size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowCapacityModal(false)}
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmCapacity}
                    disabled={
                      !roomCapacity ||
                      parseInt(roomCapacity) < 2 ||
                      parseInt(roomCapacity) > 100
                    }
                    className="flex-1 h-12"
                  >
                    Create Room
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}