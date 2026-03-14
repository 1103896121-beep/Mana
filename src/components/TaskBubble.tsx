import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Trash2, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { soundUtils } from '../utils/soundUtils';
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
  const [flyingDrop, setFlyingDrop] = useState<{ startX: number, startY: number, endX: number, endY: number, pourY: number } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const dateObj = new Date(createdAt);
  const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止 Reorder 拖拽激活
    if (isExploding) return;
    setIsExploding(true);
    
    // 计算气泡缩成咖啡滴飞向右上角杯子的轨道
    const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cupEl = document.querySelector('.mana-energy-vessel');
    // Fallback 坐标
    let cupRect = { left: window.innerWidth - 60, top: 40, width: 40, height: 70 }; 
    if (cupEl) {
      cupRect = cupEl.getBoundingClientRect();
    }

    const startX = btnRect.left + btnRect.width / 2 - 12;
    const startY = btnRect.top + btnRect.height / 2 - 12;
    // 杯口正上方中心
    const cupTopX = cupRect.left + cupRect.width / 2 - 12;
    const cupTopY = cupRect.top - 20; 
    // 杯底（注入点）
    const cupBottomY = cupRect.top + cupRect.height - 30;

    setFlyingDrop({
      startX,
      startY,
      endX: cupTopX,
      endY: cupTopY,
      pourY: cupBottomY
    });

    // 第一阶段(飞向杯口)大约耗时 0.6s。
    // 我们在 0.6s 时精准播放倒水的物理声音，配合水滴被拉长注入的视觉。
    setTimeout(() => {
      soundUtils.playComplete();
    }, 600);

    // 完整的飞起+注入动画大约 1.2 秒。我们在 0.9 秒时通知 App.tsx 增加液面。
    setTimeout(() => onComplete(id, duration), 900);
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
        animate={{ opacity: isExploding ? 0 : 1, scale: isExploding ? 0 : 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <div className="task-content" onClick={() => setShowDetailModal(true)}>
          <div className="task-header-row">
            <h3 className="task-title-text">{text}</h3>
            {(detail || text.length > 20) && <Info size={16} className="detail-indicator" />}
          </div>
          <div className="task-meta">
            <div className="meta-item">
              <span>{formattedDate}</span>
            </div>
            <div className="meta-item">
              <span>{duration}m</span>
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

      {/* 咖啡变成水流倾倒入杯中动效 (Morphing Pour Animation) */}
      {flyingDrop && createPortal(
        <motion.div
          className="coffee-drop-container"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '24px',
            height: '24px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          initial={{ 
            x: flyingDrop.startX, 
            y: flyingDrop.startY,
            scaleX: 1,
            scaleY: 1,
            opacity: 1 
          }}
          animate={{ 
            // 阶段1：飞往杯口正上方；阶段2：停留在 X 轴，向下扎入杯中
            x: [flyingDrop.startX, flyingDrop.endX, flyingDrop.endX],
            // 阶段1：抛物线向上飞；阶段2：加速跌落入杯体
            y: [flyingDrop.startY, flyingDrop.endY, flyingDrop.pourY],
            // 阶段1：略微收缩宽度；阶段2：进一步变细成水流
            scaleX: [1, 0.7, 0.3],
            // 阶段1：随着重力拉长水滴；阶段2：极度拉伸成完整的涓流线
            scaleY: [1, 1.8, 5],
            // 最后阶段潜入咖啡海中消失
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 1.2, 
            times: [0, 0.5, 1], // 第一阶段0.6s，第二阶段0.6s
            ease: ["easeOut", "easeIn"] // 飞起抛物减速，落下加速
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              backgroundColor: '#4A2810', // 浓咖啡色
              boxShadow: '0 4px 15px rgba(74, 40, 16, 0.6)'
            }}
          />
        </motion.div>,
        document.body
      )}

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
