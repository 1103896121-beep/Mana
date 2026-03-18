import sys

file_path = r'e:\workrooten\Mana\ios\App\App.xcodeproj\project.pbxproj'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 从 32 换到 33
new_content = content.replace('CURRENT_PROJECT_VERSION = 32;', 'CURRENT_PROJECT_VERSION = 33;')

if content == new_content:
    new_content = content.replace('CURRENT_PROJECT_VERSION = 32', 'CURRENT_PROJECT_VERSION = 33')

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Updated build to 33")
else:
    print("Failed: Could not find CURRENT_PROJECT_VERSION = 32")
