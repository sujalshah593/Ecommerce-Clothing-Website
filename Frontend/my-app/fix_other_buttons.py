import os
import re

button_class = "bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Replace CartPage Checkout button
    content = re.sub(r'block font-serif text text-center w-full bg-\[\#111111\] text-\[\#FFFFFF\] py-3 uppercase tracking-wider hover:bg-blue-600 transition-colors',
                     r'block text-center w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors', content)

    # Replace productPage Add to Cart button
    content = re.sub(r'w-full py-5 text1 bg-\[\#111111\] text-\[\#FFFFFF\] text-\[10px\] font-bold uppercase tracking-\[0.3em\] flex items-center justify-center gap-3 transition-all disabled:opacity-40 hover:bg-blue-600 transition-colors',
                     r'w-full py-4 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-3 transition-all disabled:opacity-40 hover:bg-blue-700', content)

    # Replace CartPage Continue Shopping
    content = re.sub(r'px-10 py-3 bg-\[\#111111\] text-\[\#FFFFFF\] uppercase tracking-wider text text-sm hover:scale-105 transition-all duration-300 hover:bg-blue-600 transition-colors',
                     button_class, content)

    # Replace FavoritesPage View Details
    content = re.sub(r'bg-accent text1 bg-\[\#111111\] text-\[\#FFFFFF\] hover:cursor-pointer /90 text-accent-foreground px-6 py-3 rounded-md hover:bg-blue-600 transition-colors',
                     r'bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))
