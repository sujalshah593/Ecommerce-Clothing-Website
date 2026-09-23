import re
f1="index.html"
with open(f1) as f:
    d1 = f.read()
d1 = d1.replace("<link href=\"https://fonts.googleapis.com/css2?family=Titan+One&display=swap\" rel=\"stylesheet\">", "<link href=\"https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Titan+One&display=swap\" rel=\"stylesheet\">")
d1 = d1.replace("font-family: \"Titan One\", sans-serif;\n  font-optical-sizing: auto;\n  font-weight: 300;", "font-family: \"Poppins\", sans-serif;\n  font-weight: 300;")
d1 = d1.replace("font-family: \"Titan One\", sans-serif;\n  font-optical-sizing: auto;\n  font-weight: 700;", "font-family: \"Poppins\", sans-serif;\n  font-weight: 600;")
d1 = re.sub(r"body\s*\{\s*font-family:\s*\"Titan One\", sans-serif;", "body {\n  font-family: \"Poppins\", sans-serif;", d1)
with open(f1, "w") as f:
    f.write(d1)

f2="src/App.css"
with open(f2) as f:
    d2 = f.read()
d2 = d2.replace("font-family: \"Titan One\", sans-serif !important;", "font-family: \"Poppins\", sans-serif;\n  }\n  h1, h2, h3, h4, h5, h6, .header, .header1 {\n    font-family: \"Titan One\", sans-serif;")
with open(f2, "w") as f:
    f.write(d2)
