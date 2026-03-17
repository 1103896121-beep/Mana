import sys

file_path = r'e:\workrooten\Mana\ios\App\App.xcodeproj\project.pbxproj'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 提升到 Build 25 和 Version 1.1.0
new_content = content.replace('CURRENT_PROJECT_VERSION = 22;', 'CURRENT_PROJECT_VERSION = 25;')
new_content = new_content.replace('MARKETING_VERSION = 1.0;', 'MARKETING_VERSION = 1.1.0;')

# 兜底匹配（防止由于之前的修改导致分号缺失等情况）
if 'CURRENT_PROJECT_VERSION = 25' not in new_content:
    new_content = content.replace('CURRENT_PROJECT_VERSION = 20', 'CURRENT_PROJECT_VERSION = 25')
    new_content = new_content.replace('CURRENT_PROJECT_VERSION = 21', 'CURRENT_PROJECT_VERSION = 25')
    new_content = new_content.replace('CURRENT_PROJECT_VERSION = 22', 'CURRENT_PROJECT_VERSION = 25')

if 'MARKETING_VERSION = 1.1.0' not in new_content:
    new_content = new_content.replace('MARKETING_VERSION = 1.0', 'MARKETING_VERSION = 1.1.0')

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Updated build to 25 and marketing version to 1.1.0")
else:
    print("Failed: No version strings matched.")
