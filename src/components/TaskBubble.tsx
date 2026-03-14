import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, GripVertical, Clock, Calendar } from 'lucide-react';
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

  // 格式化为：年-月-日 时:分
  const formatFullDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  const handleComplete = () => {
    setIsExpanding(true);
    
    // 0.8s 极速膨胀阶段 (Rapid expansion phase)
    setTimeout(() => {
      setIsExpanding(false);
      setIsDone(true);
      
      // 增强型炫酷粒子效果 (Enhanced Cool Particle Effect)
      const count = 150;
      const defaults: confetti.Options = {
        origin: { y: 0.6 },
        spread: 360,
        ticks: 100,
        gravity: 0.8,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle', 'square'],
        colors: ['#007aff', '#5856d6', '#64d2ff', '#ff2d55', '#ffffff']
      };

      function shoot(angle: number, scalar: number) {
        confetti({
          ...defaults,
          particleCount: Math.floor(count * scalar),
          angle,
          scalar
        });
      }

      shoot(0, 2);
      shoot(60, 1.5);
      shoot(120, 1.5);
      shoot(180, 2);
      shoot(240, 1.5);
      shoot(300, 1.5);

      // 1.0s 后正式通知完成 (Notify completion after 1s explosion)
      setTimeout(() => {
        onComplete(id, duration);
      }, 1000);
    }, 800);
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: isExpanding ? 1.5 : 1, 
            y: 0,
            filter: isExpanding ? 'blur(4px) brightness(1.2)' : 'blur(0px) brightness(1)',
            boxShadow: isExpanding ? '0 0 50px var(--color-primary)' : 'var(--glass-shadow)'
          }}
          exit={{ opacity: 0, scale: 2.5, filter: 'blur(30px)' }}
          transition={{ 
            scale: { duration: isExpanding ? 0.8 : 0.4, ease: "circOut" },
            default: { duration: 0.4 }
          }}
          whileHover={!isExpanding ? { scale: 1.02, backgroundColor: 'var(--color-bg-secondary)' } : {}}
          className={`task-bubble-item glass-panel ${isExpanding ? 'expanding' : ''}`}
        >
          <div className="drag-handle">
            <GripVertical size={24} />
          </div>
          
          <div className="task-content">
            <div className="task-top-row">
              <span className="task-text">{text}</span>
              <div className="task-time-stamp">
                <Calendar size={12} className="meta-icon-small" />
                <span>{formatFullDateTime(createdAt)}</span>
              </div>
            </div>
            <div className="task-meta">
              <Clock size={16} className="meta-icon" />
              <span className="task-duration">{duration} mins</span>
            </div>
          </div>

          <div className="task-actions">
            <button 
              className={`action-btn complete-btn ${isExpanding ? 'disabled' : ''}`} 
              onClick={!isExpanding ? handleComplete : undefined}
              title="Release Potential"
            >
              <Check size={26} />
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
