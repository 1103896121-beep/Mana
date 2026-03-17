import os
from PIL import Image

def process_screenshot(input_path, output_dir, target_sizes):
    if not os.path.exists(input_path):
        print(f"Skipping {input_path}, not found.")
        return

    img = Image.open(input_path)
    # Target sizes with names
    # Apple's dimensions:
    # 6.7": 1290 x 2796
    # 6.5": 1242 x 2688
    # 5.5": 1242 x 2208
    
    for name, (tw, th) in target_sizes.items():
        # Ensure output subdir exists
        target_path = os.path.join(output_dir, name)
        os.makedirs(target_path, exist_ok=True)
        
        # Base conversion logic:
        # We need to preserve the app UI in the center. 
        # The input is 750x1334 (or similar).
        # We'll stick it in the center or crop if necessary.
        
        # Calculate aspect ratios
        target_ratio = tw / th
        img_ratio = img.width / img.height
        
        if img_ratio > target_ratio:
            # Image is wider than target
            new_height = th
            new_width = int(new_height * img_ratio)
        else:
            # Image is taller than target
            new_width = tw
            new_height = int(new_width / img_ratio)
            
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Crop center
        left = (new_width - tw) / 2
        top = (new_height - th) / 2
        right = (new_width + tw) / 2
        bottom = (new_height + th) / 2
        
        final_img = resized_img.crop((left, top, right, bottom))
        
        # Save as PNG
        file_name = os.path.basename(input_path).replace('.png', f'_{name}.png')
        save_path = os.path.join(target_path, os.path.basename(input_path))
        final_img.save(save_path, "PNG", quality=100)
        print(f"Saved: {save_path}")

# Source images captured by browser subagent
brain_dir = r"C:\Users\David\.gemini\antigravity\brain\b79e5d8d-1d5a-4556-a150-c6ef71abe57a"
zh_screenshots = [
    "01_home_zh_1773637546433.png",
    "02_add_zh_1773637559315.png",
    "03_detail_zh_1773637611560.png",
    "04_stats_zh_1773637621665.png",
    "05_tipjar_zh_1773637633565.png",
    "06_care_zh_1773637819990.png"
]

output_root = r"E:\workrooten\Mana\screen\zh"
targets = {
    "6.7": (1290, 2796),
    "6.5": (1242, 2688),
    "5.5": (1242, 2208)
}

for f in zh_screenshots:
    process_screenshot(os.path.join(brain_dir, f), output_root, targets)
