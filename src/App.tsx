import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Moon, Sun, Trash2, Languages, BarChart2, Info } from 'lucide-react';
import TaskBubble from './components/task-bubble';
import CoffeeCup from './components/coffee-cup';
import CareBubble from './components/care-bubble';
import StatsModal from './components/stats-modal';
import { useTranslation } from './hooks/use-translation';
import iapUtils, { IAP_IDS } from './utils/iap-utils';
import { useMana } from './hooks/use-mana';
import type { DailyLog } from './hooks/use-mana';
import './App.css';

type SortField = 'createdAt' | 'duration' | 'manual';
type SortOrder = 'asc' | 'desc';

/**
 * Mana 应用核心容器
 * 采用极简主义设计，集成了任务流管理、咖啡能量可视化、历史统计及内购打赏功能。
 * 适配 iOS 原生交互体验，支持深色模式与全量国际化。
 */
const App: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const {
    tasks,
    setTasks,
    coffeeLevel,
    careMessage,
    setCareMessage,
    isBubbling,
    addTask: performAddTask,
    handleCompleteTask,
    deleteTask,
    clearExpiredTasks,
    getHistory
  } = useMana();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('mana_theme') as 'dark' | 'light';
    return savedTheme || 'dark';
  });

  const [showInput, setShowInput] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDetail, setNewTaskDetail] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  
  const [confirmAction, setConfirmAction] = useState<{ type: 'single', id: string } | { type: 'clear' } | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('mana_theme', newTheme);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const addTask = () => {
    if (!newTaskText) return;
    performAddTask(newTaskText, newTaskDetail, newTaskDuration);
    setNewTaskText('');
    setNewTaskDetail('');
    setShowInput(false);
    setSortField('manual');
  };

  const handleComplete = (id: string, duration: number) => {
    handleCompleteTask(id, duration);
  };

  const handleDelete = (id: string) => {
    setConfirmAction({ type: 'single', id });
  };

  const confirmDelete = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'single') {
      deleteTask(confirmAction.id);
    } else if (confirmAction.type === 'clear') {
      clearExpiredTasks();
    }
    setConfirmAction(null);
  };

  const displayTasks = useMemo(() => {
    if (sortField === 'manual') return tasks;
    return [...tasks].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortOrder === 'desc' ? Number(valB) - Number(valA) : Number(valA) - Number(valB);
    });
  }, [tasks, sortField, sortOrder]);

  const cycleSort = (field: Exclude<SortField, 'manual'>) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const appStyle = {
    '--mana-rgb': '210, 105, 30',
    '--mana-intensity': (coffeeLevel / 100) * 0.15
  } as React.CSSProperties;

  return (
    <div className="app-container" style={appStyle}>
      <header className="mana-header apple-header">
        <div className={`header-top ${language === 'en' ? 'layout-en' : ''}`}>
          <div className="mana-header-main">
            <div className="mana-energy-vessel">
              <CoffeeCup percentage={coffeeLevel} isBubbling={isBubbling} />
            </div>
          </div>
          <div className="header-actions-group">
            <button className="language-toggle action-icon-btn utility-btn" onClick={toggleLanguage}>
              <Languages size={20} />
            </button>
            <button className="theme-toggle action-icon-btn utility-btn" onClick={() => setShowAbout(true)} title={t('about.title')}>
              <Info size={20} />
            </button>
            <button className="theme-toggle action-icon-btn utility-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        <div className="task-list-header">
          <h2>{t('taskViewport.title')}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className={`add-task-btn stats-trigger-header ${showStats ? 'active' : ''}`} onClick={() => setShowStats(true)}>
              <BarChart2 size={24} />
            </button>
            <button className={`add-task-btn ${showInput ? 'active' : ''}`} onClick={() => setShowInput(!showInput)}>
              <Plus size={36} />
            </button>
          </div>
        </div>
      </header>

      <main className="task-viewport">
        <AnimatePresence>
          {showInput && (
            <>
              <motion.div className="panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInput(false)} />
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="quick-add-panel glass-panel elevated">
                <div className="input-field">
                  <input autoFocus type="text" placeholder={t('taskViewport.placeholder')} maxLength={50} value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} />
                </div>
                <div className="detail-input-area">
                  <textarea placeholder={t('taskViewport.detailPlaceholder')} maxLength={300} value={newTaskDetail} onChange={(e) => setNewTaskDetail(e.target.value)} />
                  <div className="char-count">{newTaskDetail.length}/300</div>
                </div>
                <div className="duration-selector">
                  <label>{t('taskViewport.focusTime')}: {newTaskDuration} {t('header.mins')}</label>
                  <input type="range" min="5" max="300" step="5" value={newTaskDuration} onChange={(e) => setNewTaskDuration(Number(e.target.value))} style={{ '--range-percent': `${((newTaskDuration - 5) / 295) * 100}%` } as React.CSSProperties} />
                </div>
                <button className="confirm-add-btn" onClick={addTask}>{t('taskViewport.establishBtn')}</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="controls-bar">
          <div className="sorting-controls">
            <button className={`sort-btn ${sortField === 'createdAt' ? 'active' : ''}`} onClick={() => cycleSort('createdAt')}>
              {t('controls.time')} {sortField === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button className={`sort-btn ${sortField === 'duration' ? 'active' : ''}`} onClick={() => cycleSort('duration')}>
              {t('controls.duration')} {sortField === 'duration' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
          <button className="clear-expired-btn-mini" onClick={() => setConfirmAction({ type: 'clear' })}>
            <Trash2 size={18} />
          </button>
        </div>
        
        <Reorder.Group axis="y" values={displayTasks} onReorder={setTasks} className="bubble-list-container">
          <AnimatePresence mode="popLayout">
            {displayTasks.map(task => (
              <Reorder.Item key={task.id} value={task}>
                <TaskBubble {...task} onComplete={handleComplete} onDelete={handleDelete} />
              </Reorder.Item>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && !showInput && <div className="empty-state"><p>{t('taskViewport.emptyState')}</p></div>}
        </Reorder.Group>
      </main>

      {/* 温馨提示泡泡 */}
      <CareBubble message={careMessage} onPop={() => setCareMessage(null)} />

      <AnimatePresence>
        {confirmAction && (
          <motion.div className="panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmAction(null)} style={{ zIndex: 3000 }}>
            <motion.div className="confirm-modal glass-panel" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()}>
              <h3>{confirmAction.type === 'single' ? t('common.confirmDelete') : t('common.clearExpired')}</h3>
              <p>{confirmAction.type === 'single' ? t('deleteConfirm') : t('clearConfirm')}</p>
              <div className="confirm-actions">
                <button className="cancel-btn" onClick={() => setConfirmAction(null)}>{t('common.cancel')}</button>
                <button className="confirm-delete-btn" onClick={confirmDelete}>{confirmAction.type === 'single' ? t('common.dissolve') : t('common.clear')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAbout && (
          <motion.div className="panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAbout(false)} style={{ zIndex: 3000 }}>
            <motion.div className="confirm-modal glass-panel" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()}>
              <h3>{t('about.title')}</h3>
              <div style={{ textAlign: 'left', marginTop: '8px', marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: '8px', fontSize: '1rem' }}>{t('about.privacyTitle')}</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--color-text-muted)', textAlign: 'left', margin: 0 }}>{t('about.privacyText')}</p>
              </div>

              {/* 打赏区域 Tip Jar */}
              <div className="tip-jar-section">
                <h4 style={{ color: 'var(--color-primary)', marginBottom: '8px', fontSize: '1rem' }}>{t('tipJar.title')}</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'left' }}>{t('tipJar.desc')}</p>
                <div className="tip-buttons">
                  <button 
                    className="tip-btn" 
                    disabled={isPurchasing}
                    onClick={async () => {
                      setIsPurchasing(true);
                      const success = await iapUtils.purchase(IAP_IDS.coffee);
                      setIsPurchasing(false);
                      if (success) alert(t('tipJar.success'));
                    }}
                  >
                    ☕ {t('tipJar.coffee')} <span>{t('tipJar.coffeePrice')}</span>
                  </button>
                  <button 
                    className="tip-btn premium" 
                    disabled={isPurchasing}
                    onClick={async () => {
                      setIsPurchasing(true);
                      const success = await iapUtils.purchase(IAP_IDS.lunch);
                      setIsPurchasing(false);
                      if (success) alert(t('tipJar.success'));
                    }}
                  >
                    🍔 {t('tipJar.lunch')} <span>{t('tipJar.lunchPrice')}</span>
                  </button>
                </div>
                {isPurchasing && <p style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '8px' }}>{t('tipJar.purchasing')}</p>}
              </div>

              <div className="confirm-actions" style={{ marginTop: '20px' }}>
                <button className="cancel-btn" style={{ width: '100%', flex: 'none' }} disabled={isPurchasing} onClick={() => setShowAbout(false)}>{t('about.close')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatsModal  
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        history={getHistory()} 
        totalMinutesEver={getHistory().reduce((acc: number, curr: DailyLog) => acc + curr.minutes, 0)} 
      />
    </div>
  );
};

export default App;
