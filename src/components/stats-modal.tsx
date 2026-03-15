import React, { useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { X, BarChart2, Flame } from 'lucide-react';
import { useTranslation } from '../hooks/use-translation';
import type { DailyLog } from '../hooks/use-mana';
import './stats-modal.css';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DailyLog[];
  totalMinutesEver: number;
}

// 动画数字组件 (从0滚动到目标值)
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const springValue = useSpring(0, { stiffness: 60, damping: 15 });
  const displayValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return <motion.span>{displayValue}</motion.span>;
};

/**
 * 统计分析弹窗组件
 * 展示最近 7 天的专注趋势图表、累计时长及日均时长。
 * 图表采用自适应高度的 motion.div 实现。
 */
const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, history, totalMinutesEver }) => {
  const { t } = useTranslation();
  
  // 确保图表有7天的数据（哪怕某天是0）
  const paddedHistory = React.useMemo(() => {
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // 简化处理：实际项目可能需要生成连续日历。目前假如有数据则用数据，否则这里为了简便直接依赖App传来的过滤。
    // 为了美观，至少保证渲染出7根柱子，如果没有7天数据，在前面补空日志
    const result = [...sorted];
    while (result.length < 7) {
      result.unshift({ date: `-(pad${result.length})-`, minutes: 0, count: 0 });
    }
    return result.slice(-7); // 只取最近7天
  }, [history]);

  const maxMins = Math.max(...paddedHistory.map(h => h.minutes), 60);
  const avg7Days = Math.round(paddedHistory.reduce((a, b) => a + b.minutes, 0) / 7);

  // 分析最强一天
  const bestDay = [...paddedHistory].sort((a, b) => b.minutes - a.minutes)[0];

  const todayStr = new Date().toDateString();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="stats-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div 
            className="stats-modal"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                  <AnimatedNumber value={totalMinutesEver} />
                  <span className="summary-unit">{t('header.mins')}</span>
                </div>
              </div>
              <div className="summary-card">
                <span className="summary-label">{t('stats.avg7Days')}</span>
                <div className="summary-value">
                  <AnimatedNumber value={avg7Days} />
                  <span className="summary-unit">{t('header.mins')}</span>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3><BarChart2 size={18} /> {t('stats.last7Days')}</h3>
              <div className="bar-chart">
                {paddedHistory.map((day, i) => {
                  const isToday = day.date === todayStr;
                  const label = day.date.includes('pad') ? '' : day.date.split('-').slice(1).join('/');
                  
                  return (
                    <div key={`${day.date}-${i}`} className="bar-container">
                      <div className="bar-hover-area" />
                      
                      {/* 高级柱体：基础高度加上动态高度 */}
                      <motion.div 
                        className={`bar ${isToday ? 'today' : ''}`}
                        initial={{ height: '4px' }}
                        animate={{ height: `max(4px, ${(day.minutes / maxMins) * 100}%)` }}
                        transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                      />
                      
                      <span className={`bar-label ${isToday ? 'today' : ''}`}>{label}</span>

                      {/* Tooltip 悬浮或点击触发展示 */}
                      {day.minutes > 0 && (
                        <div className="chart-tooltip">
                           <span className={`tooltip-val ${isToday ? 'today' : ''}`}>{day.minutes}</span>
                           {t('header.mins')} ({day.count} {t('header.completed')})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {bestDay && bestDay.minutes > 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-10px' }}>
                  <Flame size={14} color="#ff9500" />
                  {t('stats.bestDay').replace('{{date}}', bestDay.date.split('-').slice(1).join('/')).replace('{{mins}}', String(bestDay.minutes))}
                </div>
              )}
            </div>

            <button className="confirm-add-btn" onClick={onClose}>
              {t('stats.close')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatsModal;

