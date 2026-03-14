import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, GripVertical, Clock, Calendar, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import './TaskBubble.css';

interface TaskBubbleProps {
  id: string;
  text: string;
  duration: number;
  createdAt: number;
  detail?: string;
  onComplete: (id: string, duration: number) => void;
  onDelete: (id: string) => void;
}

const TaskBubble: React.FC<TaskBubbleProps> = ({ id, text, duration, createdAt, detail, onComplete, onDelete }) => {
  const [isExploding, setIsExploding] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');

  const handleComplete = () => {
    setIsExploding(true);
    
    // 强化版爆炸动效粒子
    const end = Date.now() + 1200;
    const colors = ['#007aff', '#EBEBF5', '#64d2ff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    setTimeout(() => onComplete(id, duration), 1800);
  };

  return (
    <>
      <motion.div 
        layout
        className={`task-bubble-item ${isExploding ? 'exploding' : ''}`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <div className="drag-handle">
          <GripVertical size={22} />
        </div>

        <div className="task-content" onClick={() => setShowDetailModal(true)}>
          <div className="task-header-row">
            <h3 className="task-title-text">{text}</h3>
            {(detail || text.length > 20) && <Info size={16} className="detail-indicator" />}
          </div>
          <div className="task-meta">
            <div className="meta-item">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
            <div className="meta-item">
              <Clock size={12} />
              <span>{duration} mins</span>
            </div>
          </div>
        </div>

        <div className="bubble-actions">
          <button className="action-btn complete-btn" onClick={handleComplete} title="Release Potential">
            <Check size={20} />
          </button>
          <button className="action-btn delete-btn" onClick={() => onDelete(id)} title="Dissolve">
            <Trash2 size={18} />
          </button>
        </div>
      </motion.div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="detail-overlay"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="detail-modal glass-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="detail-header">
                <h2>Task Detail</h2>
                <button onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
              <div className="detail-body">
                <section>
                  <label>Title</label>
                  <p className="full-title">{text}</p>
                </section>
                <section>
                  <label>Background / Subtasks</label>
                  <p className="detail-text">{detail || text}</p>
                </section>
                <section className="detail-stats">
                  <div>
                    <label>Investment</label>
                    <p>{duration} mins</p>
                  </div>
                  <div>
                    <label>Established</label>
                    <p>{formattedDate}</p>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskBubble;
