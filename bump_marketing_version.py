import sys

file_path = r'e:\workrooten\Mana\ios\App\App.xcodeproj\project.pbxproj'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 升级大版本到 1.1.1
new_content = content.replace('MARKETING_VERSION = 1.1.0;', 'MARKETING_VERSION = 1.1.1;')
if new_content == content:
    new_content = content.replace('MARKETING_VERSION="1.1.0";', 'MARKETING_VERSION="1.1.1";')
if new_content == content:
    new_content = content.replace('MARKETING_VERSION = "1.1.0";', 'MARKETING_VERSION = "1.1.1";')

# 顺便确保 build version 跳到 44
new_content = new_content.replace('CURRENT_PROJECT_VERSION = 43;', 'CURRENT_PROJECT_VERSION = 44;')
new_content = new_content.replace('CURRENT_PROJECT_VERSION="43";', 'CURRENT_PROJECT_VERSION="44";')

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Updated MARKETING_VERSION to 1.1.1 and build to 44")
else:
    print("Failed: Could not find MARKETING_VERSION 1.1.0 or nothing changed")
