import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We used this string for most buttons
    new_content = content.replace("bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors", 
                                  "bg-blue-600 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors")
    
    # CartPage checkout
    new_content = new_content.replace("block text-center w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors",
                                      "block text-center w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors")
                                      
    # ProductPage Add to Cart
    new_content = new_content.replace("w-full py-4 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-3 transition-all disabled:opacity-40 hover:bg-blue-700",
                                      "w-full py-4 bg-blue-600 text-white font-semibold rounded-full flex items-center justify-center gap-3 transition-all disabled:opacity-40 hover:bg-blue-700")

    # FavoritesPage view details
    new_content = new_content.replace("bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors",
                                      "bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors")
    
    # Register / Login buttons (they had rounded-md from tailwind UI)
    new_content = new_content.replace("w-full rounded-md py-2.5 text-white font-semibold text-sm transition-colors",
                                      "w-full rounded-full py-2.5 text-white font-semibold text-sm transition-colors")

    # AddProduct / Orders
    new_content = new_content.replace("rounded-md !py-2 !px-4", "rounded-full !py-2 !px-4")
    new_content = new_content.replace("rounded-md !py-2 !px-6", "rounded-full !py-2 !px-6")

    # CartPage Quick View add to cart
    new_content = new_content.replace("absolute left-3 right-3 mt-2 bg-blue-600 text-white rounded-md font-semibold py-3 text-center text-sm hover:bg-blue-700 transition-colors",
                                      "absolute left-3 right-3 mt-2 bg-blue-600 text-white rounded-full font-semibold py-3 text-center text-sm hover:bg-blue-700 transition-colors")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            replace_in_file(os.path.join(root, file))
