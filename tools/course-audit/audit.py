import json,re,collections
import sys
d=json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'course-audit-raw.json'))
CYR=re.compile('[А-Яа-яЁё]')
NONTASK={'text','tip','notice','vocab','image','heading'}
# sub-goal sentences that fit any lesson (contract rule 2)
GENERIC=['mõistab teksti põhiideed ja detaile','märkab ja selgitab tunni keelemustrit','kasutab õpitut suulises ja kirjalikus suhtluses','kasutab mooduli põhisõnavara uutes lausetes']
def items(b):
    dd=b['d'] or {}
    if isinstance(dd.get('groups'),list):
        total=0
        for g in dd['groups']:
            v=(g or {}).get('items') if isinstance(g,dict) else None
            total+=len(v) if isinstance(v,list) else len([x for x in re.split(r'[,\n]',str(v or '')) if x.strip()])
        return total
    for k in ('questions','statements','pairs','items','sentences','rows'):
        v=dd.get(k)
        if isinstance(v,list): return len(v)
        if isinstance(v,str) and v.strip(): return len([l for l in v.split('\n') if l.strip()])
    return None
def words(t): return len(str(t or '').split())
lv_order={'A2':0,'B1':1,'B2':2,'C1':3}
report=[]; per=collections.defaultdict(collections.Counter)
for r in sorted(d,key=lambda r:(lv_order.get(r['level'],9),r['mod'] or 0,r['num'] or 0)):
    p=[]
    if not r['goal']: p.append('нет записки учителю (goal)')
    lesson_goals={}; lesson_used=collections.Counter(); cando=set()
    if not r['sc']: p.append('нет критерия успеха')
    for ph,lab in (('discover','Avasta'),('practice','Harjuta'),('transfer','Kasuta')):
        s=r['phases'].get(ph)
        if not s: p.append(f'{lab}: нет листа'); continue
        if s['status']!='published': p.append(f'{lab}: черновик'); continue
        bl=s['blocks']; tasks=[b for b in bl if b['t'] not in NONTASK]
        if not s['canDo']: p.append(f'{lab}: нет цели на листе')
        if len(tasks)<5: p.append(f'{lab}: {len(tasks)} заданий')
        small=[b['t'] for b in tasks if b['t'] in ('choice','truefalse','gaps','match','errorfix','transformation','wordforms','categorize','wordorder') and (items(b) or 0)<4]
        if small: p.append(f'{lab}: задания <4 пунктов ({len(small)})')
        goals=s.get('goals') or {}
        if len(goals)<3: p.append(f'{lab}: <3 подцелей')
        generic=[g for g in goals.values() if any(x in g for x in GENERIC)]
        if generic: p.append(f'{lab}: шаблонные подцели ({len(generic)})')
        lesson_goals.update(goals); lesson_used.update(b.get('g') for b in tasks if b.get('g'))
        if s['canDo']:
            cando.add(s['canDo'].strip())
            if CYR.search(s['canDo']): p.append(f'{lab}: цель ученика не на эстонском')
        if ph=='discover':
            reads=[b for b in bl if b['t'] in ('reading','dialogue','listening')]
            longtext=any(words((b['d'] or {}).get('passage') or (b['d'] or {}).get('text'))>=60 for b in bl if b['t'] in ('reading','text'))
            if not reads and not longtext: p.append('Avasta: нет текста/диалога')
    weak=[k for k in lesson_goals if lesson_used[k]<2]
    if weak: p.append(f'подцели с <2 заданиями в уроке ({len(weak)})')
    if len(cando)>1: p.append('разная цель ученика на листах')
    per[r['level']]['уроков']+=1
    for x in p: per[r['level']][re.sub(r'\(\d+\)|\d+ заданий','N',x)]+=1
    report.append({'id':r['id'],'level':r['level'],'mod':r['mod'],'num':r['num'],'title':r['title'],'problems':p})
json.dump(report,open('course-audit.json','w'),ensure_ascii=False,indent=0)
for lv in ['A2','B1','B2','C1']:
    c=per[lv]; tot=c.pop('уроков',0); ok=sum(1 for x in report if x['level']==lv and not x['problems'])
    print(f'\n== {lv}: уроков {tot}, без замечаний {ok}')
    for k,v in c.most_common(): print(f'  {v:4} {k}')
