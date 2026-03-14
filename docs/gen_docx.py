import os
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def create_doc():
    doc = Document()
    
    # Title
    title = doc.add_heading('Mana (能量) —— 产品需求分析文档', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 1. 项目背景与愿景
    doc.add_heading('1. 项目背景与愿景', level=1)
    p = doc.add_paragraph()
    p.add_run('“生产力不是清单的堆砌，而是能量的流动。”').bold = True
    doc.add_paragraph('Mana 是一款旨在打破传统“枯燥列表式”任务管理的创新应用。它将抽象的任务管理具象化为“能量管理”，通过物理引擎、魔法化视觉和灵动音效，为用户提供一种掌控感与愉悦感并存的效率体验。')

    # 2. 目标用户
    doc.add_heading('2. 目标用户', level=1)
    doc.add_paragraph('主要面向追求审美、重视心理平衡、活跃于 iOS 生态系统的创造者、职场精英及极简主义者。')

    # 3. 核心功能需求
    doc.add_heading('3. 核心功能需求', level=1)
    
    doc.add_heading('3.1 能量驱动的任务系统', level=2)
    doc.add_paragraph('• Mana值分配：每个任务需绑定特定的能量消耗权重。')
    doc.add_paragraph('• 可视化消耗：随着任务进度，总 Mana 池呈现动态流转效果。')
    doc.add_paragraph('• 爆炸反馈：任务完成时，原本包裹任务的气泡将触发“爆炸”扩散粒子动效，象征能量的释放。')
    
    doc.add_heading('3.2 任务列表 (Bubble-Style List) 交互系统', level=2)
    doc.add_paragraph('• 排序与优先级：默认按创建时间排序；用户可在创建时设置优先级，或通过在列表中自由拖拽任务项来实时调整优先级。')
    doc.add_paragraph('• 气泡列表：任务以列表形式呈现确保直观，但单个任务项采用气泡视觉包裹。')
    doc.add_paragraph('• 物理交互：列表项在滑动时具有软粘性质感，模拟物理反馈。')
    
    doc.add_heading('3.3 动态能量流转与智能关怀提示', level=2)
    doc.add_paragraph('• 能量滑动条：用户可通过滑动条实时感知任务对总能量平衡的影响。')
    doc.add_paragraph('• 实时反馈：任务完成时伴随光晕扩散、能量汇聚等魔法化动效。')
    doc.add_paragraph('• 智能提醒：系统建立关怀提示词库，实时监测每日任务完成量。当用户过度劳累时，随机弹出库中的温馨或幽默词句，提醒休息。')
    
    doc.add_heading('3.4 艺术化产出分享', level=2)
    doc.add_paragraph('• 定制卡片：将一天的生产力数据转化为极致简约的视觉卡片，便于社交分享。')

    # 4. 视觉语言规范 (Visual Language)
    doc.add_heading('4. 视觉语言规范', level=1)
    doc.add_paragraph('• 关键词：灵动、空灵、通透、秩序、魔法。')
    doc.add_paragraph('• 色彩方案：深层蓝 (Deep Blue)、神秘靛 (Indigo)、优雅紫 (Purple)、纯净白 (Clear White)。')
    doc.add_paragraph('• 设计元素：玻璃态 (Glassmorphism)、光晕 (Aura)、微动效 (Micro-animations)。')

    # 5. 技术约束 (iOS 侧)
    doc.add_heading('5. 技术约束与交互要求', level=1)
    doc.add_paragraph('• 响应式设计：适配 iOS 各种屏幕尺寸及灵动岛等硬件特性。')
    doc.add_paragraph('• 动画引擎：底层需结合 Framer Motion 或 Canvas 实现复杂的物理粒子效果。')
    doc.add_paragraph('• 交互性能：保持 60/120 FPS 的极致流畅度，满足用户感官预期。')

    # Save
    output_path = os.path.join('e:\\workrooten\\Mana\\docs', 'Mana-产品需求分析文档.docx')
    doc.save(output_path)
    print(f"Document saved to {output_path}")

if __name__ == "__main__":
    create_doc()
