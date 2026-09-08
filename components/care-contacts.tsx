import { Phone, MapPin, Hospital, ChevronDown } from 'lucide-react';

const pediatricians = [
  {
    name: 'Pearland Pediatrics',
    address: '2017 Broadway St, Pearland, TX 77581',
    phone: '281-485-9990',
    note: 'Drs. Onhaizer, Palacios, Hummel, Massanelli, Decker, Huynh, Gray & Stroope',
  },
  {
    name: 'Dr. Michael P. Binder',
    address: '1715 South Friendswood Drive, 4th Floor, Friendswood, TX 77546',
    phone: '281-482-5695',
  },
  {
    name: 'Dr. Rami Sunallah',
    address: '3831 E League City Pkwy, Unit A, League City, TX 77573',
    phone: '281-957-9812',
  },
  {
    name: 'Dr. Roberta Lee',
    address: '16 Professional Park Dr, Webster, TX 77598',
    phone: '281-332-3503',
  },
];
const specialists = [
  {
    name: 'Dr. Nima Goharkhay',
    note: 'Pregnancy Specialty Center of Texas',
    address: '1411 Atlantis Dr, Suite A, Webster, TX 77598',
    phone: '281-707-0939',
  },
  {
    name: 'Dr. Martina T. Ayad',
    note: 'Texas Maternal Fetal Medicine',
    address: '1408 W NASA Parkway, Suite A, Webster, TX 77598',
    phone: '281-672-1505',
  },
  {
    name: 'Dr. Thomas F. Rowe',
    note: 'Maternal Fetal Medicine Associates of South Texas',
    address: '830 Gemini St, Suite B, Houston, TX 77058',
    phone: '346-636-7693',
  },
];
const hospitalAddress = '500 Medical Center Blvd, Webster, TX 77598';
const hospitalUrl =
  'https://www.hcahoustonhealthcare.com/locations/clear-lake/specialties/womens-care/labor-and-delivery';
function Call({ phone, label }: { phone: string; label?: string }) {
  return (
    <a href={`tel:+1${phone.replace(/\D/g, '')}`}>
      <Phone size={17} aria-hidden="true" />
      {label ? `${label} · ${phone}` : phone}
    </a>
  );
}
function Directions({ address, es }: { address: string; es: boolean }) {
  return (
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MapPin size={17} aria-hidden="true" />
      {es ? 'Cómo llegar' : 'Directions'}
    </a>
  );
}
export default function CareContacts({
  spanish = false,
}: {
  spanish?: boolean;
}) {
  const es = spanish;
  const t = (en: string, sp: string) => (es ? sp : en);
  const directory = (people: typeof pediatricians) => (
    <div className="contacts-grid">
      {people.map((person) => (
        <article className="contact-person" key={person.name}>
          <h4>{person.name}</h4>
          {person.note && <p>{person.note}</p>}
          <p>{person.address}</p>
          <div className="contact-actions">
            <Call phone={person.phone} />
            <Directions address={person.address} es={es} />
          </div>
        </article>
      ))}
    </div>
  );
  return (
    <section
      id="care-contacts"
      className="care-contacts"
      aria-labelledby="care-contacts-title"
    >
      <p className="eyebrow">
        {t('YOUR LOCAL CARE TEAM', 'SU EQUIPO DE ATENCIÓN LOCAL')}
      </p>
      <h2 id="care-contacts-title">
        {t('Ready for the next step', 'Prepárese para el siguiente paso')}
      </h2>
      <p>
        {t(
          'Your hospital, helpful numbers, and the people who will care for you and your baby.',
          'Su hospital, teléfonos útiles y las personas que cuidarán de usted y de su bebé.',
        )}
      </p>
      <div className="contact-urgent">
        <div>
          <strong>
            {t(
              'In labor or an after-hours emergency?',
              '¿Está en trabajo de parto o tiene una emergencia fuera de horario?',
            )}
          </strong>
          <p>Women’s Specialists of Clear Lake</p>
        </div>
        <Call
          phone="281-557-0300"
          label={t('Call our office', 'Llame al consultorio')}
        />
      </div>
      <article className="contact-hospital">
        <Hospital size={28} aria-hidden="true" />
        <div>
          <h3>{t('Your delivery hospital', 'Su hospital para el parto')}</h3>
          <h4>HCA Houston Healthcare Clear Lake</h4>
          <p>{hospitalAddress}</p>
          <p className="triage-location">
            <strong>
              {t(
                'OB triage: 3rd floor of the Central Tower',
                'Triaje obstétrico: tercer piso de la Torre Central',
              )}
            </strong>
            <br />
            {t('Hospital open 24 hours', 'Hospital abierto las 24 horas')}
          </p>
          <div className="contact-actions">
            <Directions address={hospitalAddress} es={es} />
            <Call phone="281-332-2511" label={t('Hospital', 'Hospital')} />
            <a href={hospitalUrl} target="_blank" rel="noopener noreferrer">
              {t('Hospital information ↗', 'Información del hospital ↗')}
            </a>
          </div>
        </div>
      </article>
      <details className="contact-details">
        <summary>
          {t('Registration, tours & classes', 'Registro, visitas y clases')}
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <div className="contact-details-body">
          <p>
            {t(
              'Please pre-register before delivery. Call to arrange registration or ask the hospital about online and in-person options.',
              'Regístrese antes del parto. Llame para hacer el registro o pregunte al hospital sobre las opciones en línea y en persona.',
            )}
          </p>
          <div className="contact-service">
            <h4>{t('Pre-registration', 'Registro previo')}</h4>
            <Call phone="855-842-6014" />
          </div>
          <div className="contact-service">
            <h4>
              {t('Labor & Delivery tours', 'Visitas a la unidad de parto')}
            </h4>
            <Call phone="281-332-2229" />
            <p>{t('Ask for extension 3.', 'Pida la extensión 3.')}</p>
          </div>
          <div className="contact-service">
            <h4>
              {t(
                'Parenting & childbirth education',
                'Clases de crianza y preparación para el parto',
              )}
            </h4>
            <Call phone="281-338-3698" />
          </div>
        </div>
      </details>
      <details className="contact-details">
        <summary>
          {t(
            'Who will be there for your delivery?',
            '¿Quién le atenderá durante el parto?',
          )}
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <div className="contact-details-body">
          <p>
            {t(
              'Dr. Klein shares call with six other physicians. Because labor and urgent pregnancy needs can happen at any time, another physician in the call group may care for you or attend your delivery.',
              'El Dr. Klein comparte las guardias con otros seis médicos. Como el trabajo de parto y las urgencias del embarazo pueden ocurrir en cualquier momento, otro médico del grupo puede atenderle o asistir a su parto.',
            )}
          </p>
          <p>
            {t(
              'Dr. Klein may be able to attend when he is not on call, but cannot guarantee his personal availability 24 hours a day. The call group helps make sure a physician is available when you need care.',
              'El Dr. Klein puede estar disponible cuando no esté de guardia, pero no puede garantizar su disponibilidad personal las 24 horas. El grupo de guardia ayuda a que haya un médico disponible cuando necesite atención.',
            )}
          </p>
        </div>
      </details>
      <details className="contact-details">
        <summary>
          {t('Choose a pediatrician', 'Elija un pediatra')}
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <div className="contact-details-body">
          <p>
            {t(
              'Choose your baby’s pediatrician before delivery. These are practices our patients recommend. Call to confirm the location, insurance coverage, and availability for newborn care.',
              'Elija al pediatra de su bebé antes del parto. Nuestros pacientes recomiendan estos consultorios. Llame para confirmar la ubicación, cobertura de seguro y disponibilidad para atender a recién nacidos.',
            )}
          </p>
          {directory(pediatricians)}
        </div>
      </details>
      <details className="contact-details">
        <summary>
          {t(
            'Ultrasound & specialist referrals',
            'Referencias para ultrasonido y especialistas',
          )}
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <div className="contact-details-body">
          <p>
            {t(
              'Our office usually arranges the anatomy scan around 18 weeks, within the 18–22 week window in your timeline. Growth scans are arranged in the third trimester as directed by your care team. Contact the specialist named on your referral and confirm the location before your visit.',
              'Nuestro consultorio suele programar el ultrasonido anatómico alrededor de las 18 semanas, dentro del período de 18 a 22 semanas de su cronograma. Los ultrasonidos de crecimiento se programan en el tercer trimestre según las indicaciones de su equipo. Comuníquese con el especialista de su referencia y confirme la ubicación antes de la visita.',
            )}
          </p>
          {directory(specialists)}
        </div>
      </details>
      <details className="contact-details">
        <summary>
          {t('Optional resources', 'Recursos opcionales')}
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <div className="contact-details-body">
          <h4>
            {t('Cord blood banking', 'Banco de sangre del cordón umbilical')}
          </h4>
          <p>
            {t(
              'If you are interested, discuss your options with Dr. Klein before delivery.',
              'Si le interesa, hable con el Dr. Klein sobre sus opciones antes del parto.',
            )}
          </p>
          <a
            className="contact-resource"
            href="https://cord-blood.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Cord blood resource ↗', 'Recurso sobre sangre del cordón ↗')}
          </a>
          <h4>{t('Chiropractic referral', 'Referencia quiropráctica')}</h4>
          <p>
            {t(
              'If you would like chiropractic care during pregnancy, discuss it with your care team. The practice handout lists Dr. Cindy Bryant-Tovar.',
              'Si desea atención quiropráctica durante el embarazo, hable con su equipo de atención. El folleto del consultorio incluye a la Dra. Cindy Bryant-Tovar.',
            )}
          </p>
          <div className="contact-actions">
            <Call phone="281-480-7000" />
            <a
              href="https://tbodywork.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Practice website ↗', 'Sitio web del consultorio ↗')}
            </a>
          </div>
        </div>
      </details>
    </section>
  );
}
