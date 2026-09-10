'use client';
import {appointmentCalendar} from '@/lib/appointment-calendar.mjs';
import PatientWelcome from '@/components/patient-welcome';
import CareContacts from '@/components/care-contacts';
import GoogleReview from '@/components/google-review';
import {readingUrl,hasMobileGuide} from '@/lib/guide-links.mjs';
import { useEffect, useState } from 'react';
import { Flower2, Phone, CalendarDays, Smartphone } from 'lucide-react';
import {
  careSchedule,
  careWindow,
  warningSigns,
  vaccineWindow,
  rsvSeasonWindow,
} from '@/lib/care-plan.mjs';
import { handouts } from '@/lib/handouts.mjs';
import { createPatientLink } from '@/lib/patient-link.mjs';
import { iso, today } from '@/lib/pregnancy.mjs';
import {
  linkPreferences,
  upcomingCare,
  suggestedGuides,
  appointmentKey,
  validAppointment,
  spanishCare,
  spanishWarnings,
} from '@/lib/patient-experience.mjs';
export default function PatientHome({
  result,
  selected,
  download,
  clear,
}: {
  result: any;
  selected: string[];
  download: () => void;
  clear: () => void;
}) {
  const [language, setLanguage] = useState('en'),
    [theme, setTheme] = useState('green'),
    [assigned, setAssigned] = useState(false),
    [issued, setIssued] = useState(''),
    [appointment, setAppointment] = useState(''),
    [editing, setEditing] = useState(true),
    [notice, setNotice] = useState(''),
    [query, setQuery] = useState(''),
    [guideLimit, setGuideLimit] = useState(3),
    [allLanguages, setAllLanguages] = useState(false),
    [link, setLink] = useState('');
  const es = language === 'es',
    t = (en: string, spanish: string) => (es ? spanish : en);
  useEffect(() => {
    const p = linkPreferences(window.location.hash);
    setLanguage(p.language);
    setAssigned(p.assigned);
    setIssued(p.issued || '');
    setLink(
      window.location.hash.includes('due=')
        ? window.location.href
        : createPatientLink(
            window.location.origin + window.location.pathname,
            iso(result.due),
            selected,
          ),
    );
    setAppointment('');
    setEditing(true);
    try {
      const a = localStorage.getItem(appointmentKey(iso(result.due)));
      if (a && validAppointment(a)) {
        setAppointment(a);
        setEditing(false);
      }
    } catch {}
  }, [result.due, selected]);
  useEffect(() => {
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = 'en';
    };
  }, [language]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bloom-color-v1');
      if (saved === 'blue' || saved === 'pink') setTheme(saved);
    } catch {}
  }, []);
  function changeTheme(value: string) {
    setTheme(value);
    try { localStorage.setItem('bloom-color-v1', value); }
    catch { setNotice(t('Color changed for this visit. This browser could not save it.', 'El color cambió para esta visita. Este navegador no pudo guardarlo.')); }
  }
  function changeLanguage(value: string) {
    setLanguage(value);
    const u = new URL(link || window.location.href),
      p = new URLSearchParams(u.hash.slice(1));
    p.set('lang', value);
    u.hash = p.toString();
    window.history.replaceState(null, '', u);
    setLink(u.href);
  }
  const date = (d: number) =>
    new Intl.DateTimeFormat(es ? 'es-US' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(d * 86400000));
  const dates = (w: { start: number; end: number | null }) =>
    w.end === null
      ? `${date(w.start)} ${t('onward', 'en adelante')}`
      : `${date(w.start)} – ${date(w.end)}`;
  const title = (item: any) =>
    es ? spanishCare[careSchedule.indexOf(item)][0] : item.title;
  const items = (item: any) =>
    es ? spanishCare[careSchedule.indexOf(item)][1] : item.items;
  const weeks = (item: any) =>
    es ? item.label.replace('weeks', 'semanas') : item.label;
  const upcoming = upcomingCare(result),
    guides = suggestedGuides(result.weeks, language, selected),
    tdap = vaccineWindow(result.start, 27, 36),
    rsv = rsvSeasonWindow(result.start);
  const docs = handouts
    .filter(
      (h) =>
        (!es || allLanguages || h.language === 'Español') &&
        `${h.title} ${h.description}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(selected.includes(b.id)) - Number(selected.includes(a.id)),
    );
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setNotice(t('Link copied.', 'Enlace copiado.'));
    } catch {
      setNotice(
        t(
          'Select and copy the link below.',
          'Seleccione y copie el enlace de abajo.',
        ),
      );
    }
  }
  function saveAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!validAppointment(appointment)) return;
    try {
      localStorage.setItem(appointmentKey(iso(result.due)), appointment);
      setEditing(false);
      setNotice(
        t(
          'Appointment saved on this device.',
          'Cita guardada en este dispositivo.',
        ),
      );
    } catch {
      setNotice(
        t(
          'This browser could not save the appointment.',
          'Este navegador no pudo guardar la cita.',
        ),
      );
    }
  }
  function addAppointmentToCalendar(){
    try {
      const url=URL.createObjectURL(new Blob([appointmentCalendar(appointment,es)],{type:'text/calendar;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='bloom-appointment.ics';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),60000);
      setNotice(t('Open the calendar file to review and save your appointment.','Abra el archivo de calendario para revisar y guardar su cita.'));
    } catch {setNotice(t('Please enter a valid appointment date and time.','Ingrese una fecha y hora válidas para la cita.'));}
  }
  function removeAppointment() {
    try {
      localStorage.removeItem(appointmentKey(iso(result.due)));
      setAppointment('');
      setEditing(true);
      setNotice(t('Appointment removed.', 'Cita eliminada.'));
    } catch {
      setNotice(
        t(
          'This browser could not remove the appointment.',
          'Este navegador no pudo eliminar la cita.',
        ),
      );
    }
  }
  function anchor(e: React.MouseEvent) {
    const a = (e.target as HTMLElement).closest('a');
    if (a?.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      document
        .getElementById(a.getAttribute('href')!.slice(1))
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  const guideCard = (h: (typeof handouts)[number]) => (
    <a
      className="patient-guide"
      key={h.id}
      href={readingUrl(h)}
      target="_blank"
      rel="noreferrer"
    >
      <span>
        {selected.includes(h.id)
          ? t('Selected for your visit', 'Seleccionado para su consulta')
          : t('From the library', 'De la biblioteca')}
      </span>
      <h3>{h.title}</h3>
      <p>
        {h.language} · {hasMobileGuide(h.id)?t('Mobile guide','Guía móvil'):'PDF'} · {h.pages} {t('pages', 'páginas')}
      </p>
      <b>{t('Read guide', 'Leer guía')} ↗</b>
    </a>
  );
  return (
    <div className="patient-home" data-theme={theme} onClick={anchor}>
      <header>
        <a className="brand" href="#this-week">
          <Flower2 /> bloom<span>Dr. Geffrey Klein</span>
        </a>
        <select
          aria-label="Language / Idioma"
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </header>
      <main>
        <PatientWelcome spanish={es}/>
        <fieldset className="patient-colors">
          <legend>{t('Make Bloom yours', 'Personalice Bloom')}</legend>
          <p>{t('Keep green for a surprise, or choose a color anytime.', 'Conserve el verde para la sorpresa o elija un color cuando quiera.')}</p>
          <div className="color-options">
            {[
              ['green', t('Surprise / unknown', 'Sorpresa / aún no sé'), t('Green', 'Verde')],
              ['blue', t('Boy', 'Niño'), t('Blue', 'Azul')],
              ['pink', t('Girl', 'Niña'), t('Pink', 'Rosa')],
            ].map(([value, label, color]) => <label key={value}>
              <input type="radio" name="bloom-color" value={value} checked={theme === value} onChange={() => changeTheme(value)}/>
              <span className={`color-swatch swatch-${value}`} aria-hidden="true"/>
              <span>{label}<small>{color}</small></span>
            </label>)}
          </div>
        </fieldset>
        <nav className="patient-tabs">
          <a href="#this-week">{t('This week', 'Esta semana')}</a>
          <a href="#patient-plan">{t('Timeline', 'Calendario')}</a>
          <a href="#patient-guides">{t('Guides', 'Guías')}</a>
          <a href="#care-contacts">{t('Hospital & contacts', 'Hospital y contactos')}</a>
          <a href="#patient-alerts">{t('When to call', 'Cuándo llamar')}</a>
        </nav>
        <section className="patient-week panel" id="this-week" tabIndex={-1}>
          <div className="eyebrow">
            {t('YOUR PREGNANCY, TODAY', 'SU EMBARAZO, HOY')}
          </div>
          <h1>
            {result.elapsed < 0 ? (
              t('Your weeks ahead.', 'Sus próximas semanas.')
            ) : (
              <>
                {result.weeks}
                <small>{t('weeks', 'semanas')}</small> {result.days}
                <small>{t('days', 'días')}</small>
              </>
            )}
          </h1>
          <p>{date(today())}</p>
          <div className="assigned-date">
            <span>
              {assigned
                ? t(
                    'Due date assigned by Dr. Klein',
                    'Fecha probable de parto asignada por el Dr. Klein',
                  )
                : t('Your estimated due date', 'Su fecha probable de parto')}
            </span>
            <strong>{date(result.due)}</strong>
            {assigned && issued && (
              <small>
                {t('Link issued', 'Enlace emitido')}: {issued}
              </small>
            )}
          </div>
          <p>
            {t(
              'Your weeks update automatically. Keep the date your care team assigns.',
              'Sus semanas se actualizan automáticamente. Mantenga la fecha asignada por su equipo médico.',
            )}
          </p>
          {result.elapsed >= 294 && (
            <p className="error">
              {t(
                'At or beyond 42 weeks: if still pregnant, contact your maternity team about your care plan.',
                'A las 42 semanas o más: si sigue embarazada, comuníquese con su equipo médico sobre su plan de atención.',
              )}
            </p>
          )}
          <a className="urgent-shortcut" href="#patient-alerts">
            <Phone size={16} />
            {t(
              'Warning signs & when to call',
              'Señales de alarma y cuándo llamar',
            )}
          </a>
        </section>
        <section className="patient-next">
          <div className="eyebrow">
            {t('COMING INTO FOCUS', 'PRÓXIMOS PASOS')}
          </div>
          <h2>
            {t('Your next care windows', 'Sus próximas etapas de atención')}
          </h2>
          <p>
            {t(
              'Planning guidance, not booked appointments. Your care team may adjust this schedule.',
              'Orientación para planificar, no citas programadas. Su equipo puede ajustar este calendario.',
            )}
          </p>
          <div className="patient-two">
            {upcoming.map((item) => (
              <article className="panel" key={item.id}>
                <span className="eyebrow">{weeks(item)}</span>
                <h3>{title(item)}</h3>
                <p>{dates(careWindow(item, result.start))}</p>
                <ul>
                  {(items(item) as string[]).map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section className="appointment panel">
          <div className="eyebrow">
            <CalendarDays size={16} />
            {t('YOUR ACTUAL APPOINTMENT', 'SU CITA PROGRAMADA')}
          </div>
          <h2>{t('Next on your calendar', 'Su próxima cita')}</h2>
          <p>
            {t(
              'Record a visit you have already scheduled with the office. This does not book a visit or notify the practice.',
              'Anote una cita que ya programó con el consultorio. Esto no programa una cita ni avisa al consultorio.',
            )}
          </p>
          {editing ? (
            <form onSubmit={saveAppointment}>
              <label htmlFor="appointment-time">
                {t('Date & time (local time)', 'Fecha y hora (hora local)')}
              </label>
              <input
                id="appointment-time"
                type="datetime-local"
                required
                value={appointment}
                onChange={(e) => setAppointment(e.target.value)}
              />
              <button className="primary" type="submit">
                {t('Save appointment', 'Guardar cita')}
              </button>
            </form>
          ) : (
            <>
              <h3>
                {new Intl.DateTimeFormat(es ? 'es-US' : 'en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(new Date(appointment))}
              </h3>
              <div className="phone-actions">
                <button onClick={addAppointmentToCalendar}><CalendarDays size={17}/>{t('Add to calendar','Agregar al calendario')}</button><button onClick={() => setEditing(true)}>
                  {t('Edit', 'Editar')}
                </button>
                <button onClick={removeAppointment}>
                  {t('Remove', 'Eliminar')}
                </button>
              </div>
            </>
          )}
          <p className="helper">
            {t(
              'Saved only in this browser for this due date. It is not included in your shared link, does not sync between devices, and sends no reminders.',
              'Se guarda solo en este navegador para esta fecha de parto. No se incluye en su enlace, no se sincroniza entre dispositivos y no envía recordatorios.',
            )}
          </p>
        <p className="helper">{t('Calendar entries use the local time entered above and reserve 30 minutes; adjust the end time when saving. Later changes in Bloom do not update your calendar—edit the existing calendar event to avoid duplicates.','Los eventos usan la hora local indicada y reservan 30 minutos; ajuste la hora de finalización al guardar. Los cambios posteriores en Bloom no actualizan su calendario; edite el evento existente para evitar duplicados.')}</p></section>
        <section className="patient-reading">
          <h2>
            {t('A little reading for right now', 'Lecturas para este momento')}
          </h2>
          <div className="patient-two">{guides.map(guideCard)}</div>
        </section>
        <section className="save-guide panel">
          <div className="section-heading">
            <img
              src="/apple-touch-icon.png"
              alt="Bloom"
              width="64"
              height="64"
            />
            <div>
              <h2>
                {t('One tap away, on your iPhone', 'A un toque, en su iPhone')}
              </h2>
              <p>
                {t(
                  'Give Bloom a place on your Home Screen.',
                  'Agregue Bloom a su pantalla de inicio.',
                )}
              </p>
            </div>
          </div>
          <ol>
            <li>
              {t(
                'Open your personal link in Safari.',
                'Abra su enlace personal en Safari.',
              )}
            </li>
            <li>
              {t(
                'Tap Share (the square with an upward arrow). If needed, open the More menu first.',
                'Toque Compartir (el cuadrado con una flecha hacia arriba). Si es necesario, abra primero el menú Más.',
              )}
            </li>
            <li>
              {t(
                'Choose Add to Home Screen, name it Bloom, then tap Add.',
                'Elija Agregar a inicio, escriba Bloom y toque Agregar.',
              )}
            </li>
          </ol>
          <p>
            {t(
              'Keep the complete personal link. If the icon opens the calculator instead of your timeline, reopen your original message link and add it again.',
              'Conserve el enlace personal completo. Si el icono abre la calculadora en vez de su calendario, abra el enlace del mensaje original y agréguelo otra vez.',
            )}
          </p>
          <a
            href="https://support.apple.com/en-mide/guide/iphone/iphea86e5236/ios"
            target="_blank"
            rel="noreferrer"
          >
            {t('Apple’s instructions ↗', 'Instrucciones de Apple (inglés) ↗')}
          </a>
          <br />
          <button onClick={copy}>
            {t('Copy my personal link', 'Copiar mi enlace personal')}
          </button>
          <input
            readOnly
            aria-label={t('Personal link', 'Enlace personal')}
            value={link}
            onFocus={(e) => e.target.select()}
          />
          <details>
            <summary>{t('Using Android?', '¿Usa Android?')}</summary>
            <p>
              {t(
                'Open the link in Chrome, tap the three-dot menu, then Add to Home screen. Keep the complete link.',
                'Abra el enlace en Chrome, toque el menú de tres puntos y luego Agregar a la pantalla principal. Conserve el enlace completo.',
              )}
            </p>
          </details>
        </section>
        <section id="patient-plan">
          <div className="eyebrow">
            {t('THE FULL PICTURE', 'EL PANORAMA COMPLETO')}
          </div>
          <h2>{t('Your care timeline', 'Su calendario de atención')}</h2>
          <div className="care-stages">
            {careSchedule.map((item) => {
              const w = careWindow(item, result.start),
                active =
                  w.start <= result.start + result.elapsed &&
                  (w.end === null || w.end >= result.start + result.elapsed);
              return (
                <article
                  className={'care-stage ' + (active ? 'current-stage' : '')}
                  key={item.id}
                >
                  <div className="care-stage-time">
                    <b>{weeks(item)}</b>
                    <time>{dates(w)}</time>
                    {active && (
                      <span className="care-status">
                        {t('In your window', 'En esta etapa')}
                      </span>
                    )}
                  </div>
                  <div className="care-stage-content">
                    <h3>{title(item)}</h3>
                    <ul>
                      {(items(item) as string[]).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
          <p>
            {t(
              'Planning windows are not appointments or a record of completed tests.',
              'Estas etapas no son citas ni un registro de pruebas realizadas.',
            )}
          </p>
          <div className="phone-actions">
            <button onClick={download}>
              {t(
                'Export planning calendar (English)',
                'Exportar calendario orientativo (inglés)',
              )}
            </button>
            <button onClick={() => window.print()}>
              {t('Print', 'Imprimir')}
            </button>
          </div>
        </section>
        <section className="vaccine-section">
          <h2>
            {t('Vaccines during pregnancy', 'Vacunas durante el embarazo')}
          </h2>
          <p>
            {t(
              'Discuss your vaccine history and timing with Dr. Klein.',
              'Converse con el Dr. Klein sobre sus vacunas previas y cuándo vacunarse.',
            )}
          </p>
          <div className="vaccine-grid">
            <article>
              <h3>Tdap</h3>
              <p>
                {t(
                  '27–36 weeks, every pregnancy, preferably early in the window.',
                  'Semanas 27–36 en cada embarazo, preferiblemente al inicio de este período.',
                )}
              </p>
              <time>{dates(tdap)}</time>
            </article>
            <article>
              <h3>{t('Flu shot', 'Vacuna contra la influenza')}</h3>
              <p>
                {t(
                  'Each flu season, in any trimester. Do not use the live nasal-spray vaccine.',
                  'Cada temporada de influenza, en cualquier trimestre. No se usa la vacuna viva en aerosol nasal.',
                )}
              </p>
            </article>
            <article>
              <h3>COVID-19</h3>
              <p>
                {t(
                  'Recommended by your practice. Discuss current recommendations and your history with Dr. Klein.',
                  'Recomendada por su consultorio. Converse con el Dr. Klein sobre las recomendaciones actuales y sus antecedentes.',
                )}
              </p>
            </article>
            <article>
              <h3>{t('RSV · Abrysvo', 'VRS · Abrysvo')}</h3>
              <p>
                {t(
                  '32–36 weeks, usually September–January here. If vaccinated in a previous pregnancy, ask about infant protection instead of another maternal dose.',
                  'Semanas 32–36, generalmente de septiembre a enero en esta región. Si se vacunó en un embarazo anterior, pregunte por la protección del bebé en lugar de otra dosis materna.',
                )}
              </p>
              <time>
                {rsv
                  ? dates(rsv)
                  : t(
                      'Your window falls outside the usual season. Ask about infant protection.',
                      'Su período está fuera de la temporada habitual. Pregunte cómo proteger al bebé.',
                    )}
              </time>
            </article>
          </div>
          <p>
            {t(
              'Avoid MMR, varicella, and live nasal-spray flu vaccines during pregnancy. Yellow fever is usually avoided; unavoidable travel requires an individual risk–benefit assessment.',
              'Evite las vacunas triple viral (MMR), contra la varicela y contra la influenza viva en aerosol nasal durante el embarazo. La vacuna contra la fiebre amarilla generalmente se evita; los viajes inevitables requieren una evaluación individual de riesgos y beneficios.',
            )}
          </p>
          <a
            href="https://www.cdc.gov/vaccines-pregnancy/hcp/vaccination-guidelines/index.html"
            target="_blank"
            rel="noreferrer"
          >
            {t('CDC guidance (English)', 'Guía de los CDC (inglés)')} ↗
          </a>
        </section>
        <section id="patient-guides">
          <details className="guide-disclosure" open>
          <summary><span><strong>{t('Your patient guides', 'Sus guías para pacientes')}</strong><small>{handouts.length} {t('guides in your pregnancy library · tap to collapse', 'guías en su biblioteca del embarazo · toque para cerrar')}</small></span><span className="guide-chevron" aria-hidden="true">⌄</span></summary>
          <div className="guide-disclosure-body">
          <p>
            {t(
              'Selected guides appear first. A topic does not mean you have that condition.',
              'Las guías seleccionadas aparecen primero. Un tema no significa que usted tenga esa afección.',
            )}
          </p>
          {es && (
            <>
              <p>
                Actualmente hay una guía en español. Los PDF en inglés conservan
                su idioma original.
              </p>
              <label>
                <input
                  type="checkbox"
                  checked={allLanguages}
                  onChange={(e) => {setAllLanguages(e.target.checked);setGuideLimit(3);}}
                />{' '}
                Mostrar también guías en inglés
              </label>
            </>
          )}
          <div className="patient-library-search">
          <label htmlFor="patient-search">
            {t('Search the entire library', 'Buscar en toda la biblioteca')}
          </label>
          <input
            id="patient-search"
            type="search"
            value={query}
            onChange={(e) => {setQuery(e.target.value);setGuideLimit(3);}}
            placeholder={t(
              'Try nausea, travel, breastfeeding…',
              'Busque náuseas, viajes, lactancia…',
            )}
          />
          <p className="library-result-count" role="status">{t('Showing', 'Mostrando')} {Math.min(guideLimit, docs.length)} {t('of', 'de')} {docs.length} {query ? t('matching guides', 'guías que coinciden') : t('guides', 'guías')}</p>
          </div>
          <div className="patient-two">{docs.slice(0, guideLimit).map(guideCard)}</div>
          {docs.length > guideLimit && <button className="more-guides" onClick={() => setGuideLimit(n => n + 6)}>{t('Show more guides', 'Mostrar más guías')} · {docs.length - guideLimit} {t('remaining', 'restantes')}</button>}
          {docs.length === 0 && (
            <p>
              {t(
                'No guides match your search.',
                'No hay guías que coincidan con su búsqueda.',
              )}
            </p>
          )}
          </div></details>
        </section>
        <CareContacts spanish={es}/>
        <section id="patient-alerts" className="warning-panel">
          <h2>{t('When to call right away', 'Cuándo llamar de inmediato')}</h2>
          <p>
            {t(
              'Call our office immediately or go to Labor & Delivery for:',
              'Llame de inmediato al consultorio o vaya a la unidad de trabajo de parto y parto si presenta:',
            )}
          </p>
          <ul>
            {(es ? spanishWarnings : warningSigns).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div className="warning-actions">
            <a href="tel:+12815570300">
              <Phone size={18} />
              {t('Call', 'Llamar al')} (281) 557-0300
            </a>
            <a
              href="https://www.hcahoustonhealthcare.com/locations/clear-lake/specialties/womens-care/labor-and-delivery"
              target="_blank"
              rel="noreferrer"
            >
              Clear Lake Labor & Delivery ↗
            </a>
          </div>
          <p>
            {t(
              'After hours: call our office or go directly to HCA Houston Healthcare Clear Lake Labor & Delivery (Clear Lake Regional Medical Center). For a life-threatening emergency, call 911.',
              'Fuera del horario de atención: llame al consultorio o vaya directamente a la unidad de trabajo de parto y parto de HCA Houston Healthcare Clear Lake (Clear Lake Regional Medical Center). Si hay peligro de muerte, llame al 911.',
            )}
          </p>
        </section>
        <section className="panel">
          <h2>
            {t('If your due date changes', 'Si cambia su fecha de parto')}
          </h2>
          <p>
            {t(
              'Use the new link from your care team and replace your old bookmark or Home Screen icon. This link keeps its original date and cannot receive updates. The assigned-date label is informational, not a verified signature.',
              'Use el nuevo enlace de su equipo médico y reemplace su marcador o icono anterior. Este enlace conserva su fecha original y no puede recibir actualizaciones. La etiqueta de fecha asignada es informativa, no una firma verificada.',
            )}
          </p>
          <p>
            {t(
              'Anyone with your link can see its due date and selected topics. Appointment details stay in this browser. This page does not send messages to the office.',
              'Cualquier persona con su enlace puede ver la fecha de parto y los temas seleccionados. Los detalles de su cita permanecen en este navegador. Esta página no envía mensajes al consultorio.',
            )}
          </p>
        </section>
        <p className="status" role="status">
          {notice}
        </p>
        <GoogleReview spanish={es}/><footer>
          <p>
            {t(
              'Confirm dates and care decisions with your maternity team.',
              'Confirme las fechas y decisiones de atención con su equipo médico.',
            )}
          </p>
          <a href="https://geffreyklein.com" target="_blank" rel="noreferrer">
            Dr. Geffrey Klein ↗
          </a>
          <button
            onClick={() => {
              removeAppointment();
              clear();
            }}
          >
            {t('Clear my dates & appointment', 'Borrar mis fechas y cita')}
          </button>
        </footer>
      </main>
    </div>
  );
}
