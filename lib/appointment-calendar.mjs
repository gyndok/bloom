import {validAppointment} from './patient-experience.mjs';
import {escapeCalendar} from './care-plan.mjs';
function fold(line){let result='',part='';for(const char of line){if(new TextEncoder().encode(part+char).length>75){result+=part+'\r\n';part=' ';}part+=char;}return result+part;}
export function appointmentCalendar(value,spanish=false,now=new Date()){
 if(!validAppointment(value))throw Error('Enter a valid appointment date and time.');
 const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const start=new Date(value),end=new Date(start.getTime()+30*60000);
 const description=spanish?'Cita anotada por usted en Bloom. No reserva ni cambia una cita con el consultorio. Se asignan 30 minutos como duración provisional; ajuste la hora de finalización según su cita. Consultorio: (281) 557-0300.':'Appointment entered by you in Bloom. This does not book or change a visit with the office. A 30-minute placeholder is used; adjust the end time to match your appointment. Office: (281) 557-0300.';
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Bloom//Patient Appointment//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:bloom-appointment-${stamp(start)}@bloom.local`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${escapeCalendar(spanish?'Cita con el Dr. Klein':'Appointment with Dr. Klein')}`,`DESCRIPTION:${escapeCalendar(description)}`,'END:VEVENT','END:VCALENDAR',''].map(fold).join('\r\n');
}
