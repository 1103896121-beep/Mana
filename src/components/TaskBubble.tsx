import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Clock, Calendar, Info, X } from 'lucide-react';
import confetti from 'canvas-confetti';
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

const TaskBubble: React.FC<TaskBubbleProps> = ({ id, text, duration, createdAt, detail, onComplete, onDelete }) => {
  const { t } = useTranslation();
  const [isExploding, setIsExploding] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formattedDate = new Date(createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止 Reorder 拖拽激活
    setIsExploding(true);
    
    // 强化版爆炸动效粒子 - 限制在当前元素或手机容器内
    const end = Date.now() + 1000;
    const colors = ['#007aff', '#EBEBF5', '#64d2ff'];

    // 获取手机容器引用
    const container = document.querySelector('.phone-container');
    
    (function frame() {
      if (!container) return;
      
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 45,
        origin: { x: 0.2, y: 0.7 },
        colors: colors,
        container: container as HTMLElement
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 45,
        origin: { x: 0.8, y: 0.7 },
        colors: colors,
        container: container as HTMLElement
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    setTimeout(() => onComplete(id, duration), 1200);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 关键：阻止 Reorder 拖拽劫持点击
    onDelete(id);
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
        {/* 移除拖拽手柄图标 */}

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
          <button className="action-btn delete-btn" onClick={handleDeleteClick} title="Dissolve">
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
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="detail-modal glass-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="detail-header">
                <h2>{t('taskViewport.detailed')}</h2>
                <button onClick={() => setShowDetailModal(false)}><X size={20}/></button>
              </div>
              <div className="detail-body">
                <section>
                  <label>{t('controls.time')}</label>
                  <p className="full-title">{text}</p>
                </section>
                <section>
                  <label>{t('taskViewport.detailed')}</label>
                  <p className="detail-text">{detail || text}</p>
                </section>
                <section className="detail-stats">
                  <div className="stat-vessel">
                    <label><Clock size={14} />{t('taskViewport.focusTime')}</label>
                    <p>{duration} mins</p>
                  </div>
                  <div className="stat-vessel">
                    <label><Calendar size={14} />{t('controls.time')}</label>
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
