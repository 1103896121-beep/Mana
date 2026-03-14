import React from 'react';

// 疲劳提示词库
const PROMPT_LIBRARY = [
  "🔋 能量池已达峰值，是时候让魔法休息一下了。",
  "🌙 即使是伟大的大魔法师也需要冥想，请放下魔杖休息片刻。",
  "🍃 能量正在过度流失，请深呼吸，感受周围的宁静。",
  "🍵 生产力不是透支，而是平衡。来杯热茶如何？",
  "⭐ 今天的成就已闪耀星空，别让疲劳遮住了光芒。",
  "🔮 预言显示：接下来的15分钟属于沙发和远方。",
  "🧘‍♀️ 停下脚步，是为了让下一次 Mana 爆发更强劲。",
  "🛑 魔法禁令：检测到过度劳累，请立即开启‘放空模式’。"
];

interface CarePromptProps {
  taskCount: number;
}

const CarePrompt: React.FC<CarePromptProps> = ({ taskCount }) => {
  // 当完成或积压任务过多时显示
  const showPrompt = taskCount > 5;
  
  const getRandomPrompt = () => {
    const index = Math.floor(Math.random() * PROMPT_LIBRARY.length);
    return PROMPT_LIBRARY[index];
  };

  return (
    <footer className="footer-console glass-panel">
      <p className="care-prompt">
        {showPrompt ? getRandomPrompt() : '"The flow of energy begins with a single intention."'}
      </p>
    </footer>
  );
};

export default CarePrompt;
export { PROMPT_LIBRARY };
