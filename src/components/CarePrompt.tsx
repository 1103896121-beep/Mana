import React, { useMemo } from 'react';

const PROMPT_LIBRARY = [
  "🔋 能量池已达峰值，是时候让魔法休息一下了。",
  "🌙 即使是伟大的大魔法师也需要冥想，请放下魔杖休息片刻。",
  "🍃 能量正在过度流失，请深呼吸，感受周围的宁静。",
  "🍵 生产力不是透支，而是平衡。来杯热茶如何？",
  "⭐ 今天的成就已闪耀星空，别让疲劳遮住了光芒。",
  "🔮 预言显示：接下来的15分钟属于沙发和远方。",
  "🧘‍♀️ 停下脚步，是为了让下一次能量爆发更强劲。",
  "🛑 魔法禁令：检测到过度劳累，请立即开启‘放空模式’。",
  "🧘 专注力是有限的魔法，休息是为了更好的流转。",
  "☕ 现在的你，比任务更需要一次温暖的呼吸。"
];

const REST_LIBRARY = [
  "⚠️ 核心过热！能量已降至临界点，请强制休息。",
  "🛑 警报：能量供应不足，继续工作可能导致系统崩溃。",
  "💤 电池告急，请将自己接入‘睡眠插座’进行充电。",
  "🥤 极低能量状态！比起清单，你现在更需要糖分和水分。",
  "🌙 魔法干涸，强行施法是徒劳的，请立即进入休眠。"
];

interface CarePromptProps {
  taskCount: number;
  totalMinutes: number;
  recentCount: number;
  batteryLevel: number;
}

const CarePrompt: React.FC<CarePromptProps> = ({ taskCount, totalMinutes, recentCount, batteryLevel }) => {
  // 触发条件判断
  const triggers = {
    count: taskCount > 0 && taskCount % 5 === 0,
    duration: totalMinutes > 0 && totalMinutes % 120 === 0,
    intensity: recentCount >= 3,
    lowBattery: batteryLevel <= 20
  };

  const showPrompt = triggers.count || triggers.duration || triggers.intensity || triggers.lowBattery;
  
  const promptText = useMemo(() => {
    if (triggers.lowBattery) {
      const index = Math.floor(Math.random() * REST_LIBRARY.length);
      return "[🔴 极低能量] " + REST_LIBRARY[index];
    }
    
    if (!showPrompt) return '"The flow of time begins with a single intention."';
    
    let prefix = "";
    if (triggers.intensity) prefix = "[⚡ 高频触发] ";
    else if (triggers.duration) prefix = "[💎 深度专注] ";
    else if (triggers.count) prefix = "[🏆 成就达成] ";
    
    const index = Math.floor(Math.random() * PROMPT_LIBRARY.length);
    return prefix + PROMPT_LIBRARY[index];
  }, [showPrompt, triggers.count, triggers.duration, triggers.intensity, triggers.lowBattery]);

  return (
    <footer className="footer-console glass-panel">
      <p className="care-prompt">
        {promptText}
      </p>
    </footer>
  );
};

export default CarePrompt;
export { PROMPT_LIBRARY };
