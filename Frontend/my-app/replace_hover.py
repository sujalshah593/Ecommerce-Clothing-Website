import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("hover:bg-[#B76E4D]", "hover:bg-blue-600")
    new_content = new_content.replace("hover:text-[#B76E4D]", "hover:text-blue-600")
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            replace_in_file(os.path.join(root, file))
