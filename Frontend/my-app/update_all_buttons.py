import os
import re

button_class = "bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # ProfilePage Save Changes
    content = re.sub(r'mt-8 text1 px-10 py-3 bg-\[\#111111\] text-\[\#FFFFFF\] uppercase text-xs hover:bg-blue-600 transition-colors',
                     f"mt-8 {button_class}", content)

    # ProfilePage Add Address
    content = re.sub(r'px-8 py-3 text1 bg-\[\#111111\] text-\[\#FFFFFF\] text-xs uppercase hover:bg-blue-600 transition-colors',
                     button_class, content)

    # CheckoutPage Place Order
    content = re.sub(r'flex-1 text1 bg-\[\#111111\] text-\[\#FFFFFF\] py-3 uppercase tracking-wider hover:bg-blue-600 transition-colors',
                     f"flex-1 {button_class} w-full text-center", content)

    # AddProductPage Add Product
    content = re.sub(r'w-full text1 bg-\[\#111111\] text-\[\#FFFFFF\] py-3 rounded hover:bg-blue-600 transition-colors',
                     f"w-full {button_class}", content)

    # OrdersPage Update Status
    content = re.sub(r'text-sm text1 bg-\[\#111111\] text-\[\#FFFFFF\] px-4 py-2 rounded hover:bg-blue-600 transition-colors',
                     f"{button_class} !py-2 !px-4", content)
                     
    # ProfilePage Delete Address (might have bg-blue-600 now?) Wait, let's search it:
    content = re.sub(r'bg-\[\#111111\] text1 text-\[\#FFFFFF\] px-6 py-2 text-xs uppercase hover:bg-blue-600 transition-colors',
                     f"{button_class} !py-2 !px-6", content)

    # CartPage Quick View Add to Cart
    content = re.sub(r'absolute text left-3 right-3 bg-\[\#111111\] text-\[\#FFFFFF\] text-xs mt-2 py-3 uppercase tracking-wider hover:bg-blue-600 transition-colors',
                     r'absolute left-3 right-3 mt-2 bg-blue-600 text-white rounded-md font-semibold py-3 text-center text-sm hover:bg-blue-700 transition-colors', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))
