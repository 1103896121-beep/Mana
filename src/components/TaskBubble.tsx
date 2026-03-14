import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, GripVertical, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import './TaskBubble.css';

interface TaskBubbleProps {
  id: string;
  text: string;
  duration: number;
  createdAt: number;
  onComplete: (id: string, duration: number) => void;
  onDelete: (id: string) => void;
}

const TaskBubble: React.FC<TaskBubbleProps> = ({ id, text, duration, createdAt, onComplete, onDelete }) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleComplete = () => {
    setIsExpanding(true);
    
    // 2.5s Expansion phase
    setTimeout(() => {
      setIsExpanding(false);
      setIsDone(true);
      
      // Explosion Particle Effect
      const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });
      confetti({
        shapes: [triangle],
        particleCount: 60,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#38bdf8']
      });

      // Notify completion after explosion animation
      setTimeout(() => {
        onComplete(id, duration);
      }, 500);
    }, 2500);
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: isExpanding ? 1.4 : 1, 
            y: 0,
            filter: isExpanding ? 'blur(2px)' : 'blur(0px)',
            boxShadow: isExpanding ? 'var(--aura-mana-high)' : 'var(--glass-shadow)'
          }}
          exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
          transition={{ 
            scale: { duration: isExpanding ? 2.5 : 0.4, ease: "easeInOut" },
            default: { duration: 0.4 }
          }}
          whileHover={!isExpanding ? { scale: 1.02 } : {}}
          className={`task-bubble-item glass-panel ${isExpanding ? 'expanding' : ''}`}
        >
          <div className="drag-handle">
            <GripVertical size={24} />
          </div>
          
          <div className="task-content">
            <div className="task-top-row">
              <span className="task-text">{text}</span>
              <span className="task-time-stamp">{formatTime(createdAt)}</span>
            </div>
            <div className="task-meta">
              <Clock size={14} className="meta-icon" />
              <span className="task-duration">{duration} mins</span>
            </div>
          </div>

          <div className="task-actions">
            <button 
              className={`action-btn complete-btn ${isExpanding ? 'disabled' : ''}`} 
              onClick={!isExpanding ? handleComplete : undefined}
              title="Release Potential"
            >
              <Check size={24} />
            </button>
            <button 
              className="action-btn delete-btn" 
              onClick={() => onDelete(id)}
            >
              <Trash2 size={24} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskBubble;
