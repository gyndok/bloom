'use client';
import {Analytics,type BeforeSendEvent} from '@vercel/analytics/react';

// Patient links carry due dates and reading lists in the URL fragment; report only the path.
function stripPersonal(event:BeforeSendEvent){const url=new URL(event.url);url.hash='';url.search='';return {...event,url:url.toString()};}

export function SiteAnalytics(){return <Analytics beforeSend={stripPersonal}/>;}
