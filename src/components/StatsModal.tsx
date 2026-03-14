import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
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
  const { t } = useTranslation();
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
              <h2>{t('stats.title')}</h2>
              <button className="close-stats-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="stats-summary-grid">
              <div className="summary-card">
                <span className="summary-label">{t('stats.totalEver')}</span>
                <div className="summary-value">
                  {totalMinutesEver}<span className="summary-unit">{t('header.mins')}</span>
                </div>
              </div>
              <div className="summary-card">
                <span className="summary-label">{t('stats.avg7Days')}</span>
                <div className="summary-value">
                  {Math.round(history.reduce((a, b) => a + b.minutes, 0) / 7)}<span className="summary-unit">{t('header.mins')}</span>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3><BarChart2 size={16} /> {t('stats.last7Days')}</h3>
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

            <div className="stats-header" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
               <button className="confirm-add-btn" onClick={onClose} style={{ width: '100%' }}>
                  {t('stats.close')}
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatsModal;

