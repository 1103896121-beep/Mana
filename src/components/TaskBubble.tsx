import React, { useState, useRef } from 'react';
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
  currentLevel: number;
  onComplete: (id: string, duration: number) => void;
  onDelete: (id: string) => void;
}

const TaskBubble: React.FC<TaskBubbleProps> = ({ id, text, duration, createdAt, detail, currentLevel, onComplete, onDelete }) => {
  const { t } = useTranslation();
  const [isExploding, setIsExploding] = useState(false);
  const [flyingDrop, setFlyingDrop] = useState<{
    startX: number, startY: number,
    startW: number, startH: number,
    topX: number, topY: number,
    pourY: number
  } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const dragStartPos = useRef<{ x: number, y: number } | null>(null);

  const dateObj = new Date(createdAt);
  const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExploding) return;

    // Play the pour sound centered around the drop landing
    setTimeout(() => {
      soundUtils.playComplete(currentLevel);
    }, 1200);

    const cardEl = (e.currentTarget as HTMLElement).closest('.task-bubble-item');
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();

    const cupEl = document.querySelector('.mana-energy-vessel');
    const appEl = document.querySelector('.app-container');
    
    // 默认回退值
    let cupRect = { left: window.innerWidth - 80, top: 40, width: 80, height: 100 };
    let appRect = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };

    if (cupEl) cupRect = cupEl.getBoundingClientRect();
    if (appEl) appRect = appEl.getBoundingClientRect();

    const startX = rect.left;
    const startY = rect.top;
    const startW = rect.width;
    const startH = rect.height;

    // -- 容器感知型坐标计算 (Container-Aware Coordinates) --
    // 1. 水杯正上方位置：水平居中于杯口，垂直距离杯口 60-80px，但绝不能超出 app 容器顶端 (留出 20px 安全边距)
    const cupTopX = Math.min(
      Math.max(appRect.left + 20, cupRect.left + (cupRect.width / 2) - 15), 
      appRect.right - 40
    );
    
    // 关键修复：确保抛物线顶点在容器内，考虑 44px 的圆角和边框
    const cupTopY = Math.max(appRect.top + 30, cupRect.top - 80); 

    // 2. 坠入液面的实际落点 (杯中液体表面)，同样限制在容器底端内
    const cupBottomY = Math.min(cupRect.top + 30, appRect.bottom - 20);

    setFlyingDrop({
      startX, startY, startW, startH,
      topX: cupTopX,
      topY: cupTopY,
      pourY: cupBottomY
    });

    setIsExploding(true); // 隐藏原本的卡片

    setTimeout(() => onComplete(id, duration), 1850);
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
        animate={{ opacity: isExploding ? 0 : 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onPointerDown={(e) => {
          dragStartPos.current = { x: e.clientX, y: e.clientY };
        }}
      >
        <div
          className="task-content"
          onClick={(e) => {
            // 防抖：检测用户是“单纯点击”还是“拖拽后松开”
            if (dragStartPos.current) {
              const dx = Math.abs(e.clientX - dragStartPos.current.x);
              const dy = Math.abs(e.clientY - dragStartPos.current.y);
              // 如果鼠标移动距离超过 5 像素，判定为拖拽，不触发点击弹窗
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
            <div className="meta-item">
              <span>{formattedDate}</span>
            </div>
            <div className="meta-item">
              <span>{duration}m</span>
            </div>
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

      {/* 变成一颗晶莹水滴升至杯口上方，再垂直滴入水面特效 */}
      {flyingDrop && createPortal(
        <motion.div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // 默认方形
            borderTopLeftRadius: '20px',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px',
            borderTopRightRadius: '20px'
          }}
          initial={{
            x: flyingDrop.startX,
            y: flyingDrop.startY,
            width: flyingDrop.startW,
            height: flyingDrop.startH,
            backgroundColor: 'rgba(20, 20, 22, 0.8)',
            rotate: 0,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
          }}
          animate={{ 
            // 阶段一(0-0.2)：引力坍缩 (Gravitational Implosion) - 卡片瞬间收缩成质点
            // 阶段二(0.2-0.5)：能量绽放 (Energy Bloom) - 从核心膨胀成晶莹剔透的水状球体
            // 阶段三(0.5-0.8)：慢镜抛载 (Cinematic Ascent) - 极具动感的抛物线上升，在顶点有微小停滞
            // 阶段四(0.8-1.0)：重力坠入 (Gravity Plunge) - 笔直坠落
            x: [
              flyingDrop.startX, 
              flyingDrop.startX + (flyingDrop.startW / 2) - 10, // 坍缩中心
              flyingDrop.topX, 
              flyingDrop.topX
            ],
            y: [
              flyingDrop.startY, 
              flyingDrop.startY + (flyingDrop.startH / 2) - 10, // 坍缩中心
              flyingDrop.topY,  // 直接使用 topY，不再减 15 防止飞出
              flyingDrop.pourY
            ],
            width: [flyingDrop.startW, 12, 35, 20],
            height: [flyingDrop.startH, 12, 35, 45],
            borderRadius: [
              '20px 20px 20px 20px', 
              '50% 50% 50% 50%', // 坍缩成圆点
              '60% 40% 60% 40% / 40% 60% 40% 60%', // 绽放时的不规则液态
              '50% 50% 50% 5%'  // 标准泪滴
            ],
            scale: [1, 0.4, 1.2, 1],
            rotate: [0, 180, 270, 0], // 旋转增加动感
            backgroundColor: [
              'rgba(28, 28, 30, 0.98)', 
              '#FFFFFF', // 坍缩瞬间的极亮白光
              '#5C4033', // 绽放出的热咖啡色 (Rich Coffee)
              '#3E2723'  // 最终沉入底部的深咖啡色
            ],
            boxShadow: [
              '0 10px 30px rgba(0, 0, 0, 0.3)', 
              '0 0 40px #FFFFFF', 
              '0 0 25px rgba(92, 64, 51, 0.6)', 
              '0 0 0 transparent'
            ],
            opacity: [1, 1, 1, 0]
          }}
          transition={{ 
            duration: 1.8, // 奢侈的慢动作时长
            times: [0, 0.2, 0.6, 1], 
            ease: [
              [0.23, 1, 0.32, 1], // 快切坍缩
              [0.34, 1.56, 0.64, 1], // 弹性绽放
              [0.455, 0.03, 0.515, 0.955], // 顶点缓动
              [0.6, 0.04, 0.98, 0.335] // 重力加速掉落
            ] as any
          }}
        >
          <motion.span
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              whiteSpace: 'nowrap',
              transform: 'rotate(45deg)' /* 抵消外层旋转防文字错位 */
            }}
          >
            {text}
          </motion.span>
        </motion.div>,
        document.body
      )}

      {/* 掉入水中时的波纹溅射效果 (Splash Ripple) */}
      {flyingDrop && createPortal(
        <motion.div
          style={{
            position: 'fixed',
            left: flyingDrop.topX - 10,  // 对准水滴的落点
            top: flyingDrop.pourY + 10,
            zIndex: 9998,
            pointerEvents: 'none',
            border: '2px solid rgba(139, 69, 19, 0.6)', /* 咖啡色涟漪 */
            borderRadius: '50%',
            transform: 'scaleX(2.5)' // 将圆压扁成为透视水面波纹
          }}
          initial={{ width: 0, height: 0, opacity: 0, x: 24, y: 14 }}
          animate={{
            width: [0, 0, 60],
            height: [0, 0, 60],
            opacity: [0, 0, 1, 0],
            x: [24, 24, -6], // 补偿半径扩大
            y: [14, 14, -16]
          }}
          transition={{ duration: 1.1, times: [0, 0.8, 1], ease: "easeOut" }}
        />,
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
