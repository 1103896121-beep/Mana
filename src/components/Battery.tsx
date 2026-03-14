import React from 'react';
import { BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';
import './Battery.css';

interface BatteryProps {
  percentage: number;
}

const Battery: React.FC<BatteryProps> = ({ percentage }) => {
  const getBatteryIcon = () => {
    if (percentage > 80) return <BatteryFull size={24} />;
    if (percentage > 30) return <BatteryMedium size={24} />;
    return <BatteryLow size={24} className="battery-critical" />;
  };

  const getStatusClass = () => {
    if (percentage > 60) return 'healthy';
    if (percentage > 20) return 'warning';
    return 'critical';
  };

  return (
    <div className={`apple-battery ${getStatusClass()}`}>
      <div className="battery-icon-wrapper">
        {getBatteryIcon()}
        {percentage > 10 && <Zap size={10} className="charging-bolt" />}
      </div>
      <span className="battery-label">{percentage}%</span>
    </div>
  );
};

export default Battery;
