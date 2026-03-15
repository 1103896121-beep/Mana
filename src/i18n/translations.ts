
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
      overwork: "You've worked too hard today. Please take a break. 🛑",
    },
    battery: {
      healthy: "Healthy",
      warning: "Warning",
      critical: "Critical",
    },
    stats: {
      title: "History Statistics",
      totalEver: "Cumulative Focus Time",
      last7Days: "Last 7 Days Trend",
      close: "Close",
      avg7Days: "7-Day Average",
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
      default: '「时间的流动始于一个单一的任务。」',
      overwork: "你今天已经非常努力了，请注意劳逸结合。🛑",
    },
    battery: {
      healthy: "良好",
      warning: "警告",
      critical: "危急",
    },
    stats: {
      title: "历史统计",
      totalEver: "累计专注时长",
      last7Days: "过去7天趋势",
      close: "关闭",
      avg7Days: "7日平均",
    }
  }
};

// 温馨提示文案库 - 3 类触发条件各 5 条
export const CARE_PROMPTS = {
  // ⚡ 效率模式：30分钟内连续完成 3 条
  intensity: {
    en: [
      "🚀 Triple combo achieved! Take a sip of water.",
      "⚡ Three in a row! Let your brain switch channels.",
      "🎯 Fast & precise, but don't forget to blink & stretch.",
      "🔥 Streak mode! Reward yourself with 5 min of daydreaming.",
      "💨 Full speed ahead — now it's your slow-down moment.",
    ],
    zh: [
      "🚀 你刚刚像火箭一样高效！停下来喝口水吧。",
      "⚡ 三连击达成！让大脑切换一下频道。",
      "🎯 精准又快速，但别忘了眨眨眼、伸伸腰。",
      "🔥 连续作战模式！奖励自己 5 分钟放空时间。",
      "💨 速度感拉满，现在是属于你的慢节奏时刻。",
    ],
  },
  // ☕ 深度专注：每累计 60 分钟
  deepFocus: {
    en: [
      "☕ You've worked hard for 60 minutes, treat yourself to a coffee.",
      "🧘 Sustained focus is a superpower, but it needs recharging too.",
      "🌿 60 minutes of deep work — get up and feel the sunshine.",
      "⏰ You've been grinding for 60 minutes! Stand up and move around.",
      "🎵 A full 60-minute session — listen to a favorite song and relax.",
    ],
    zh: [
      "☕ 已辛苦60分钟了，给自己冲杯咖啡吧。",
      "🧘 已辛苦60分钟了，超能力也需要充电。",
      "🌿 已辛苦60分钟了，起来走走感受下阳光。",
      "⏰ 已辛苦60分钟了！站起来活动一下身体吧。",
      "🎵 已辛苦60分钟了，听首喜欢的歌放松一下。",
    ],
  },
  // 🏆 成就达成：每累计 5 条任务
  achievement: {
    en: [
      "🏆 Another 5 done — you're amazing today!",
      "🌟 Five-star achievement unlocked! Take a break, you deserve it.",
      "🎉 High output mode! But remember to recharge your battery.",
      "💪 Steady output — keep the rhythm going!",
      "🥇 Milestone reached! Treat yourself to something nice.",
    ],
    zh: [
      "🏆 又完成了 5 件事，你今天真的很棒！",
      "🌟 五星成就解锁！休息一下，你值得。",
      "🎉 高产出模式！但记得给电池充充电。",
      "💪 稳定输出中，注意保持节奏感哦。",
      "🥇 里程碑达成！奖励自己一个小确幸。",
    ],
  },
};

// NOTE: 以下旧导出保留向后兼容，后续可删除
export const PROMPTS = CARE_PROMPTS.deepFocus;
export const REST_PROMPTS = CARE_PROMPTS.intensity;
