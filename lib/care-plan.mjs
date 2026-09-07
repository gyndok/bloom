import {iso} from './pregnancy.mjs';
export const careSchedule=[
{id:'first-visit',from:8,to:10,label:'8–10 weeks',title:'Your first OB visit',items:['Confirm pregnancy and estimated due date (EDD).','Baseline labs and genetic counseling.']},
{id:'first-screen',from:11,to:14,endDay:97,label:'11–14 weeks',title:'Explore screening options',items:['First-trimester screening and nuchal translucency (NT) ultrasound, if chosen.','Noninvasive prenatal testing (NIPT), if desired. Your care team will arrange the appropriate screening pathway.']},
{id:'second-screen',from:16,to:18,label:'16–18 weeks',title:'Check in & plan ahead',items:['Quad screen, if part of your chosen screening plan.','Listen to the heartbeat and discuss the anatomy scan.']},
{id:'anatomy',from:18,to:22,label:'18–22 weeks',title:'A closer look at your baby',items:['Anatomy ultrasound: a detailed fetal survey.']},
{id:'glucose',from:24,to:28,label:'24–28 weeks',title:'Gestational diabetes screening',items:['Gestational diabetes screen with the 1-hour glucose test.','Plan your Tdap vaccination for 27–36 weeks.']},
{id:'two-week',from:28,to:36,endDay:251,label:'28–36 weeks',title:'Visits every two weeks',items:['See your care team every two weeks until 36 weeks.','RhoGAM around 28 weeks if Rh-negative and indicated.']},
{id:'weekly',from:36,to:40,endDay:279,label:'36–40 weeks',title:'Weekly visits & birth preparation',items:['Weekly visits until your due date.','Group B strep (GBS) swab and birth plan discussion.']},
{id:'past-due',from:40,to:null,label:'40+ weeks',title:'Stay closely connected',items:['Twice-weekly visits and nonstress testing (NST), as directed by your care team.','Discuss induction options.']}
];
export function careWindow(item,start){return {start:start+item.from*7,end:item.to===null?null:start+(item.endDay??item.to*7+6)};}
export function careStatus(item,r){const w=careWindow(item,r.start),current=r.start+r.elapsed;return current<w.start?'Ahead':w.end!==null&&current>w.end?'Earlier window':'In your window';}
export function vaccineWindow(start,from,to){return {start:start+from*7,end:start+to*7+6};}
export function rsvSeasonWindow(start){const w=vaccineWindow(start,32,36);let first=null,last=null;for(let day=w.start;day<=w.end;day++){const month=Number(iso(day).slice(5,7));if(month>=9||month===1){first??=day;last=day;}}return first===null?null:{start:first,end:last};}
export const warningSigns=['Vaginal bleeding, even a small amount.','Severe abdominal pain or cramping.','Severe headache, vision changes, or swelling of the face or hands — possible signs of preeclampsia.','Decreased fetal movement after 28 weeks.','Water breaking or a gush of fluid.','Fever of 100.4°F (38°C) or higher.','Regular contractions before 37 weeks.'];
export function escapeCalendar(value){return value.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');}
export function careCalendarEvents(r,stamp){return careSchedule.flatMap(item=>{const w=careWindow(item,r.start);return ['BEGIN:VEVENT',`UID:bloom-care-${iso(r.start)}-${item.id}@bloom.local`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${iso(w.start).replaceAll('-','')}`,`DTEND;VALUE=DATE:${iso(w.end===null?w.start+1:w.end+1).replaceAll('-','')}`,`SUMMARY:${escapeCalendar(item.title+' — '+item.label+' (planning window)')}`,`DESCRIPTION:${escapeCalendar(item.items.join('\n')+'\nPlanning guidance only. This is not a booked appointment. Confirm dates with your care team.')}`,'TRANSP:TRANSPARENT','END:VEVENT'];});}
