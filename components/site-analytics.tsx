'use client';
import {Analytics,track,type BeforeSendEvent} from '@vercel/analytics/react';
import {hasMobileGuide} from '@/lib/guide-links.mjs';

// Patient links carry due dates and reading lists in the URL fragment; report only the path.
function stripPersonal(event:BeforeSendEvent){const url=new URL(event.url);url.hash='';url.search='';return {...event,url:url.toString()};}

export function SiteAnalytics(){return <Analytics beforeSend={stripPersonal}/>;}

// Custom events never include dates or other patient details.
export function trackCalendarExport(type:'timeline'|'appointment'){track('Calendar Exported',{type});}
export function trackHandoutOpen(doc:{id:string;title:string},format:'guide'|'pdf'=hasMobileGuide(doc.id)?'guide':'pdf'){track('Handout Opened',{handout:doc.title,format});}
