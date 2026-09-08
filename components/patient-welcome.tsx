'use client';
import {useEffect,useState} from 'react';
import {Flower2,X,ArrowRight} from 'lucide-react';
const storageKey='bloom-welcome-dismissed-v1';
export default function PatientWelcome({spanish=false}:{spanish?:boolean}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{try{setVisible(localStorage.getItem(storageKey)!=='yes');}catch{setVisible(true);}},[]);
 function dismiss(){setVisible(false);try{localStorage.setItem(storageKey,'yes');}catch{}requestAnimationFrame(()=>{const target=document.getElementById('this-week');target?.focus({preventScroll:true});target?.scrollIntoView({behavior:'smooth',block:'start'});});}
 if(!visible)return null;
 return <section className="patient-welcome" aria-labelledby="welcome-title"><button className="welcome-dismiss" onClick={dismiss} aria-label={spanish?'Cerrar bienvenida':'Dismiss welcome'}><X size={22}/></button><Flower2 size={34} aria-hidden="true"/><h2 id="welcome-title">{spanish?'Bienvenida a Bloom':'Welcome to Bloom'}</h2><p className="welcome-lead">{spanish?'Su acompañante durante el embarazo, del Dr. Klein.':'Your pregnancy companion from Dr. Klein.'}</p><p>{spanish?'Siga su embarazo semana a semana, vea las próximas etapas de atención y lea las guías seleccionadas para usted. Sus semanas se actualizan automáticamente.':'Follow your pregnancy week by week, see upcoming care, and read guides selected for you. Your weeks update automatically.'}</p><p>{spanish?'Guarde su próxima cita y agréguela a su calendario. En Hospital y contactos encontrará cómo llegar al hospital, dónde acudir durante el parto, clases y teléfonos de pediatras y especialistas.':'Save your next appointment and add it to your calendar. Hospital & contacts has directions, where to go in labor, classes, and phone numbers for pediatricians and specialists.'}</p><p>{spanish?'Guarde este enlace o agregue Bloom a su pantalla de inicio para encontrarlo fácilmente.':'Save this link or add Bloom to your Home Screen so it’s easy to find.'}</p><button className="primary" onClick={dismiss}>{spanish?'Ver mi embarazo':'View my pregnancy'}<ArrowRight size={18}/></button></section>;
}
