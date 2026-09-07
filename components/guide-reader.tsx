'use client';
import GoogleReview from '@/components/google-review';
import { useState } from 'react';
import { Flower2, Phone, Download, Printer, ArrowUp } from 'lucide-react';
type Section = {
  title: string;
  blocks?: any[];
  sourceImage?: string;
  imageWidth?: number;
  imageHeight?: number;
  body?: string;
  items?: string[];
  subsections?: Section[];
  tone?: string;
};
function Reflow({ blocks }: { blocks: any[] }) {
  return (
    <div className="reflow-text">
      {blocks.map((b, i) =>
        b.type === 'table' ? (
          <div className="guide-table-cards" key={i}>
            {b.rows.slice(1).map((row: string[], j: number) => (
              <dl key={j}>
                {row.map((cell, k) => (
                  <div key={k}>
                    <dt>{b.rows[0][k] || 'Details'}</dt>
                    <dd>{cell || '—'}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        ) : b.type === 'heading' ? (
          <h3 key={i}>{b.text}</h3>
        ) : b.type === 'item' ? (
          <p className="reflow-item" key={i}>
            <span aria-hidden="true">•</span>
            <span>{b.text}</span>
          </p>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  );
}
function Content({
  section,
  sub = false,
}: {
  section: Section;
  sub?: boolean;
}) {
  const Heading = sub ? 'h3' : 'h2';
  return (
    <>
      <Heading>{section.title}</Heading>
      {section.blocks && <Reflow blocks={section.blocks} />}
      {section.body?.split('\n\n').map((p) => (
        <p key={p}>{p}</p>
      ))}
      {section.items && (
        <ul>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.subsections?.map((s) => (
        <div className="guide-subsection" key={s.title}>
          <Content section={s} sub />
        </div>
      ))}
    </>
  );
}
export default function GuideReader({
  guide,
  pdf,
}: {
  guide: any;
  pdf: string;
}) {
  const [large, setLarge] = useState(false);
  const es = guide.language === 'Español';
  const t = (en: string, spanish: string) => (es ? spanish : en);
  return (
    <div
      className={'mobile-guide ' + (large ? 'large-type' : '')}
      id="guide-top"
      lang={es ? 'es' : 'en'}
    >
      <header>
        <a className="brand" href="/">
          <Flower2 /> bloom<span>with Dr. Geffrey Klein</span>
        </a>
        <a href={pdf} target="_blank" rel="noreferrer">
          {t('Original PDF ↗', 'PDF original ↗')}
        </a>
      </header>
      <main className="guide-main">
        <a className="guide-back" href="/#patient-education">
          {t('← Patient guide library', '← Biblioteca de guías')}
        </a>
        <div className="eyebrow">
          {t('FROM DR. KLEIN’S LIBRARY', 'DE LA BIBLIOTECA DEL DR. KLEIN')} ·{' '}
          {guide.language}
        </div>
        <h1>{guide.title}</h1>
        <p className="guide-subtitle">{guide.subtitle}</p>
        <div className="guide-tools">
          <button aria-pressed={large} onClick={() => setLarge((v) => !v)}>
            Aa ·{' '}
            {large
              ? t('Standard text', 'Texto normal')
              : t('Larger text', 'Texto más grande')}
          </button>
          <button onClick={() => window.print()}>
            <Printer size={16} /> {t('Print', 'Imprimir')}
          </button>
          <a href={pdf} download>
            <Download size={16} /> {t('Save PDF', 'Guardar PDF')}
          </a>
        </div>
        <p className="guide-source-note">
          {t(
            'Reformatted from the practice’s original pamphlet.',
            'Adaptado del folleto original del consultorio.',
          )}{' '}
          {guide.reviewDate
            ? t(
                `Source review date: ${guide.reviewDate}.`,
                `Fecha de revisión de la fuente: ${guide.reviewDate}.`,
              )
            : t(
                'The source does not list a clinical review date.',
                'La fuente no indica una fecha de revisión clínica.',
              )}{' '}
          {t(
            'Mobile formatting: September 7, 2026; this is not a new clinical review.',
            'Formato móvil: 7 de septiembre de 2026; esto no constituye una nueva revisión clínica.',
          )}
        </p>
        {guide.clinicalUpdates && (
          <p className="guide-source-note">
            {guide.clinicalUpdates}
            {guide.guidanceUrl && (
              <>
                {' '}
                <a href={guide.guidanceUrl} target="_blank" rel="noreferrer">
                  CDC RSV guidance ↗
                </a>
              </>
            )}
          </p>
        )}
        <nav className="guide-contents" aria-label="On this page">
          <h2>{t('In this guide', 'En esta guía')}</h2>
          {guide.sections.map((s: Section, i: number) => (
            <a key={s.title} href={'#section-' + i}>
              {s.title}
              <span>↓</span>
            </a>
          ))}
        </nav>
        {guide.intro && <p className="guide-intro">{guide.intro}</p>}
        <article>
          {guide.sections.map((s: Section, i: number) => (
            <section
              id={'section-' + i}
              key={s.title}
              className={'guide-section ' + (s.tone || '')}
            >
              <Content section={s} />
              {s.sourceImage && (
                <details className="source-page">
                  <summary>
                    {t(
                      'View original page, tables & illustrations',
                      'Ver página original, tablas e ilustraciones',
                    )}
                  </summary>
                  <p>
                    {t(
                      'The original layout is preserved here. Use the PDF for printing or completing forms.',
                      'Aquí se conserva el diseño original. Use el PDF para imprimir o completar formularios.',
                    )}
                  </p>
                  <a href={s.sourceImage} target="_blank" rel="noreferrer">
                    <img
                      loading="lazy"
                      src={s.sourceImage}
                      width={s.imageWidth}
                      height={s.imageHeight}
                      alt={
                        t('Original source: ', 'Fuente original: ') +
                        guide.title +
                        ' — ' +
                        s.title
                      }
                    />
                  </a>
                </details>
              )}

              {s.tone === 'emergency' && (
                <a className="guide-call" href="tel:911">
                  Call 911
                </a>
              )}
              {s.tone === 'urgent' && (
                <a className="guide-call" href="tel:+12815570300">
                  <Phone size={18} /> Call (281) 557-0300
                </a>
              )}
            </section>
          ))}
        </article>
        <aside className="guide-office">
          <h2>{guide.practice}</h2>
          <p>{guide.author}</p>
          <p>{guide.address}</p>
          <a className="guide-call" href="tel:+12815570300">
            <Phone size={18} /> (281) 557-0300
          </a>
          <p>{guide.copyright}</p>
          <a href={pdf} target="_blank" rel="noreferrer">
            {t('View the original pamphlet ↗', 'Ver el folleto original ↗')}
          </a>
        </aside>
        <GoogleReview spanish={es}/><a className="guide-top" href="#guide-top">
          <ArrowUp size={16} /> {t('Back to top', 'Volver arriba')}
        </a>
      </main>
    </div>
  );
}
