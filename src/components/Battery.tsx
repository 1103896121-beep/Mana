import React from 'react';
import './Battery.css';

interface BatteryProps {
  percentage: number;
}

const Battery: React.FC<BatteryProps> = ({ percentage }) => {
  const getBatteryColor = () => {
    if (percentage > 60) return '#248a3d'; // 调深绿色
    if (percentage > 20) return '#b8860b'; // 调深黄色/金麒麟色
    return '#8b0000'; // 调深红色
  };

  const batteryStyle = {
    '--battery-percent': `${percentage}%`,
    '--battery-color': getBatteryColor(),
  } as React.CSSProperties;

  return (
    <div className="vertical-battery-container">
      <div className="battery-vessel-v">
        <div className="battery-tip-v" />
        <div className="battery-body-v">
          <div className="battery-level-v" style={batteryStyle} />
          {/* 百分比文字内嵌，支持垂直居中 */}
          <span className="battery-text-v">{Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
};

export default Battery;
