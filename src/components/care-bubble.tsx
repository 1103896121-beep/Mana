import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/use-translation';
import { soundUtils } from '../utils/sound-utils';
import './care-bubble.css';

interface CareBubbleProps {
  message: string | null;
  onPop: () => void;
}

/** 爆裂碎片数据 */
interface Shard {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  duration: number;
}

const SHARD_COLORS = [
  'rgba(173, 216, 255, 0.7)',
  'rgba(200, 180, 255, 0.6)',
  'rgba(255, 200, 220, 0.6)',
  'rgba(255, 255, 255, 0.5)',
  'rgba(150, 230, 255, 0.6)',
  'rgba(220, 200, 255, 0.5)',
];

/**
 * 温馨提示气泡组件
 * 从屏幕底部冒出，点击后经历膨胀->缩小->膨胀->爆裂的解压过程。
 * 设计意图：通过有机物理感交互缓解专注后的心理压力。
 * 
 * @param message 展示的文本内容，为 null 时自动隐藏
 * @param onPop 点击气泡爆破后的回调函数
 */
const CareBubble: React.FC<CareBubbleProps> = ({ message, onPop }) => {
  const { t } = useTranslation();
  // 'idle' -> 'wobbling' (膨胀缩小阶段) -> 'burst' (碎片飞散)
  const [phase, setPhase] = useState<'idle' | 'wobbling' | 'burst'>('idle');
  const [shards, setShards] = useState<Shard[]>([]);

  const handlePop = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('wobbling');
  }, [phase]);

  const handleWobbleComplete = useCallback(() => {
    if (phase !== 'wobbling') return;
    
    setPhase('burst');
    // 触发解压震动
    soundUtils.playPop();
    
    // 生成 24 个碎片 (原来是14个)，让破碎感更细腻
    // 距离大幅减小，确保绝对不会飞出屏幕边界
    const newShards: Shard[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      angle: (i * 15) + (Math.random() - 0.5) * 10,
      distance: 60 + Math.random() * 80, // 恢复并放大了飞散距离，因为容器已做了严格的溢出裁剪
      size: 5 + Math.random() * 12, // 碎片变大一点，视觉冲击力更强
      color: SHARD_COLORS[i % SHARD_COLORS.length],
      duration: 0.8 + Math.random() * 0.4, // 将随机时长放在渲染外计算
    }));
    setShards(newShards);

    // 碎片动画结束后清理 (延长至 1.2s，让碎片慢慢消失)
    setTimeout(() => {
      setPhase('idle');
      setShards([]);
      onPop();
    }, 1200);
  }, [phase, onPop]);

  return (
    <AnimatePresence>
      {(message || phase !== 'idle') && (
        <motion.div
          className="care-bubble-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handlePop}
        >
          {/* 泡泡本体 */}
          {phase !== 'burst' && (
            <motion.div
              className={`care-bubble ${phase === 'wobbling' ? 'wobbling' : ''}`}
              style={{ pointerEvents: 'auto' }} /* Build 21: 确保泡泡本体可点击 */
              initial={{ y: 300, scale: 0.3, opacity: 0 }}
              animate={
                phase === 'wobbling'
                  ? {
                      y: 0,
                      // 膨胀(1.15) -> 缩小(0.85) -> 膨胀爆裂(1.4) + 消失
                      scale: [1, 1.15, 0.85, 1.4],
                      opacity: [1, 1, 1, 0],
                    }
                  : { y: 0, scale: 1, opacity: 1 }
              }
              transition={
                phase === 'wobbling'
                  ? { duration: 0.8, times: [0, 0.35, 0.65, 1], ease: 'easeInOut' } // 同步延长到 0.8s
                  : { type: 'spring', stiffness: 200, damping: 18, mass: 0.8 }
              }
              onAnimationComplete={() => {
                if (phase === 'wobbling') {
                  handleWobbleComplete();
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePop();
              }}
            >
              <span className="care-bubble-text">{message}</span>
              <span className="bubble-tap-hint">{t('carePrompt.tapToPop')}</span>
            </motion.div>
          )}

          {/* 爆裂碎片 */}
          {phase === 'burst' && (
            <div className="bubble-shards-container">
              {shards.map((shard) => {
                const rad = (shard.angle * Math.PI) / 180;
                const tx = Math.cos(rad) * shard.distance;
                const ty = Math.sin(rad) * shard.distance;
                return (
                  <motion.div
                    key={shard.id}
                    className="bubble-shard"
                    initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                    animate={{
                      x: tx,
                      y: ty,
                      scale: 0, // 慢慢缩成0
                      opacity: 0, // 慢慢变透明
                    }}
                    transition={{
                      duration: shard.duration, // 碎片飘散时间延长 (从 0.5-0.7 增加到 0.8-1.2)
                      ease: 'easeOut',
                    }}
                    style={{
                      width: shard.size,
                      height: shard.size,
                      background: shard.color,
                      boxShadow: `0 0 10px ${shard.color}`, // 发光稍微增强一点
                    }}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CareBubble;
