import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CareBubble.css';

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
 * 温馨提示泡泡组件
 * 从屏幕底部冒出，点击后经历膨胀->缩小->膨胀->爆裂的过程
 */
const CareBubble: React.FC<CareBubbleProps> = ({ message, onPop }) => {
  // 'idle' -> 'wobbling' (膨胀缩小阶段) -> 'burst' (碎片飞散)
  const [phase, setPhase] = useState<'idle' | 'wobbling' | 'burst'>('idle');
  const [shards, setShards] = useState<Shard[]>([]);

  const handlePop = useCallback(() => {
    if (phase !== 'idle') return;

    // 阶段 1: 膨胀->缩小->膨胀 (600ms)
    setPhase('wobbling');

    // 阶段 2: 爆裂碎片 (600ms 后触发)
    setTimeout(() => {
      setPhase('burst');

      // 生成 14 个碎片，飞散距离限制在屏幕内
      const newShards: Shard[] = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        angle: (i * 25.7) + (Math.random() - 0.5) * 15,
        distance: 60 + Math.random() * 60, // 限制飞散距离，避免溢出
        size: 5 + Math.random() * 10,
        color: SHARD_COLORS[i % SHARD_COLORS.length],
      }));
      setShards(newShards);

      // 碎片动画结束后清理
      setTimeout(() => {
        setPhase('idle');
        setShards([]);
        onPop();
      }, 700);
    }, 600);
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
                  ? { duration: 0.6, times: [0, 0.3, 0.6, 1], ease: 'easeInOut' }
                  : { type: 'spring', stiffness: 200, damping: 18, mass: 0.8 }
              }
              onClick={(e) => {
                e.stopPropagation();
                handlePop();
              }}
            >
              <span className="care-bubble-text">{message}</span>
              <span className="bubble-tap-hint">tap to pop</span>
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
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.2,
                      ease: 'easeOut',
                    }}
                    style={{
                      width: shard.size,
                      height: shard.size,
                      background: shard.color,
                      boxShadow: `0 0 8px ${shard.color}`,
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
