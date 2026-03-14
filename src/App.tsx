import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Moon, Sun, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import TaskBubble from './components/TaskBubble';
import CarePrompt from './components/CarePrompt';
import Battery from './components/Battery';
import StatsModal from './components/StatsModal';
import { BarChart3 } from 'lucide-react';
import './App.css';

interface DailyLog {
  date: string;
  minutes: number;
  count: number;
}

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showInput, setShowInput] = useState(false);
  const [showAdvanceInput, setShowAdvanceInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDetail, setNewTaskDetail] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  
  // 统计与电池
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [completedCountToday, setCompletedCountToday] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [recentCompletions, setRecentCompletions] = useState<number[]>([]);
  
  // 长期统计
  const [history, setHistory] = useState<DailyLog[]>([]);
  const [totalMinutesEver, setTotalMinutesEver] = useState(0);
  const [showStats, setShowStats] = useState(false);

  // 排序状态
  const [sortField, setSortField] = useState<SortField>('manual');
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
        // 电池逻辑: 每完成一个任务消耗 10%
        setBatteryLevel(Math.max(0, 100 - (stats.count || 0) * 12));
      }
    }

    const savedTasks = localStorage.getItem('mana_tasks_v5');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    // 加载历史
    const savedHistory = localStorage.getItem('mana_history_v1');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // 确保包含今天的数据
      const todayStr = new Date().toISOString().split('T')[0];
      if (!parsed.find((h: DailyLog) => h.date === todayStr)) {
        parsed.push({ date: todayStr, minutes: 0, count: 0 });
      }
      // 只保留最近7天
      const last7Days = parsed.slice(-7);
      setHistory(last7Days);
    } else {
      setHistory([{ date: new Date().toISOString().split('T')[0], minutes: 0, count: 0 }]);
    }

    const savedTotalEver = localStorage.getItem('mana_total_ever');
    if (savedTotalEver) setTotalMinutesEver(Number(savedTotalEver));
  }, []);

  // 持久化
  useEffect(() => {
    localStorage.setItem('mana_tasks_v5', JSON.stringify(tasks));
    localStorage.setItem('mana_theme', theme);
    localStorage.setItem('mana_daily_stats_v4', JSON.stringify({
      minutes: totalMinutesToday,
      count: completedCountToday
    }));

    // 更新历史记录中的今日数据
    const todayStr = new Date().toISOString().split('T')[0];
    setHistory(prev => {
      const newHistory = prev.map(h => 
        h.date === todayStr ? { ...h, minutes: totalMinutesToday, count: completedCountToday } : h
      );
      localStorage.setItem('mana_history_v1', JSON.stringify(newHistory));
      return newHistory;
    });
    localStorage.setItem('mana_total_ever', totalMinutesEver.toString());
  }, [tasks, theme, totalMinutesToday, completedCountToday, totalMinutesEver]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.dataset.theme = newTheme;
  };

  const addTask = () => {
    if (!newTaskText) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      detail: newTaskDetail.trim() || newTaskText, // 默认详情同标题
      duration: newTaskDuration,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setNewTaskDetail('');
    setShowInput(false);
    setShowAdvanceInput(false);
    setSortField('manual');
  };

  const clearExpiredTasks = () => {
    if (!window.confirm("Are you sure you want to clear all unfinished tasks from 7 days ago?")) return;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    setTasks(prev => prev.filter(t => now - t.createdAt < SEVEN_DAYS_MS));
  };

  const handleComplete = (id: string, duration: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setTotalMinutesToday(prev => prev + duration);
    setTotalMinutesEver(prev => prev + duration);
    setCompletedCountToday(prev => {
      const newCount = prev + 1;
      setBatteryLevel(Math.max(0, 100 - newCount * 12));
      return newCount;
    });
    
    const now = Date.now();
    setRecentCompletions(prev => {
      const filtered = prev.filter(t => now - t < 30 * 60000);
      return [...filtered, now];
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Confirm deletion? This will dissolve the intention bubble.")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const displayTasks = useMemo(() => {
    if (sortField === 'manual') return tasks;
    return [...tasks].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortOrder === 'desc' ? valB - valA : valA - valB;
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

  return (
    <div className="app-container">
      <header className="mana-header apple-header">
        <div className="header-top">
          <div className="mana-pool-info">
            <span className="mana-label">ENERGY RESERVE</span>
            <h1 className="mana-value">
              {totalMinutesToday} <span className="mana-unit">mins</span>
            </h1>
          </div>
          <div className="header-status-group">
            <Battery percentage={batteryLevel} />
            <button className="stats-trigger-btn" onClick={() => setShowStats(true)}>
              <BarChart3 size={24} />
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
        <div className="mana-progress-container">
          <motion.div 
            className="mana-progress-bar" 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (totalMinutesToday / 300) * 100)}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </div>
      </header>

      <main className="task-viewport">
        <div className="task-list-header">
          <h2>Time Vessels</h2>
          <button 
            className={`add-task-btn ${showInput ? 'active' : ''}`} 
            onClick={() => setShowInput(!showInput)}
          >
            <Plus size={36} style={{ transform: showInput ? 'rotate(45deg)' : 'none' }} />
          </button>
        </div>

        <AnimatePresence>
          {showInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="quick-add-panel glass-panel elevated"
            >
              <div className="input-field">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Intention name..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
              </div>

              <div className="advance-toggle" onClick={() => setShowAdvanceInput(!showAdvanceInput)}>
                <span>Detailed Background (Optional)</span>
                {showAdvanceInput ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {showAdvanceInput && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="detail-input-area"
                >
                  <textarea 
                    placeholder="Enter details or subtasks (max 300 words)..."
                    maxLength={300}
                    value={newTaskDetail}
                    onChange={(e) => setNewTaskDetail(e.target.value)}
                  />
                  <div className="char-count">{newTaskDetail.length}/300</div>
                </motion.div>
              )}

              <div className="duration-selector">
                <label>Focus Time: {newTaskDuration} mins</label>
                <input 
                  type="range" min="5" max="300" step="5"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                />
              </div>
              <button className="confirm-add-btn" onClick={addTask}>Establish Intention</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="controls-bar">
          <div className="sorting-controls">
            <button 
              className={`sort-btn ${sortField === 'createdAt' ? 'active' : ''}`}
              onClick={() => cycleSort('createdAt')}
            >
              Time {sortField === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortField === 'duration' ? 'active' : ''}`}
              onClick={() => cycleSort('duration')}
            >
              Dur. {sortField === 'duration' && (sortOrder === 'desc' ? '↓' : '↑')}
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
              <p>No active intentions. Add one above.</p>
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

      <StatsModal 
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        history={history}
        totalMinutesEver={totalMinutesEver}
      />
    </div>
  );
};

export default App;
