import React from 'react';
import './CoffeeCup.css';

interface CoffeeCupProps {
  percentage: number;
}

const CoffeeCup: React.FC<CoffeeCupProps> = ({ percentage }) => {
  // 高级渐变色：底部的咖啡较深，顶部的咖啡略浅透光
  const getCoffeeGradient = () => {
    if (percentage > 80) return ['#2A1608', '#4A2810']; 
    if (percentage > 40) return ['#3A2012', '#6F3E18']; 
    return ['#4A2B11', '#8C5226']; 
  };
  
  const [darkColor, lightColor] = getCoffeeGradient();

  const cupStyle = {
    '--coffee-percent': `${percentage}%`,
    '--coffee-dark': darkColor,
    '--coffee-light': lightColor,
  } as React.CSSProperties;

  return (
    <div className="coffee-cup-container" style={cupStyle}>
      <div className="cup-wrapper sleek-wireframe">
        {/* Sleek Neon Wireframe SVG Cup */}
        <svg viewBox="0 0 80 90" className="cup-svg-vessel">
          <defs>
            {/* 咖啡液体发光渐变 */}
            <linearGradient id="coffee-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--coffee-dark)" />
              <stop offset="100%" stopColor="var(--coffee-light)" />
            </linearGradient>

            {/* 线框发光渐变 */}
            <linearGradient id="wireframe-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
            </linearGradient>

            <clipPath id="cup-clip">
              <path d="M 12 5 L 48 5 L 44 72 C 43 78 39 82 30 82 C 21 82 17 78 16 72 Z" />
            </clipPath>
          </defs>
          
          {/* 1. 杯子把手 - 纤细发光线 */}
          <path 
            d="M 48 24 C 75 24 75 58 45 58" 
            fill="none" 
            stroke="url(#wireframe-glow)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="cup-handle glow-stroke"
          />

          {/* 2. 内部波动咖啡流体 */}
          <foreignObject x="0" y="0" width="80" height="90" clipPath="url(#cup-clip)">
            <div className="liquid-svg-wrapper">
              <div className="wave-layer back" />
              <div className="wave-layer" />
              <div className="liquid-body" />
            </div>
          </foreignObject>

          {/* 3. 外层主线框 (Wireframe Body) */}
          <path 
            d="M 8 5 L 52 5 L 48 72 C 46 80 40 85 30 85 C 20 85 14 80 12 72 Z" 
            fill="none" 
            stroke="url(#wireframe-glow)" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
            className="cup-body glow-stroke main-outline"
          />
        </svg>
      </div>
    </div>
  );
};

export default CoffeeCup;
