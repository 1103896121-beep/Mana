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
    doc.add_paragraph('Mana 是一款针对 iOS 极致优化的效率工具，通过魔法动效与能量管理理念，将枯燥的任务管理转化为愉悦的感官体验。')

    # 2. 核心功能
    doc.add_heading('2. 核心功能需求', level=1)
    
    doc.add_heading('2.1 高级动效与交互', level=2)
    doc.add_paragraph('• 紧凑爆炸反馈：任务完成触发 1.8s 的强化爆炸动效（0.8s 膨胀 + 1.0s 粒子喷发）。')
    doc.add_paragraph('• 过期任务一键清理：支持清除超过 7 天未完成的积压任务。')
    
    doc.add_heading('2.2 iOS 风格视觉优化', level=2)
    doc.add_paragraph('• 苹果美学配色：精调全局字体颜色、亮度和对比度，确保在亮/暗模式下均符合 iOS 高端用户习惯。')
    doc.add_paragraph('• 增强时间戳显示：任务列表显示完整的“年-月-日 时:分”时间标记。')
    
    doc.add_heading('2.3 能量管理与排序', level=2)
    doc.add_paragraph('• 时间驱动模型：任务以所需时间（1-300min）为核心单位。')
    doc.add_paragraph('• 智能关怀监测：基于数量、时长、频率三大维度的压力监测与休息提示。')

    # 3. 视觉语言
    doc.add_heading('3. 视觉语言', level=1)
    doc.add_paragraph('• 双色模式：深度定制的 Light & Dark 系统。')
    doc.add_paragraph('• 交互规范：超大操作热区，更适合大屏幕 iOS 设备单手操作。')

    # 4. 技术栈
    doc.add_heading('4. 技术栈', level=1)
    doc.add_paragraph('• 纯前端架构 (React + TS + Vite + Framer Motion)。')
    doc.add_paragraph('• 本地持久化保证数据完全归属于用户设备。')

    # Save
    output_path = os.path.join('e:\\workrooten\\Mana\\docs', 'Mana-产品需求分析文档.docx')
    doc.save(output_path)
    print(f"Document saved to {output_path}")

if __name__ == "__main__":
    create_doc()
