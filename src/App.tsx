import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Moon, Sun, Trash2, Languages } from 'lucide-react';
import TaskBubble from './components/TaskBubble';
import CarePrompt from './components/CarePrompt';
import Battery from './components/Battery';
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
  
  // 统计与电池
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [completedCountToday, setCompletedCountToday] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [recentCompletions, setRecentCompletions] = useState<number[]>([]);
  
  // 状态清理：移除统计 Modal 开关
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
      setBatteryLevel(100);
      localStorage.setItem('mana_last_active_date', today);
    } else {
      const savedStats = localStorage.getItem('mana_daily_stats_v4');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setTotalMinutesToday(stats.minutes || 0);
        setCompletedCountToday(stats.count || 0);
        // 初始电量基于已完成任务
        setBatteryLevel(Math.max(0, 100 - (stats.count || 0) * 12));
      }
    }

    const savedTasks = localStorage.getItem('mana_tasks_v5');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    // 历史统计初始化移除
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
    if (!window.confirm(t('clearConfirm'))) return;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    setTasks(prev => prev.filter(t => now - t.createdAt < SEVEN_DAYS_MS));
    soundUtils.playDelete();
  };

  const handleComplete = (id: string, duration: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setTotalMinutesToday(prev => {
      const newMins = prev + duration;
      const consumption = (duration / 300) * 100;
      setBatteryLevel(prevBattery => Math.max(0, prevBattery - consumption));
      return newMins;
    });
    setCompletedCountToday(prev => prev + 1);
    
    soundUtils.playComplete();
    const now = Date.now();
    setRecentCompletions(prev => {
      const filtered = prev.filter(t => now - t < 30 * 60000);
      return [...filtered, now];
    });
  };

  const handleDelete = (id: string) => {
    // 强制确认逻辑
    if (window.confirm(t('deleteConfirm'))) {
      setTasks(prev => prev.filter(t => t.id !== id));
      soundUtils.playDelete();
    }
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
    '--mana-rgb': batteryLevel > 60 ? '0, 122, 255' : batteryLevel > 20 ? '255, 204, 0' : '255, 59, 48',
    '--mana-intensity': (batteryLevel / 100) * 0.15
  } as React.CSSProperties;

  return (
    <div className="app-container" style={appStyle}>
      <header className="mana-header apple-header">
        <div className={`header-top ${language === 'en' ? 'layout-en' : ''}`}>
          <div className="mana-header-main">
            {/* 极简第二行：今日能量 & 垂直电池 - 高亮大字 */}
            <div className="mana-energy-status">
              <span className="mana-label-highlight">{t('header.todayEnergy')}</span>
              <Battery percentage={batteryLevel} />
            </div>
          </div>
          <div className="header-actions-group">
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
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
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

      <CarePrompt 
        taskCount={completedCountToday} 
        totalMinutes={totalMinutesToday}
        recentCount={recentCompletions.length}
        batteryLevel={batteryLevel}
      />

    </div>
  );
};

export default App;
