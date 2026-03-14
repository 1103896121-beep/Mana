import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import TaskBubble from './components/TaskBubble';
import CarePrompt from './components/CarePrompt';
import './App.css';

interface Task {
  id: string;
  text: string;
  manaValue: number;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mana, setMana] = useState(100);
  const [showInput, setShowInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskMana, setNewTaskMana] = useState(10);
  const [completedToday, setCompletedToday] = useState(0);

  // 初始化：从本地存储加载数据
  useEffect(() => {
    const savedTasks = localStorage.getItem('mana_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    const savedMana = localStorage.getItem('mana_current');
    if (savedMana) setMana(Number(savedMana));

    const savedCompleted = localStorage.getItem('mana_completed_count');
    if (savedCompleted) setCompletedToday(Number(savedCompleted));
  }, []);

  // 持久化：保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('mana_tasks', JSON.stringify(tasks));
    localStorage.setItem('mana_current', mana.toString());
    localStorage.setItem('mana_completed_count', completedToday.toString());
  }, [tasks, mana, completedToday]);

  const addTask = () => {
    if (!newTaskText) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      manaValue: newTaskMana,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setShowInput(false);
  };

  const handleComplete = (id: string, manaValue: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    setMana(prev => Math.min(100, prev + (manaValue / 2))); // 回复部分能量
    setCompletedToday(prev => prev + 1);
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="app-container">
      {/* 状态栏 */}
      <header className="mana-header glass-panel aura-float">
        <div className="mana-pool-info">
          <span className="mana-label">ENERGY CORE</span>
          <h1 className="mana-value">
            {Math.round(mana)} <span className="mana-unit">MP</span>
          </h1>
        </div>
        <div className="mana-progress-container">
          <motion.div 
            className="mana-progress-bar" 
            initial={{ width: 0 }}
            animate={{ width: `${mana}%` }}
          />
        </div>
      </header>

      {/* 任务区域 */}
      <main className="task-viewport">
        <div className="task-list-header">
          <h2>Mana Vessels</h2>
          <button 
            className={`add-task-btn ${showInput ? 'active' : ''}`} 
            onClick={() => setShowInput(!showInput)}
          >
            <Plus size={24} style={{ transform: showInput ? 'rotate(45deg)' : 'none' }} />
          </button>
        </div>

        {/* 快速添加输入框 */}
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
                placeholder="What intention shall we set?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <div className="mana-cost-selector">
                <label>Energy Required: {newTaskMana} MP</label>
                <input 
                  type="range" min="5" max="50" step="5"
                  value={newTaskMana}
                  onChange={(e) => setNewTaskMana(Number(e.target.value))}
                />
              </div>
              <button className="confirm-add-btn" onClick={addTask}>Establish Flow</button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 拖拽排序列表 */}
        <Reorder.Group 
          axis="y" 
          values={tasks} 
          onReorder={setTasks}
          className="bubble-list-container"
        >
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
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
              <p>Your energy is still. Create a task to start the flow.</p>
            </div>
          )}
        </Reorder.Group>
      </main>

      {/* 智能关怀提示 */}
      <CarePrompt taskCount={completedToday} />
    </div>
  );
};

export default App;
