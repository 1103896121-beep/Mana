import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, GripVertical } from 'lucide-react';
import confetti from 'canvas-confetti';
import './TaskBubble.css';

interface TaskBubbleProps {
  id: string;
  text: string;
  manaValue: number;
  onComplete: (id: string, mana: number) => void;
  onDelete: (id: string) => void;
}

const TaskBubble: React.FC<TaskBubbleProps> = ({ id, text, manaValue, onComplete, onDelete }) => {
  const [isExploding, setIsExploding] = useState(false);

  const handleComplete = () => {
    setIsExploding(true);
    
    // Trigger Explosion Particle Effect
    const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });

    confetti({
      shapes: [triangle],
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#38bdf8']
    });

    setTimeout(() => {
      onComplete(id, manaValue);
    }, 500);
  };

  return (
    <AnimatePresence>
      {!isExploding && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="task-bubble-item glass-panel"
        >
          <div className="drag-handle">
            <GripVertical size={18} />
          </div>
          
          <div className="task-content">
            <span className="task-text">{text}</span>
            <span className="task-mana-cost">-{manaValue} MP</span>
          </div>

          <div className="task-actions">
            <button 
              className="action-btn complete-btn" 
              onClick={handleComplete}
              title="Release Energy"
            >
              <Check size={18} />
            </button>
            <button 
              className="action-btn delete-btn" 
              onClick={() => onDelete(id)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskBubble;
