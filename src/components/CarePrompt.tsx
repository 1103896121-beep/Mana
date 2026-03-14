import React, { useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { PROMPTS, REST_PROMPTS } from '../i18n/translations';

interface CarePromptProps {
  taskCount: number;
  totalMinutes: number;
  recentCount: number;
  batteryLevel: number;
}

const CarePrompt: React.FC<CarePromptProps> = ({ taskCount, totalMinutes, recentCount, batteryLevel }) => {
  const { t, language } = useTranslation();

  // 触发条件判断
  const triggers = {
    count: taskCount > 0 && taskCount % 5 === 0,
    duration: totalMinutes > 0 && totalMinutes % 120 === 0,
    intensity: recentCount >= 3,
    lowBattery: batteryLevel <= 20
  };

  const showPrompt = triggers.count || triggers.duration || triggers.intensity || triggers.lowBattery;
  
  const promptText = useMemo(() => {
    const lib = PROMPTS[language];
    const restLib = REST_PROMPTS[language];

    if (triggers.lowBattery) {
      const index = Math.floor(Math.random() * restLib.length);
      return t('carePrompt.lowEnergy') + restLib[index];
    }
    
    if (!showPrompt) return t('carePrompt.default');
    
    let prefix = "";
    if (triggers.intensity) prefix = t('carePrompt.highIntensity');
    else if (triggers.duration) prefix = t('carePrompt.deepFocus');
    else if (triggers.count) prefix = t('carePrompt.achievement');
    
    const index = Math.floor(Math.random() * lib.length);
    return prefix + lib[index];
  }, [showPrompt, triggers.count, triggers.duration, triggers.intensity, triggers.lowBattery, language, t]);

  // 根据用户要求，不再渲染页脚文字
  return null;
};

export default CarePrompt;
