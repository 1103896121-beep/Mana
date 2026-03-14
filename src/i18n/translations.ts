
export const translations = {
  en: {
    header: {
      todayEnergy: "TODAY ENERGY",
      mins: "mins",
      completed: "Completed",
    },
    taskViewport: {
      title: "Todo",
      taskName: "TASK",
      placeholder: "Task name...",
      detailed: "Detail",
      detailPlaceholder: "Enter details (max 300 words)...",
      focusTime: "Estimated Duration",
      establishBtn: "Submit",
      emptyState: "No active tasks. Add one above.",
    },
    controls: {
      time: "Time",
      duration: "Dur.",
    },
    deleteConfirm: "Confirm deletion? This will dissolve the task bubble.",
    clearConfirm: "Are you sure you want to clear all unfinished tasks from 7 days ago?",
    carePrompt: {
      default: '"The flow of time begins with a single task."',
      highIntensity: "[⚡ High Intensity] ",
      deepFocus: "[💎 Deep Focus] ",
      achievement: "[🏆 Achievement] ",
      lowEnergy: "[🔴 Low Energy] ",
      coffeeBreak: "You've finished 3 tasks quickly. Stop and take a rest, have a cup of coffee. ☕",
      overwork: "You've worked too hard today. Please avoid over-exertion, balance work and rest, and relax. 🛑",
    },
    battery: {
      healthy: "Healthy",
      warning: "Warning",
      critical: "Critical",
    },
    stats: {
      title: "Energy Analytics",
      totalEver: "All-time focus:",
      last7Days: "Last 7 Days Trend",
      close: "Close",
      avg7Days: "7-Day Avg",
    }
  },
  zh: {
    header: {
      todayEnergy: "今日能量",
      mins: "分钟",
      completed: "已完成",
    },
    taskViewport: {
      title: "待办",
      taskName: "任务名称",
      placeholder: "设定你的任务...",
      detailed: "详细",
      detailPlaceholder: "详细 (最多300字)...",
      focusTime: "预计时长",
      establishBtn: "提交",
      emptyState: "暂无活跃任务。在上方添加一个吧。",
    },
    controls: {
      time: "时间",
      duration: "时长",
    },
    deleteConfirm: "确认删除？这将消解任务气泡。",
    clearConfirm: "确定要清理 7 天前所有未完成的任务吗？",
    carePrompt: {
      default: "“时间的流动始于一个单一的任务。”",
      highIntensity: "[⚡ 高频触发] ",
      deepFocus: "[💎 深度专注] ",
      achievement: "[🏆 成就达成] ",
      lowEnergy: "[🔴 极低能量] ",
      coffeeBreak: "你在短时间内连续完成了 3 件事，停下来喝杯咖啡，稍微休息一下吧。☕",
      overwork: "你今天已经非常努力了，请注意劳逸结合，放下手头的事情放松一下吧。🛑",
    },
    battery: {
      healthy: "良好",
      warning: "警告",
      critical: "危急",
    },
    stats: {
      title: "能量统计",
      totalEver: "累计专注时长：",
      last7Days: "过去7天趋势",
      close: "关闭",
      avg7Days: "7日平均",
    }
  }
};

export const PROMPTS = {
  en: [
    "🔋 Energy pool is at its peak, time for some magic rest.",
    "🌙 Even great mages need to meditate, put down your wand.",
    "🍃 Energy is leaking, breathe deep and feel the silence.",
    "🍵 Productivity isn't overdrawing, but balance. How about tea?",
    "⭐ Your achievements shine tonight, don't let fatigue hide them.",
    "🔮 Prophecy: the next 15 minutes belong to the sofa.",
    "🧘‍♀️ Stop to make the next energy burst stronger.",
    "🛑 Magic Ban: Overwork detected, enter 'Empty Mode' now.",
    "🧘 Focus is limited magic, rest flows it better.",
    "☕ You need a warm breath more than a task right now."
  ],
  zh: [
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
  ]
};

export const REST_PROMPTS = {
  en: [
    "⚠️ Core Overheating! Energy at critical point, forced rest.",
    "🛑 Alert: Insufficient energy, continuation may crash the system.",
    "💤 Battery low, plug yourself into the 'Sleep Socket'.",
    "🥤 Low energy! You need sugar and water more than a list.",
    "🌙 Magic dry, forced casting is futile, hygiene now."
  ],
  zh: [
    "⚠️ 核心过热！能量已降至临界点，请强制休息。",
    "🛑 警报：能量供应不足，继续工作可能导致系统崩溃。",
    "💤 电池告急，请将自己接入‘睡眠插座’进行充电。",
    "🥤 极低能量状态！比起清单，你现在更需要糖分和水分。",
    "🌙 魔法干涸，强行施法是徒劳的，请立即进入休眠。"
  ]
};
