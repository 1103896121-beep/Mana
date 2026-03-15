import { useState, useEffect, useRef } from 'react';
import { useTranslation } from './use-translation';
import { CARE_PROMPTS } from '../i18n/translations';
import soundUtils from '../utils/sound-utils';

/**
 * 任务数据接口
 */
export interface Task {
  id: string;
  text: string;
  duration: number;
  createdAt: number;
  detail?: string;
}

/**
 * 每日统计数据接口
 */
export interface DailyLog {
  date: string;
  minutes: number;
  count: number;
}

/**
 * Mana 核心业务逻辑 Hook
 * 负责任务管理、专注统计、咖啡能量系统及持久化逻辑。
 * 遵循“展示逻辑与业务逻辑分离”原则。
 * 
 * @returns 包含任务列表、统计数值及相关操作函数
 */
export const useMana = () => {
  const { language } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [completedCountToday, setCompletedCountToday] = useState(0);
  const [coffeeLevel, setCoffeeLevel] = useState(0);
  const [careMessage, setCareMessage] = useState<string | null>(null);
  const [isBubbling, setIsBubbling] = useState(false);

  // 引用变量，用于逻辑计算
  const completionTimestampsRef = useRef<number[]>([]);
  const lastDeepFocusTriggerRef = useRef<number>(0);

  // 初始化加载数据
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActiveDate = localStorage.getItem('mana_last_active_date');
    
    // 跨天重置逻辑
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

  // 持久化逻辑
  useEffect(() => {
    localStorage.setItem('mana_tasks_v6', JSON.stringify(tasks));
    localStorage.setItem('mana_daily_stats_v5', JSON.stringify({
      minutes: totalFocusMinutes,
      count: completedCountToday
    }));

    const today = new Date().toDateString();
    const historyData = localStorage.getItem('mana_stats_history_v2');
    let history: DailyLog[] = historyData ? JSON.parse(historyData) : [];
    
    const todayIndex = history.findIndex(h => h.date === today);
    if (todayIndex >= 0) {
      history[todayIndex] = { date: today, minutes: totalFocusMinutes, count: completedCountToday };
    } else {
      history.push({ date: today, minutes: totalFocusMinutes, count: completedCountToday });
    }
    
    if (history.length > 14) history = history.slice(-14);
    localStorage.setItem('mana_stats_history_v2', JSON.stringify(history));
  }, [tasks, totalFocusMinutes, completedCountToday]);

  /**
   * 添加新任务
   * @param text 任务标题
   * @param detail 任务详情
   * @param duration 专注时长
   */
  const addTask = (text: string, detail: string, duration: number) => {
    if (!text) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      detail: detail.trim() || text,
      duration,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    soundUtils.playCreate();
  };

  /**
   * 完成任务逻辑
   * 触发能量注入动画及温馨提示
   */
  const handleCompleteTask = (id: string, duration: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    
    setTotalFocusMinutes(prev => prev + duration);
    setCompletedCountToday(prev => prev + 1);

    const now = Date.now();
    completionTimestampsRef.current.push(now);
    setIsBubbling(true);
    
    setTimeout(() => soundUtils.playBubbling(), 400);

    setTimeout(() => {
      setCoffeeLevel(prevLevel => Math.min(100, prevLevel + 20));
      const lang = language === 'zh' ? 'zh' : 'en';
      const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

      const thirtyMinAgo = now - 30 * 60 * 1000;
      const recentCompletions = completionTimestampsRef.current.filter(ts => ts > thirtyMinAgo);
      
      const nextMinutes = totalFocusMinutes + duration;
      const nextCount = completedCountToday + 1;

      if (recentCompletions.length >= 3 && recentCompletions.length % 3 === 0) {
        setCareMessage(pickRandom(CARE_PROMPTS.intensity[lang]));
      } else if (nextMinutes >= 60 && Math.floor(nextMinutes / 60) > lastDeepFocusTriggerRef.current) {
        lastDeepFocusTriggerRef.current = Math.floor(nextMinutes / 60);
        setCareMessage(pickRandom(CARE_PROMPTS.deepFocus[lang]));
      } else if (nextCount > 0 && nextCount % 5 === 0) {
        setCareMessage(pickRandom(CARE_PROMPTS.achievement[lang]));
      }
    }, 1200);

    setTimeout(() => setIsBubbling(false), 3000);
  };

  /**
   * 删除任务
   * @param id 任务ID
   */
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    soundUtils.playDelete();
  };

  /**
   * 清理超过 7 天的任务
   */
  const clearExpiredTasks = () => {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    setTasks(prev => prev.filter(t => now - t.createdAt < SEVEN_DAYS_MS));
    soundUtils.playDelete();
  };

  /**
   * 获取统计历史数据
   */
  const getHistory = () => {
    const historyData = localStorage.getItem('mana_stats_history_v2');
    return historyData ? JSON.parse(historyData) : [];
  };

  return {
    tasks,
    setTasks,
    totalFocusMinutes,
    completedCountToday,
    coffeeLevel,
    careMessage,
    setCareMessage,
    isBubbling,
    addTask,
    handleCompleteTask,
    deleteTask,
    clearExpiredTasks,
    getHistory
  };
};
