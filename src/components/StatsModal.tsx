import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, BarChart2 } from 'lucide-react';
import './StatsModal.css';

interface DailyLog {
  date: string;
  minutes: number;
  count: number;
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DailyLog[];
  totalMinutesEver: number;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, history, totalMinutesEver }) => {
  const maxMins = Math.max(...history.map(h => h.minutes), 60);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="stats-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="stats-modal glass-panel elevated"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="stats-header">
              <h2>Analytics</h2>
              <button className="close-stats-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="stats-summary-grid">
              <div className="summary-card">
                <span className="summary-label">Total Energy</span>
                <div className="summary-value">
                  {totalMinutesEver}<span className="summary-unit">mins</span>
                </div>
              </div>
              <div className="summary-card">
                <span className="summary-label">7-Day Avg</span>
                <div className="summary-value">
                  {Math.round(history.reduce((a, b) => a + b.minutes, 0) / 7)}<span className="summary-unit">mins</span>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3><BarChart2 size={16} /> Last 7 Days</h3>
              <div className="bar-chart">
                {history.map((day, i) => (
                  <div key={day.date} className="bar-container" style={{ position: 'relative' }}>
                    <motion.div 
                      className="bar"
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.minutes / maxMins) * 100}%` }}
                      style={{ 
                        background: i === history.length - 1 ? 'var(--color-accent)' : 'var(--color-primary)',
                        opacity: i === history.length - 1 ? 1 : 0.6
                      }}
                    />
                    <span className="bar-label">{day.date.split('-').slice(1).join('/')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stats-insight summary-card">
              <TrendingUp size={24} color="var(--color-primary)" />
              <p style={{ fontSize: '0.9rem', lineHeight: '1.4', marginTop: '8px' }}>
                {history[history.length-1].minutes > history[history.length-2]?.minutes 
                  ? "Your energy output is trending upwards today. Maintain the flow." 
                  : "Consider a lighter load today to preserve your long-term energy reserve."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatsModal;
