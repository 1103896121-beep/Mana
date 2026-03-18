import sys

file_path = r'e:\workrooten\Mana\ios\App\App.xcodeproj\project.pbxproj'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 从 28 换到 29
new_content = content.replace('CURRENT_PROJECT_VERSION = 28;', 'CURRENT_PROJECT_VERSION = 29;')

if content == new_content:
    new_content = content.replace('CURRENT_PROJECT_VERSION = 28', 'CURRENT_PROJECT_VERSION = 29')

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Updated build to 29")
else:
    print("Failed: Could not find CURRENT_PROJECT_VERSION = 28")
