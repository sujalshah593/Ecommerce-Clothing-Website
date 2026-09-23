f = "src/App.css"
with open(f) as file:
    data = file.read()
data = data.replace('font-family: "Titan One", sans-serif;', 'font-family: "Titan One", sans-serif;\n    font-weight: 400 !important;\n    letter-spacing: 0.5px;')
with open(f, "w") as file:
    file.write(data)
