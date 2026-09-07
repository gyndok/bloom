'use client';
import { useState } from 'react';
import { Flower2, Phone, Download, Printer, ArrowUp } from 'lucide-react';
type Section = {
  title: string;
  body?: string;
  items?: string[];
  subsections?: Section[];
  tone?: string;
};
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
  return (
    <div
      className={'mobile-guide ' + (large ? 'large-type' : '')}
      id="guide-top"
    >
      <header>
        <a className="brand" href="/">
          <Flower2 /> bloom<span>with Dr. Geffrey Klein</span>
        </a>
        <a href={pdf} target="_blank" rel="noreferrer">
          Original PDF ↗
        </a>
      </header>
      <main className="guide-main">
        <a className="guide-back" href="/#patient-education">
          ← Patient guide library
        </a>
        <div className="eyebrow">
          FROM DR. KLEIN’S LIBRARY · {guide.language}
        </div>
        <h1>{guide.title}</h1>
        <p className="guide-subtitle">{guide.subtitle}</p>
        <div className="guide-tools">
          <button aria-pressed={large} onClick={() => setLarge((v) => !v)}>
            Aa · {large ? 'Standard text' : 'Larger text'}
          </button>
          <button onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <a href={pdf} download>
            <Download size={16} /> Save PDF
          </a>
        </div>
        <p className="guide-source-note">
          Reformatted from the practice’s original pamphlet.{' '}
          {guide.reviewDate
            ? `Source review date: ${guide.reviewDate}.`
            : 'The source does not list a clinical review date.'}{' '}
          Mobile formatting: September 7, 2026; this is not a new clinical
          review.
        </p>
        {guide.clinicalUpdates && <p className="guide-source-note">{guide.clinicalUpdates}</p>}
      <nav className="guide-contents" aria-label="On this page">
          <h2>On this page</h2>
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
            View the original pamphlet ↗
          </a>
        </aside>
        <a className="guide-top" href="#guide-top">
          <ArrowUp size={16} /> Back to top
        </a>
      </main>
    </div>
  );
}
