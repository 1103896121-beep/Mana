import sys

file_path = r'e:\workrooten\Mana\ios\App\App.xcodeproj\project.pbxproj'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 从 35 换到 36
new_content = content.replace('CURRENT_PROJECT_VERSION = 35;', 'CURRENT_PROJECT_VERSION = 36;')

if content == new_content:
    new_content = content.replace('CURRENT_PROJECT_VERSION = 35', 'CURRENT_PROJECT_VERSION = 36')

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Updated build to 36")
else:
    print("Failed: Could not find CURRENT_PROJECT_VERSION = 35")
