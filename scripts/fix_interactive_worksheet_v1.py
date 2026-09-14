from pathlib import Path
p=Path('haldus-exercises/index.html')
s=p.read_text(encoding='utf-8')
s=s.replace("draft.type==='textarea'?.07:.028", "draft.type==='textarea' ? .07 : .028")
p.write_text(s, encoding='utf-8')
print('fixed generated interactive worksheet syntax')
