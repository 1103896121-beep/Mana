import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Trash2, X } from 'lucide-react';
import { useTranslation } from '../hooks/use-translation';
import './task-bubble.css';

interface TaskBubbleProps {
  id: string;
  text: string;
  duration: number;
  createdAt: number;
  detail?: string;
  onComplete: (id: string, duration: number) => void;
  onDelete: (id: string) => void;
}

/**
 * 任务气泡组件
 * 展示单个任务的标题、时长及创建日期，支持完成与删除操作。
 * 
 * @param id 任务唯一 ID
 * @param text 任务内容
 * @param duration 预计专注时间
 * @param createdAt 创建时间戳
 * @param detail 详细备注 (可选)
 * @param onComplete 完成任务回调函数，接受任务ID和时长作为参数
 * @param onDelete 删除任务回调函数，接受任务ID作为参数
 */
const TaskBubble: React.FC<TaskBubbleProps> = ({ 
  id, text, duration, createdAt, detail, onComplete, onDelete 
}) => {
  const { t } = useTranslation();
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
              <div className="meta-item"><span>{duration}{t('header.minShort')}</span></div>
            </div>
          </div>

          <div className="bubble-actions">
            <button className="action-btn complete-btn" onClick={handleComplete} title={t('taskViewport.extractEnergy')}>
              <Check size={20} />
            </button>
            <button className="action-btn delete-btn" onClick={handleDeleteClick} title={t('taskViewport.dissolve')}>
              <Trash2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* 气泡爆炸舞台被移除，仅保留音效反馈 */}
      </motion.div>

      {/* 详情弹窗 - 使用 Portal 传送门解决 iOS transform 嵌套导致的定位失效问题 */}
      {showDetailModal && createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            key="detail-portal"
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
                    <p>{duration}{t('header.minShort')}</p>
                  </div>
                  <div className="stat-vessel">
                    <label>{t('controls.time')}</label>
                    <p>{formattedDate}</p>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default TaskBubble;
