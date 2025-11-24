import React, { useEffect } from 'react';

interface TimerProps {
  durationSeconds: number;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  onTimeUp: () => void;
  isActive: boolean;
}

const Timer: React.FC<TimerProps> = ({ durationSeconds, timeLeft, setTimeLeft, onTimeUp, isActive }) => {
  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, timeLeft, onTimeUp, setTimeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isUrgent = timeLeft < 60; // Less than 1 minute

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full font-mono text-xl font-bold shadow-lg border-2 transition-colors duration-300 ${
      isUrgent 
        ? 'bg-red-100 text-red-600 border-red-500 animate-pulse' 
        : 'bg-white text-medical-700 border-medical-500'
    }`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

export default Timer;
