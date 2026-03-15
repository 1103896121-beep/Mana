import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Moon, Sun, Trash2, Languages, BarChart2 } from 'lucide-react';
import TaskBubble from './components/TaskBubble';
import CoffeeCup from './components/CoffeeCup';
import CareBubble from './components/CareBubble';
import StatsModal from './components/StatsModal';
import { useTranslation } from './hooks/useTranslation';
import { CARE_PROMPTS } from './i18n/translations';
import { soundUtils } from './utils/soundUtils';
import './App.css';

interface Task {
  id: string;
  text: string;
  duration: number;
  createdAt: number;
  detail?: string;
}

interface DailyLog {
  date: string;
  minutes: number;
  count: number;
}

type SortField = 'createdAt' | 'duration' | 'manual';
type SortOrder = 'asc' | 'desc';

const App: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('mana_theme') as 'dark' | 'light';
    return savedTheme || 'dark';
  });
  const [showInput, setShowInput] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDetail, setNewTaskDetail] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [completedCountToday, setCompletedCountToday] = useState(0);
  const [coffeeLevel, setCoffeeLevel] = useState(0);
  const [careMessage, setCareMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'single', id: string } | { type: 'expired' } | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isBubbling, setIsBubbling] = useState(false);
  // 记录完成时间戳，用于检测 30 分钟内连续 3 条的 intensity 触发
  const completionTimestampsRef = useRef<number[]>([]);
  // 记录上次触发 deepFocus 时的分钟数，避免重复触发
  const lastDeepFocusTriggerRef = useRef<number>(0);

  // 初始化与重置逻辑
   
  useEffect(() => {
    document.body.dataset.theme = theme;
    
    const today = new Date().toDateString();
    const lastActiveDate = localStorage.getItem('mana_last_active_date');
    
    if (lastActiveDate !== today) {
      setTotalFocusMinutes(0);
      setCompletedCountToday(0);
      setCoffeeLevel(0);
      localStorage.setItem('mana_last_active_date', today);
    } else {
      const savedStats = localStorage.getItem('mana_daily_stats_v5');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setTotalFocusMinutes(stats.minutes || 0);
        setCompletedCountToday(stats.count || 0);
        setCoffeeLevel(Math.min(100, (stats.count || 0) * 20));
      }
    }

    const savedTasks = localStorage.getItem('mana_tasks_v6');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    soundUtils.init();
  }, []);

  // 持久化
  useEffect(() => {
    localStorage.setItem('mana_tasks_v6', JSON.stringify(tasks));
    localStorage.setItem('mana_theme', theme);
    localStorage.setItem('mana_daily_stats_v5', JSON.stringify({
      minutes: totalFocusMinutes,
      count: completedCountToday
    }));

    // Record daily log for stats history (simple implementation)
    const today = new Date().toDateString();
    const historyData = localStorage.getItem('mana_stats_history_v2');
    let history: DailyLog[] = historyData ? JSON.parse(historyData) : [];
    
    const todayIndex = history.findIndex(h => h.date === today);
    if (todayIndex >= 0) {
      history[todayIndex] = { date: today, minutes: totalFocusMinutes, count: completedCountToday };
    } else {
      history.push({ date: today, minutes: totalFocusMinutes, count: completedCountToday });
    }
    
    // Keep only last 14 days to prevent unbounded growth
    if (history.length > 14) history = history.slice(-14);
    localStorage.setItem('mana_stats_history_v2', JSON.stringify(history));

  }, [tasks, theme, totalFocusMinutes, completedCountToday]);

  const getHistoryForStats = () => {
    const historyData = localStorage.getItem('mana_stats_history_v2');
    return historyData ? JSON.parse(historyData) : [];
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.dataset.theme = newTheme;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const addTask = () => {
    if (!newTaskText) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      detail: newTaskDetail.trim() || newTaskText,
      duration: newTaskDuration,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    soundUtils.playCreate();
    setNewTaskText('');
    setNewTaskDetail('');
    setShowInput(false);
    setSortField('manual');
  };

  const clearExpiredTasks = () => {
    setConfirmAction({ type: 'expired' });
  };

  const handleComplete = (id: string, duration: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    
    let nextMinutes = 0;
    setTotalFocusMinutes(prev => {
      nextMinutes = prev + duration;
      return nextMinutes;
    });

    let nextCount = 0;
    setCompletedCountToday(prev => {
      nextCount = prev + 1;
      return nextCount;
    });

    // 记录完成时间戳
    const now = Date.now();
    completionTimestampsRef.current.push(now);

    // 触发冒泡注能动效
    setIsBubbling(true);
    
    // 播放声音 (咕咚咕咚冒泡声)
    setTimeout(() => {
      soundUtils.playBubbling();
    }, 400);

    // 液面稳步上升 + 温馨提示触发
    setTimeout(() => {
      setCoffeeLevel(prevLevel => Math.min(100, prevLevel + 20));
      
      // 温馨提示触发逻辑（优先级：intensity > deepFocus > achievement）
      const lang = language === 'zh' ? 'zh' : 'en';
      const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

      // 条件 1: 30 分钟内连续完成 3 条
      const thirtyMinAgo = now - 30 * 60 * 1000;
      const recentCompletions = completionTimestampsRef.current.filter(ts => ts > thirtyMinAgo);
      if (recentCompletions.length >= 3 && recentCompletions.length % 3 === 0) {
        setCareMessage(pickRandom(CARE_PROMPTS.intensity[lang]));
      }
      // 条件 2: 累计每 60 分钟触发
      else if (nextMinutes >= 60 && Math.floor(nextMinutes / 60) > lastDeepFocusTriggerRef.current) {
        lastDeepFocusTriggerRef.current = Math.floor(nextMinutes / 60);
        setCareMessage(pickRandom(CARE_PROMPTS.deepFocus[lang]));
      }
      // 条件 3: 累计每 5 条任务触发
      else if (nextCount > 0 && nextCount % 5 === 0) {
        setCareMessage(pickRandom(CARE_PROMPTS.achievement[lang]));
      }
    }, 1200);

    // 动作结束后停止冒泡
    setTimeout(() => {
      setIsBubbling(false);
    }, 3000);
  };

  const injectTestData = () => {
    const now = Date.now();
    const mockTasks: Task[] = [
      { id: `mock-${now}-1`, text: 'Meditate (Mock)', detail: 'Morning focus', duration: 15, createdAt: now - 3600000 },
      { id: `mock-${now}-2`, text: 'Deep Work (Mock)', detail: 'Coding Mana', duration: 90, createdAt: now - 86400000 },
      { id: `mock-${now}-3`, text: 'Read Book (Old)', detail: 'Clear expired test', duration: 30, createdAt: now - 8 * 86400000 },
    ];
    setTasks([...mockTasks, ...tasks]);
  };

  const handleDelete = (id: string) => {
    setConfirmAction({ type: 'single', id });
  };

  const confirmDelete = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'single') {
      setTasks(prev => prev.filter(t => t.id !== confirmAction.id));
    } else if (confirmAction.type === 'expired') {
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      setTasks(prev => prev.filter(t => now - t.createdAt < SEVEN_DAYS_MS));
    }
    soundUtils.playDelete();
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
            <button className="action-icon-btn utility-btn dev-inject-btn" onClick={injectTestData} style={{ padding: '0 8px', width: 'auto', fontSize: '10px' }}>
              Inject
            </button>
            <button className="language-toggle action-icon-btn utility-btn" onClick={toggleLanguage}>
              <Languages size={20} />
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
          <button className="clear-expired-btn-mini" onClick={clearExpiredTasks}>
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
              <h3>{confirmAction.type === 'single' ? (language === 'en' ? 'Confirm Deletion' : '确认删除') : (language === 'en' ? 'Clear Expired' : '清理过期任务')}</h3>
              <p>{confirmAction.type === 'single' ? t('deleteConfirm') : t('clearConfirm')}</p>
              <div className="confirm-actions">
                <button className="cancel-btn" onClick={() => setConfirmAction(null)}>{language === 'en' ? 'Cancel' : '取消'}</button>
                <button className="confirm-delete-btn" onClick={confirmDelete}>{confirmAction.type === 'single' ? (language === 'en' ? 'Dissolve' : '溶解') : (language === 'en' ? 'Clear' : '清理')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        history={getHistoryForStats()} 
        totalMinutesEver={getHistoryForStats().reduce((acc: number, curr: DailyLog) => acc + curr.minutes, 0)} 
      />
    </div>
  );
};

export default App;
