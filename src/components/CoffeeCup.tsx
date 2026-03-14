import React from 'react';
import './CoffeeCup.css';

interface CoffeeCupProps {
  percentage: number;
}

const CoffeeCup: React.FC<CoffeeCupProps> = ({ percentage }) => {
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

  return (
    <div className="coffee-cup-container" style={cupStyle}>
      {/* 底部投射阴影与把手的倒影在同一个层级 */}
      <div className="cute-mug-shadow">
        <div className="shadow-body"></div>
        <div className="shadow-handle"></div>
      </div>

      <div className="cute-mug-wrapper">
        
        {/* 已按用户要求移除把手，保留最纯净的玻璃形态 */}

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
          
          {/* 增加把手在玻璃杯体上的折射倒影 */}
          <div className="handle-glass-reflection"></div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCup;
