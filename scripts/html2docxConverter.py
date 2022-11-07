from sys import stdin, argv
from html2docx import html2docx

recieved = stdin.read()
print(f"Recieved HTML:\n{recieved}")
buf = html2docx(recieved, title="doc")
with open(argv[1], "wb") as file:
    file.write(buf.getvalue())
