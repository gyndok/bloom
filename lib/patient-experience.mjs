import { careSchedule, careWindow } from './care-plan.mjs';
import { handouts } from './handouts.mjs';
export function linkPreferences(hash) {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    language: p.get('lang') === 'es' ? 'es' : 'en',
    assigned: p.get('assigned') === 'klein',
    issued: /^\d{4}-\d{2}-\d{2}$/.test(p.get('issued') || '')
      ? p.get('issued')
      : '',
  };
}
export function handoffLink(link, language, assigned, issued) {
  const u = new URL(link),
    p = new URLSearchParams(u.hash.slice(1));
  p.set('lang', language === 'es' ? 'es' : 'en');
  if (assigned) {
    p.set('assigned', 'klein');
    p.set('issued', issued);
  } else {
    p.delete('assigned');
    p.delete('issued');
  }
  u.hash = p.toString();
  return u.href;
}
export function upcomingCare(r) {
  return careSchedule
    .filter((s) => {
      const w = careWindow(s, r.start);
      return w.end === null || w.end >= r.start + r.elapsed;
    })
    .slice(0, 2);
}
export function suggestedGuides(week, language, selected = []) {
  const pool = handouts.filter(
    (h) => language !== 'es' || h.language === 'Español',
  );
  const terms =
    week < 14
      ? /genetic|nausea|nutrition|nutric|embarazo/i
      : week < 28
        ? /anatomy|diabetes|glucose|gestacional/i
        : /breast|labor|parto|lactancia/i;
  return [
    ...pool.filter((h) => selected.includes(h.id)),
    ...pool.filter((h) => terms.test(h.title + ' ' + h.description)),
    ...pool,
  ]
    .filter((h, i, a) => a.findIndex((x) => x.id === h.id) === i)
    .slice(0, 2);
}
export function appointmentKey(due) {
  return 'bloom-appointment:' + due;
}
export function validAppointment(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value).getTime()) &&
    new Date(value).getFullYear() === Number(value.slice(0, 4)) &&
    new Date(value).getMonth() + 1 === Number(value.slice(5, 7)) &&
    new Date(value).getDate() === Number(value.slice(8, 10))
  );
}
export const spanishCare = [
  [
    'Su primera consulta prenatal',
    [
      'Confirmar el embarazo y la fecha probable de parto.',
      'Análisis iniciales y asesoramiento genético.',
    ],
  ],
  [
    'Opciones de pruebas prenatales',
    [
      'Pruebas del primer trimestre y ecografía de translucencia nucal, si las elige.',
      'Prueba prenatal no invasiva (NIPT), si lo desea. Su equipo coordinará las pruebas apropiadas.',
    ],
  ],
  [
    'Revisión y próximos pasos',
    [
      'Prueba cuádruple, si forma parte de su plan de pruebas.',
      'Escuchar el latido y conversar sobre la ecografía anatómica.',
    ],
  ],
  [
    'Una mirada más detallada',
    ['Ecografía anatómica: evaluación detallada del bebé.'],
  ],
  [
    'Prueba de diabetes gestacional',
    [
      'Prueba de glucosa de una hora.',
      'Planificar la vacuna Tdap entre las semanas 27 y 36.',
    ],
  ],
  [
    'Consultas cada dos semanas',
    [
      'Consultas cada dos semanas hasta la semana 36.',
      'RhoGAM alrededor de la semana 28 si es Rh negativa y está indicado.',
    ],
  ],
  [
    'Consultas semanales y preparación',
    [
      'Consultas semanales hasta la fecha probable de parto.',
      'Prueba de estreptococo del grupo B (GBS) y conversación sobre el plan de parto.',
    ],
  ],
  [
    'Seguimiento cercano',
    [
      'Consultas dos veces por semana y pruebas sin estrés (NST), según indique su equipo.',
      'Conversar sobre las opciones de inducción.',
    ],
  ],
];
export const spanishWarnings = [
  'Sangrado vaginal, aunque sea escaso.',
  'Dolor abdominal intenso o cólicos fuertes.',
  'Dolor de cabeza intenso, cambios en la visión o hinchazón de la cara o las manos: posibles signos de preeclampsia.',
  'Disminución de los movimientos del bebé después de las 28 semanas.',
  'Ruptura de la bolsa o salida repentina de líquido.',
  'Fiebre de 100.4 °F (38 °C) o más.',
  'Contracciones regulares antes de las 37 semanas.',
];
