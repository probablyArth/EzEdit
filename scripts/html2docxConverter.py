from sys import stdin, argv
from html2docx import html2docx

buf = html2docx(stdin.read(), title="doc")
with open(argv[1], "wb") as file:
    file.write(buf.getvalue())
