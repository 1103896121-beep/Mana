import React, { useState, useEffect, useMemo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Moon, Sun, Trash2 } from 'lucide-react';
import TaskBubble from './components/TaskBubble';
import CarePrompt from './components/CarePrompt';
import './App.css';

interface Task {
  id: string;
  text: string;
  duration: number;
  createdAt: number;
}

type SortField = 'createdAt' | 'duration' | 'manual';
type SortOrder = 'asc' | 'desc';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showInput, setShowInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  
  // 统计数据
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [completedCountToday, setCompletedCountToday] = useState(0);
  const [recentCompletions, setRecentCompletions] = useState<number[]>([]);

  // 排序状态
  const [sortField, setSortField] = useState<SortField>('manual');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 初始化
  useEffect(() => {
    const savedTasks = localStorage.getItem('mana_tasks_v3');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    const savedTheme = localStorage.getItem('mana_theme');
    if (savedTheme) {
      setTheme(savedTheme as 'dark' | 'light');
      document.body.dataset.theme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
      document.body.dataset.theme = 'light';
    }

    const savedStats = localStorage.getItem('mana_daily_stats_v2');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setTotalMinutesToday(stats.minutes || 0);
      setCompletedCountToday(stats.count || 0);
    }
  }, []);

  // 持久化
  useEffect(() => {
    localStorage.setItem('mana_tasks_v3', JSON.stringify(tasks));
    localStorage.setItem('mana_theme', theme);
    localStorage.setItem('mana_daily_stats_v2', JSON.stringify({
      minutes: totalMinutesToday,
      count: completedCountToday
    }));
  }, [tasks, theme, totalMinutesToday, completedCountToday]);

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
      duration: newTaskDuration,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setShowInput(false);
    // 添加新任务时保持手动排序模式
    setSortField('manual');
  };

  const clearExpiredTasks = () => {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const beforeCount = tasks.length;
    const filteredTasks = tasks.filter(t => now - t.createdAt < SEVEN_DAYS_MS);
    
    if (filteredTasks.length < beforeCount) {
      setTasks(filteredTasks);
      alert(`已清除 ${beforeCount - filteredTasks.length} 个 7 天前的任务。`);
    } else {
      alert("没有超过 7 天的未完成任务。");
    }
  };

  const handleComplete = (id: string, duration: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setTotalMinutesToday(prev => prev + duration);
    setCompletedCountToday(prev => prev + 1);
    
    const now = Date.now();
    setRecentCompletions(prev => {
      const filtered = prev.filter(t => now - t < 30 * 60000);
      return [...filtered, now];
    });
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // 排序处理
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

  // 修复拖拽重排逻辑: 当在非手动排序模式下拖拽时，应先切换到手动模式或同步顺序
  const handleReorder = (newOrder: Task[]) => {
    setTasks(newOrder);
    if (sortField !== 'manual') {
      setSortField('manual');
    }
  };

  return (
    <div className="app-container">
      <header className="mana-header glass-panel aura-float">
        <div className="header-top">
          <div className="mana-pool-info">
            <span className="mana-label">ENERGY RESERVE</span>
            <h1 className="mana-value">
              {totalMinutesToday} <span className="mana-unit">mins</span>
            </h1>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
        <div className="mana-progress-container">
          <motion.div 
            className="mana-progress-bar" 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (totalMinutesToday / 300) * 100)}%` }}
          />
        </div>
      </header>

      <main className="task-viewport">
        <div className="task-list-header">
          <h2>Time Vessels</h2>
          <div className="header-actions">
            <button 
              className={`add-task-btn ${showInput ? 'active' : ''}`} 
              onClick={() => setShowInput(!showInput)}
            >
              <Plus size={36} style={{ transform: showInput ? 'rotate(45deg)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* 控制栏: 排序 + 清除功能并排 */}
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
          
          <button className="clear-expired-btn-mini" onClick={clearExpiredTasks} title="Clear Tasks > 7 Days">
            <Trash2 size={18} />
          </button>
        </div>

        <AnimatePresence>
          {showInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="quick-add-panel glass-panel"
            >
              <input 
                autoFocus
                type="text" 
                placeholder="Name your intention..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <div className="duration-selector">
                <label>Investment: {newTaskDuration} minutes</label>
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
        
        <Reorder.Group 
          axis="y" 
          values={displayTasks} 
          onReorder={handleReorder}
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
              <p>The timeline is empty. Create a task to begin.</p>
            </div>
          )}
        </Reorder.Group>
      </main>

      <CarePrompt 
        taskCount={completedCountToday} 
        totalMinutes={totalMinutesToday}
        recentCount={recentCompletions.length}
      />
    </div>
  );
};

export default App;
