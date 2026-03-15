
export const translations = {
  en: {
    header: {
      todayEnergy: "TODAY ENERGY",
      mins: "mins",
      minShort: "m",
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
      extractEnergy: "Extract Energy",
      dissolve: "Dissolve",
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
      tapToPop: "tap to pop",
    },
    common: {
      confirm: "Confirm",
      cancel: "Cancel",
      clear: "Clear",
      dissolve: "Dissolve",
      confirmDelete: "Confirm Deletion",
      clearExpired: "Clear Expired",
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
      bestDay: "Your best day was {{date}} with {{mins}} mins!",
    },
    about: {
      title: "About Mana",
      privacyTitle: "Privacy Policy",
      privacyText: "Mana promises that all your focus data and anonymous preferences are securely stored locally on this device. There is no unauthorized cloud synchronization or data collection. Your privacy is absolutely protected.",
      close: "Close"
    },
    tipJar: {
      title: "Support Mana",
      coffee: "Buy me a coffee",
      lunch: "Sponsor a lunch",
      coffeePrice: "$0.99",
      lunchPrice: "$4.99",
      desc: "Mana is developed by a single person and contains no ads or subscriptions. If this app helps you find your focus, consider leaving a small tip to keep the servers and caffeine running. 💙",
      purchasing: "Purchasing...",
      success: "Thank you for your support!",
      error: "Purchase failed or was canceled."
    }
  },
  zh: {
    header: {
      todayEnergy: "今日能量",
      mins: "分钟",
      minShort: "分",
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
      extractEnergy: "提取能量",
      dissolve: "消解气泡",
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
      tapToPop: "点击爆破",
    },
    common: {
      confirm: "确认",
      cancel: "取消",
      clear: "清理",
      dissolve: "溶解",
      confirmDelete: "确认删除",
      clearExpired: "清理过期任务",
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
    },
    about: {
      title: "关于 Mana",
      privacyTitle: "隐私协议",
      privacyText: "Mana 承诺您的所有专注数据和匿名偏好完全加密存储在本机，绝无任何未经授权的云端同步或暗中收集隐私的行为。",
      close: "确认返回"
    },
    tipJar: {
      title: "支持独立开发",
      coffee: "请开发者喝杯咖啡",
      lunch: "赞助一顿午餐",
      coffeePrice: "¥6.00",
      lunchPrice: "¥30.00",
      desc: "Mana 由独立开发者用爱发电，承诺永远无广告、无强制订阅。如果这款应用帮您找回了内心的平静与专注，一次微小的打赏就是对我最大的鼓励。💙",
      purchasing: "正在连接 App Store...",
      success: "感谢您的慷慨支持！",
      error: "支付已取消或遇到网络错误。"
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
