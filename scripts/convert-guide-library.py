"""Reflow allowlisted practice PDFs. Requires PyMuPDF and Pillow; never reads source Dropbox archives."""
import json,re,hashlib,statistics
from pathlib import Path
import pymupdf as fitz
ROOT=Path(__file__).resolve().parents[1]
CAT=json.loads((ROOT/'lib/handouts.json').read_text())
OUT=ROOT/'lib/mobile-guides.json'
guides=json.loads(OUT.read_text())
REVIEWED={'28bc72c9','7d319ac9','14a92cf3'}
def clean(t):
 return t.replace('\uf071','☐').replace('\ufffd','').strip()
def cut(lines):
 if len(lines)<2:return [lines]
 # XY cuts keep columns together instead of interleaving their sentences.
 for axis,minimum in [(0,13),(1,9)]:
  intervals=sorted((l['bbox'][axis],l['bbox'][axis+2]) for l in lines);end=intervals[0][1];gaps=[]
  for a,b in intervals[1:]:
   if a-end>=minimum:gaps.append((a-end,(a+end)/2))
   end=max(end,b)
  if gaps:
   _,where=max(gaps);left=[l for l in lines if l['bbox'][axis+2]<=where];right=[l for l in lines if l not in left]
   if left and right:return cut(left)+cut(right)
 return [sorted(lines,key=lambda l:(round(l['bbox'][1]/3),l['bbox'][0]))]
TABLES={
 ('fae524e6',0):[([17,93.75,153,198],[120,132,145,157,170,183,196],None),([216,282,331,402],[96,142,188,222],['Trimester','Extra calories','Notes'])],
 ('9e1e22ab',8):[([46,160.85,274.9,388.4,566],[180,234,274,315,355,396],None)],
 ('9e1e22ab',2):[([46,135,566],[157,217,267,327,376,425,474,535,572,620,669,720],['When','Care and tests'])],
 ('383b9bef',0):[([315,398.75,466.95,555],[242,253.5,264.5,275.5,286.5,298],None)],
 ('8afcfece',0):[([57,217.54,298],[254,265.8,277.2,288.5,301],None)]
}
def blocks(page,docid,pagenum):
 lines=[];excluded=[];bullets=[]
 for b in page.get_text('dict')['blocks']:
  if b['type']!=0:continue
  for l in b['lines']:
   spans=l['spans'];t=clean(''.join(s['text'] for s in spans))
   if not t:continue
   if not re.search(r'\w',t):
    if t in ['•','●','✓','⚠','☐']:bullets.append(l['bbox'])
    continue
   if t.startswith('file:') or re.match(r'^\d+/\d+/\d+,? \d+:\d+ [AP]M$',t) or re.match(r'^\d+/\d+$',t):excluded.append(t);continue
   lines.append({'text':t,'bbox':l['bbox'],'size':max(s['size'] for s in spans),'bold':all(s['flags']&16 for s in spans if s['text'].strip())})
 source_lines=lines.copy()
 for xs,ys,headers in TABLES.get((docid,pagenum),[]):
  inside=[l for l in lines if xs[0]<=(l['bbox'][0]+l['bbox'][2])/2<xs[-1] and ys[0]<=(l['bbox'][1]+l['bbox'][3])/2<ys[-1]]
  rows=[]
  for y0,y1 in zip(ys,ys[1:]):
   row=[]
   for x0,x1 in zip(xs,xs[1:]):
    cell=[l for l in inside if x0<=(l['bbox'][0]+l['bbox'][2])/2<x1 and y0<=(l['bbox'][1]+l['bbox'][3])/2<y1]
    row.append(' '.join(l['text'] for l in sorted(cell,key=lambda l:(l['bbox'][1],l['bbox'][0]))))
   rows.append(row)
  if headers:rows.insert(0,headers)
  lines=[l for l in lines if l not in inside]
  lines.append({'text':' '.join(' '.join(r) for r in rows),'bbox':[xs[0],ys[0],xs[-1],ys[-1]],'size':10,'bold':False,'table':rows})
 result=[]
 for l in lines:l['bullet']=any(abs(b[1]-l['bbox'][1])<max(4,l['size']*.5) and 0<=l['bbox'][0]-b[2]<22 for b in bullets)
 boundaries={0,float(page.rect.height)}
 regions=[]
 for drawing in page.get_drawings():
  r=drawing['rect'];fill=drawing.get('fill')
  if r.width>page.rect.width*.28 and 35<r.height<page.rect.height*.8 and (fill is None or min(fill)<.995):regions.append(r)
 for r in regions:
  if not any(other.contains(r) and other.get_area()>r.get_area()+10 for other in regions):boundaries.add(round(r.y0,1))
 bounds=sorted(boundaries);groups=[]
 for a,b in zip(bounds,bounds[1:]):
  band=[l for l in lines if a<=(l['bbox'][1]+l['bbox'][3])/2<b]
  groups+=cut(band)
 for group in groups:
  last=None
  for l in group:
   if 'table' in l:
    result.append({'type':'table','rows':l['table']});last=None;continue
   t=l['text'];heading=len(t)<130 and (l['bold'] or (t.isupper() and len(t)>5))
   kind='item' if l['bullet'] else 'heading' if heading else 'paragraph'
   if last and kind=='paragraph' and last['type'] in ['paragraph','item'] and 0<=l['bbox'][1]-last['_bbox'][3]<max(7,l['size']*.8) and abs(l['bbox'][0]-last['_bbox'][0])<8 and not re.match(r'^[•✓☐⚠]|^\d+[.)]',t):
    last['text']+=' '+t;last['_bbox']=l['bbox']
   else:
    last={'type':kind,'text':t,'_bbox':l['bbox']};result.append(last)
 for b in result:b.pop('_bbox',None)
 return result,source_lines,excluded
report=[]
for h in CAT:
 if h['id'] in REVIEWED:continue
 path=ROOT/('public'+h['url']);doc=fitz.open(path);sections=[];source=[];omitted=[]
 for n,page in enumerate(doc):
  bs,ls,ex=blocks(page,h['id'],n);source+=ls;omitted+=ex
  # Every page is also retained as an accessible original-layout figure.
  pix=page.get_pixmap(matrix=fitz.Matrix(1.8,1.8),alpha=False)
  image=f"/guide-pages/{h['id']}-{n+1}.webp";pix.pil_save(ROOT/('public'+image),format='WEBP',quality=88)
  sections.append({'title':('Página' if h['language']=='Español' else 'Page')+' '+str(n+1),'blocks':bs,'sourceImage':image,'imageWidth':pix.width,'imageHeight':pix.height})
 text='\n'.join(p.get_text() for p in doc);review=re.search(r'Review Date:\s*([A-Za-z]+\s+20\d{2})',text)
 guide={'title':h['title'],'subtitle':h['description'],'language':h['language'],'practice':"Women's Specialists of Clear Lake",'author':'Geffrey H. Klein, MD','address':'400 W Medical Center Blvd, Suite 300, Webster, TX 77598','converted':'2026-09-07','reviewDate':review.group(1) if review else None,'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sections':sections,'conversion':'reflow','sourceLineCount':len(source)}
 rendered=' '.join(b.get('text',' '.join(' '.join(r) for r in b.get('rows',[]))) for s in sections for b in s['blocks'])
 # Every retained source word must survive layout changes, including doses and units.
 from collections import Counter
 tokens=lambda s:Counter(re.findall(r'\w+',s.lower()))
 missing=tokens(' '.join(l['text'] for l in source))-tokens(rendered)
 if missing:raise ValueError((h['id'],missing))
 # Apply the clinician's previously approved movement and CDC RSV corrections.
 if h['id']=='9e1e22ab':
  for section in sections:
   for block in section['blocks']:
    if block.get('type')=='table':
     for row in block['rows']:
      if len(row)>1 and 'Begin kick counts' in row[1]:row[0]=row[0].replace('20 wks','28 wks')
      for i,cell in enumerate(row):
       row[i]=cell.replace("RSV vaccine (Abrysvo) between 32–36 weeks if you'll deliver in RSV season (September–January).",'RSV vaccine (Abrysvo) at 32 weeks 0 days–36 weeks 6 days during September–January. CDC does not recommend another maternal dose after vaccination in a previous pregnancy; ask about infant RSV immunization instead.')
    elif 'text' in block:
     block['text']=block['text'].replace('Starting around 20 weeks,','Starting around 28 weeks,').replace('RSV (Abrysvo) — 32–36 weeks if delivering September– January','RSV (Abrysvo) — 32 weeks 0 days–36 weeks 6 days during September–January; no repeat maternal dose after vaccination in a previous pregnancy. Ask about infant RSV immunization instead.')
  titles=['Welcome to your pregnancy journey','A note from your care team','Your pregnancy at a glance','When to call & what to expect','Pregnancy basics & testing','Eating, moving & daily life','Common symptoms & what helps','Conditions, labor & postpartum','Healthy weight gain','Contact your care team']
  for section,title in zip(sections,titles):section['title']=title
 if h['id'] in ['9e1e22ab','9d134be6','6a0ba963']:
  spanish=h['language']=='Español'
  note='CDC: Abrysvo at 32 weeks 0 days–36 weeks 6 days during September–January. If you received a maternal RSV vaccine in any previous pregnancy, CDC does not recommend another dose. Discuss infant RSV immunization with your care team instead.'
  if spanish:note='CDC: Abrysvo entre las 32 semanas y 0 días y las 36 semanas y 6 días, de septiembre a enero. Si recibió una vacuna materna contra el VRS en un embarazo anterior, los CDC no recomiendan otra dosis. Consulte a su equipo sobre la inmunización del bebé contra el VRS.'
  guide['clinicalUpdates']=note+(' Fetal movement monitoring starts at 28 weeks, as directed by Dr. Klein.' if h['id']=='9e1e22ab' else '')
  guide['guidanceUrl']='https://www.cdc.gov/rsv/hcp/vaccine-clinical-guidance/pregnant-people.html'
 if h['id']=='19f84a81':
  guide['author']='American College of Obstetricians and Gynecologists (ACOG) · Sample birth plan'
  guide['subtitle']='Read the choices here. Download or print the original PDF to complete your birth plan.'
  for section in sections:
   for i,block in enumerate(section['blocks']):
    if block.get('text')=='n:' and i and section['blocks'][i-1].get('text','').endswith('ob-gy'):
     section['blocks'][i-1]['text']+='n:';block['text']=''
 guides[h['id']]=guide;report.append({'id':h['id'],'pages':len(doc),'retainedLines':len(source),'omittedPrintArtifacts':omitted,'sourceTextCoverage':'100% of retained line tokens'})
OUT.write_text(json.dumps(guides,ensure_ascii=False,indent=2)+'\n')
(ROOT/'lib/mobile-guide-index.json').write_text(json.dumps(list(guides),indent=2)+'\n')
(ROOT/'docs/guide-conversion-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Converted {len(report)} additional guides; {len(guides)} total.')
