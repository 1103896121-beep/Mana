import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Moon, Sun, Trash2, Languages } from 'lucide-react';
import TaskBubble from './components/TaskBubble';
import CoffeeCup from './components/CoffeeCup';
import { useTranslation } from './hooks/useTranslation';
import { soundUtils } from './utils/soundUtils';
import './App.css';

// 移除 DailyLog 接口

interface Task {
  id: string;
  text: string;
  duration: number;
  createdAt: number;
  detail?: string;
}

type SortField = 'createdAt' | 'duration' | 'manual';
type SortOrder = 'asc' | 'desc';

const App: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showInput, setShowInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDetail, setNewTaskDetail] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [completedCountToday, setCompletedCountToday] = useState(0);
  const [coffeeLevel, setCoffeeLevel] = useState(0);
  const [recentCompletions, setRecentCompletions] = useState<number[]>([]);
  const [coffeeAlert, setCoffeeAlert] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'single', id: string } | { type: 'expired' } | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 初始化与重置逻辑
  useEffect(() => {
    const savedTheme = localStorage.getItem('mana_theme');
    if (savedTheme) {
      setTheme(savedTheme as 'dark' | 'light');
      document.body.dataset.theme = savedTheme;
    }

    const today = new Date().toDateString();
    const lastActiveDate = localStorage.getItem('mana_last_active_date');
    
    if (lastActiveDate !== today) {
      setTotalMinutesToday(0);
      setCompletedCountToday(0);
      setCoffeeLevel(0);
      localStorage.setItem('mana_last_active_date', today);
    } else {
      const savedStats = localStorage.getItem('mana_daily_stats_v4');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setTotalMinutesToday(stats.minutes || 0);
        setCompletedCountToday(stats.count || 0);
        // Initial coffee based on completed tasks
        setCoffeeLevel(Math.min(100, (stats.count || 0) * 20));
      }
    }

    const savedTasks = localStorage.getItem('mana_tasks_v5');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    // Pre-load audio engine
    soundUtils.init();
  }, []);

  // 持久化
  useEffect(() => {
    localStorage.setItem('mana_tasks_v5', JSON.stringify(tasks));
    localStorage.setItem('mana_theme', theme);
    // 自定义数据持久化 (移除统计)
    localStorage.setItem('mana_daily_stats_v4', JSON.stringify({
      minutes: totalMinutesToday,
      count: completedCountToday
    }));
  }, [tasks, theme, totalMinutesToday, completedCountToday]);

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
    setTotalMinutesToday(prev => {
      nextMinutes = prev + duration;
      return nextMinutes;
    });

    setCoffeeLevel(prevLevel => Math.min(100, prevLevel + 20)); // 每个任务固定增加 20%
    
    let nextCount = 0;
    setCompletedCountToday(prev => {
      nextCount = prev + 1;
      return nextCount;
    });
    
    const now = Date.now();
    let nextRecentCount = 0;
    setRecentCompletions(prev => {
      const filtered = prev.filter(t => now - t < 30 * 60000);
      const nextArr = [...filtered, now];
      nextRecentCount = nextArr.length;
      return nextArr;
    });

    // 等待气泡化作咖啡飞入杯中的动画时间后，检测是否需要弹窗关怀
    setTimeout(() => {
      if (nextCount === 5 || nextMinutes >= 180) {
        setCoffeeAlert(t('carePrompt.overwork'));
      } else if (nextRecentCount >= 3 && nextRecentCount % 3 === 0) {
        setCoffeeAlert(t('carePrompt.coffeeBreak'));
      }
    }, 1500);
  };

  const injectTestData = () => {
    const now = Date.now();
    const mockTasks: Task[] = [
      { id: crypto.randomUUID(), text: 'Meditate (Mock)', detail: 'Morning focus', duration: 15, createdAt: now - 3600000 },
      { id: crypto.randomUUID(), text: 'Deep Work (Mock)', detail: 'Coding Mana', duration: 90, createdAt: now - 86400000 },
      { id: crypto.randomUUID(), text: 'Read Book (Old)', detail: 'Clear expired test', duration: 30, createdAt: now - 8 * 86400000 }, // 8 days ago
    ];
    const combinedTasks = [...mockTasks, ...tasks];
    setTasks(combinedTasks);
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
    '--mana-rgb': '210, 105, 30', // Coffee color base
    '--mana-intensity': (coffeeLevel / 100) * 0.15
  } as React.CSSProperties;

  return (
    <div className="app-container" style={appStyle}>
      <header className="mana-header apple-header">
        <div className={`header-top ${language === 'en' ? 'layout-en' : ''}`}>
          <div className="mana-header-main">
            {/* 极简第二行：垂直咖啡杯 */}
            <div className="mana-energy-vessel">
              <CoffeeCup percentage={coffeeLevel} />
            </div>
          </div>
          <div className="header-actions-group">
            {/* DEV: Inject Data Button */}
            <button 
              className="action-icon-btn utility-btn dev-inject-btn"
              onClick={injectTestData}
              title="Inject Test Data (Dev Only)"
              style={{ padding: '0 8px', width: 'auto', fontSize: '10px' }}
            >
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
        {/* 移除电池进度条 */}
        <div className="task-list-header">
          <h2>{t('taskViewport.title')}</h2>
          <button 
            className={`add-task-btn ${showInput ? 'active' : ''}`} 
            onClick={() => setShowInput(!showInput)}
          >
            <Plus size={36} />
          </button>
        </div>
      </header>

      <main className="task-viewport">
        <AnimatePresence>
          {showInput && (
            <>
              <motion.div 
                className="panel-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInput(false)}
              />
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="quick-add-panel glass-panel elevated"
              >
                <div className="input-field">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder={t('taskViewport.placeholder')}
                    maxLength={50}
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                  />
                </div>

                <div className="detail-input-area">
                  <textarea 
                    placeholder={t('taskViewport.detailPlaceholder')}
                    maxLength={300}
                    value={newTaskDetail}
                    onChange={(e) => setNewTaskDetail(e.target.value)}
                  />
                  <div className="char-count">{newTaskDetail.length}/300</div>
                </div>

                <div className="duration-selector">
                  <label>{t('taskViewport.focusTime')}: {newTaskDuration} {t('header.mins')}</label>
                  <input 
                    type="range" min="5" max="300" step="5"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    style={{ '--range-percent': `${((newTaskDuration - 5) / 295) * 100}%` } as React.CSSProperties}
                  />
                </div>
                <button className="confirm-add-btn" onClick={addTask}>{t('taskViewport.establishBtn')}</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="controls-bar">
          <div className="sorting-controls">
            <button 
              className={`sort-btn ${sortField === 'createdAt' ? 'active' : ''}`}
              onClick={() => cycleSort('createdAt')}
            >
              {t('controls.time')} {sortField === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortField === 'duration' ? 'active' : ''}`}
              onClick={() => cycleSort('duration')}
            >
              {t('controls.duration')} {sortField === 'duration' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
          <button className="clear-expired-btn-mini" onClick={clearExpiredTasks}>
            <Trash2 size={18} />
          </button>
        </div>
        
        <Reorder.Group 
          axis="y" 
          values={displayTasks} 
          onReorder={(newOrder) => {
            setTasks(newOrder);
            if (sortField !== 'manual') setSortField('manual');
          }}
          className="bubble-list-container"
        >
          <AnimatePresence mode="popLayout">
            {displayTasks.map(task => (
              <Reorder.Item key={task.id} value={task}>
                <TaskBubble 
                  {...task}
                  currentLevel={coffeeLevel}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
          
          {tasks.length === 0 && !showInput && (
            <div className="empty-state">
              <p>{t('taskViewport.emptyState')}</p>
            </div>
          )}
        </Reorder.Group>
      </main>

      <AnimatePresence>
        {coffeeAlert && (
          <motion.div 
            className="panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCoffeeAlert(null)}
            style={{ zIndex: 4000 }}
          >
            <motion.div 
              className="confirm-modal glass-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>{language === 'en' ? 'Time for a Break' : '休息时刻'}</h3>
              <p style={{ marginTop: '8px', marginBottom: '16px', fontSize: '0.95rem' }}>{coffeeAlert}</p>
              <div className="confirm-actions">
                <button className="confirm-delete-btn" style={{ background: 'rgba(210, 105, 30, 0.15)', color: '#D2691E', border: '1px solid rgba(210, 105, 30, 0.3)' }} onClick={() => setCoffeeAlert(null)}>
                  {language === 'en' ? 'Okay' : '好的'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && (
          <motion.div 
            className="panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmAction(null)}
            style={{ zIndex: 3000 }}
          >
            <motion.div 
              className="confirm-modal glass-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>
                {confirmAction.type === 'single' 
                  ? (language === 'en' ? 'Confirm Deletion' : '确认删除')
                  : (language === 'en' ? 'Clear Expired' : '清理过期任务')}
              </h3>
              <p>
                {confirmAction.type === 'single' 
                  ? t('deleteConfirm')
                  : t('clearConfirm')}
              </p>
              <div className="confirm-actions">
                <button className="cancel-btn" onClick={() => setConfirmAction(null)}>
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
                <button className="confirm-delete-btn" onClick={confirmDelete}>
                  {confirmAction.type === 'single' 
                    ? (language === 'en' ? 'Dissolve' : '溶解')
                    : (language === 'en' ? 'Clear' : '清理')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
