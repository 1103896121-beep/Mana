import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Trash2, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
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

const TaskBubble: React.FC<TaskBubbleProps> = ({ 
  id, text, duration, createdAt, detail, onComplete, onDelete 
}) => {
  const { t } = useTranslation();
  console.log('TaskBubble version: 28.11 - Enhanced Feedback');
  const [isExploding, setIsExploding] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const dragStartPos = useRef<{ x: number, y: number } | null>(null);

  const dateObj = new Date(createdAt);
  const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExploding) return;

    setIsExploding(true);
    // 快速关闭卡片
    setTimeout(() => {
      onComplete(id, duration);
    }, 400);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <>
      <motion.div
        layout
        className={`task-bubble-item ${isExploding ? 'exploding' : ''}`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onPointerDown={(e) => {
          dragStartPos.current = { x: e.clientX, y: e.clientY };
        }}
      >
        <motion.div 
          className="task-card-inner"
          animate={{ 
            opacity: isExploding ? 0 : 1, 
            scale: isExploding ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="task-content"
            onClick={(e) => {
              if (dragStartPos.current) {
                const dx = Math.abs(e.clientX - dragStartPos.current.x);
                const dy = Math.abs(e.clientY - dragStartPos.current.y);
                if (dx > 5 || dy > 5) {
                  dragStartPos.current = null;
                  return;
                }
              }
              setShowDetailModal(true);
            }}
          >
            <div className="task-header-row">
              <h3 className="task-title-text">{text}</h3>
              {(detail || text.length > 20) && <Info size={16} className="detail-indicator" />}
            </div>
            <div className="task-meta">
              <div className="meta-item"><span>{formattedDate}</span></div>
              <div className="meta-item"><span>{duration}m</span></div>
            </div>
          </div>

          <div className="bubble-actions">
            <button className="action-btn complete-btn" onClick={handleComplete} title="Extract Energy">
              <Check size={20} />
            </button>
            <button className="action-btn delete-btn" onClick={handleDeleteClick} title="Dissolve">
              <Trash2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* 气泡爆炸舞台被移除，仅保留音效反馈 */}
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
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="detail-modal glass-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="detail-header">
                <h2>{t('taskViewport.detailed')}</h2>
                <button onClick={() => setShowDetailModal(false)}><X size={20} /></button>
              </div>
              <div className="detail-body">
                <section>
                  <label>{t('taskViewport.taskName')}</label>
                  <p className="full-title">{text}</p>
                </section>
                <section>
                  <label>{t('taskViewport.detailed')}</label>
                  <p className="detail-text">{detail || text}</p>
                </section>
                <section className="detail-stats">
                  <div className="stat-vessel">
                    <label>{t('taskViewport.focusTime')}</label>
                    <p>{duration}m</p>
                  </div>
                  <div className="stat-vessel">
                    <label>{t('controls.time')}</label>
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
