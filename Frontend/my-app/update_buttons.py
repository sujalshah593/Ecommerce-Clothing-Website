import os
import re

button_class = "bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
# Quick Buy is a bar, maybe we shouldn't change its layout (absolute bottom-0 w-full), just its color and rounding?
# Wait, we already changed Quick buy color to blue-600. Let's just unify the 'rounded' part if they want it.

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # HeroSection Learn More
    content = re.sub(r'bg-blue-600 text-white px-6 py-3 rounded-full text-sm transition hover:bg-blue-700 transition-colors', button_class, content)

    # ProductSection Load More
    content = re.sub(r'px-10 text1 py-3 bg-\[\#FFFFFF\] border border-\[\#111111\] text-\[\#111111\] text-xs font-bold uppercase tracking-widest hover:text-\[\#FFFFFF\] transition hover:bg-blue-600 transition-colors', button_class, content)
    
    # BoysPage / MensPage Load More
    content = re.sub(r'px-12 py-4 border border-\[\#111111\] text-\[10px\] font-bold uppercase tracking-\[0.3em\] hover:text-\[\#FFFFFF\] transition hover:bg-blue-600 transition-colors', button_class, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))
