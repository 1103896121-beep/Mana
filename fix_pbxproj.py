import uuid

def generate_pbx_id():
    return uuid.uuid4().hex[:24].upper()

content = open(r'e:\workrooten\Mana\ios\App\App.xcodeproj\project.pbxproj', 'r', encoding='utf-8').read()

file_ref_id = generate_pbx_id()
build_file_id = generate_pbx_id()

# 1. Add to PBXBuildFile section
build_file_str = f'\t\t{build_file_id} /* App.entitlements in Resources */ = {{isa = PBXBuildFile; fileRef = {file_ref_id} /* App.entitlements */; }};\n'
content = content.replace('/* Begin PBXBuildFile section */\n', '/* Begin PBXBuildFile section */\n' + build_file_str)

# 2. Add to PBXFileReference section
file_ref_str = f'\t\t{file_ref_id} /* App.entitlements */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = App.entitlements; sourceTree = "<group>"; }};\n'
content = content.replace('/* Begin PBXFileReference section */\n', '/* Begin PBXFileReference section */\n' + file_ref_str)

# 3. Add to App PBXGroup (where Info.plist usually is)
app_group_start = content.find('/* App */ = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (')
if app_group_start != -1:
    children_start = content.find('(', app_group_start) + 1
    content = content[:children_start] + f'\n\t\t\t\t{file_ref_id} /* App.entitlements */,' + content[children_start:]

# 4. Add the CODE_SIGN_ENTITLEMENTS build setting again
content = content.replace('INFOPLIST_FILE = App/Info.plist;', 'CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n\t\t\t\tINFOPLIST_FILE = App/Info.plist;')

open(r'e:\workrooten\Mana\ios\App\App.xcodeproj\project.pbxproj', 'w', encoding='utf-8').write(content)
print('Successfully integrated App.entitlements into PBXProj structure')
