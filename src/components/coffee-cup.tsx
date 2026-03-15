/* eslint-disable react-hooks/purity */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './coffee-cup.css';

interface CoffeeCupProps {
  percentage: number;
  isBubbling?: boolean;
}

/**
 * 咖啡杯显示组件
 * 实现基于 percentage 的液面高度变化、波浪动画以及能量注入时的冒泡粒子效果。
 * 采用了玻璃拟态（Glassmorphism）视觉设计。
 * 
 * @param percentage 咖啡液位百分比 (0-100)
 * @param isBubbling 是否正在注入能量（触发冒泡动画）
 */
const CoffeeCup: React.FC<CoffeeCupProps> = ({ percentage, isBubbling = false }) => {
  // 醇厚温暖的咖啡/拿铁渐变
  const getLiquidGradient = () => {
    if (percentage > 80) return ['#A0522D', '#5C4033']; 
    if (percentage > 40) return ['#CD853F', '#8B4513']; 
    return ['#DEB887', '#A0522D']; 
  };
  
  const [lightColor, darkColor] = getLiquidGradient();

  const cupStyle = {
    '--coffee-percent': `${percentage}%`,
    '--coffee-dark': darkColor,
    '--coffee-light': lightColor,
  } as React.CSSProperties;

  // Pre-calculate random values for bubbles to ensure render purity
  const bubbles = React.useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      left: `${20 + Math.random() * 60}%`,
      xOffset: (Math.random() - 0.5) * 20,
      duration: 1 + Math.random() * 1,
      delay: i * 0.2
    }));
  }, []);

  return (
    <div className="coffee-cup-container" style={cupStyle}>
      {/* 底部投射阴影与把手的倒影在同一个层级 */}
      <div className="cute-mug-shadow">
        <div className="shadow-body"></div>
        <div className="shadow-handle"></div>
      </div>

      <div className="cute-mug-wrapper">
        {/* 热气蒸汽效果 */}
        {percentage > 0 && (
          <div className="steam-container">
            <div className="steam-line steam-1"></div>
            <div className="steam-line steam-2"></div>
            <div className="steam-line steam-3"></div>
          </div>
        )}

        {/* 把手 (The Glass Handle) */}
        <div className="cute-mug-handle"></div>

        {/* 主杯体 (Chubby Main Body) */}
        <div className="cute-mug-body">
          {/* 液面与波浪 */}
          <div className="cute-liquid-container">
            <div className="cute-wave back"></div>
            <div className="cute-wave front"></div>
            <div className="cute-liquid-fill"></div>
            
            {/* 液面反光 */}
            <div className="liquid-surface-glow"></div>
          </div>

          {/* 玻璃感反光与折射 */}
          <div className="cute-highlight left"></div>
          <div className="cute-highlight right"></div>
          <div className="cute-highlight bottom"></div>
          
          {/* 能量注入冒泡效果 */}
          <AnimatePresence>
            {isBubbling && (
              <div className="bubble-infusion-layer">
                {bubbles.map((bubble) => (
                  <motion.div
                    key={bubble.id}
                    className="infusion-bubble"
                    initial={{ bottom: '-10%', left: bubble.left, opacity: 0, scale: 0.5 }}
                    animate={{ 
                      bottom: '90%', 
                      opacity: [0, 0.8, 0],
                      scale: [0.5, 1, 0.8],
                      x: [0, bubble.xOffset, 0]
                    }}
                    transition={{ 
                      duration: bubble.duration, 
                      repeat: Infinity,
                      delay: bubble.delay
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* 增加把手在玻璃杯体上的折射倒影 */}
          <div className="handle-glass-reflection"></div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCup;
