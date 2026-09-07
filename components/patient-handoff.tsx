'use client';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { handoffLink } from '@/lib/patient-experience.mjs';
import { iso, today } from '@/lib/pregnancy.mjs';
export default function PatientHandoff({
  link,
  visit,
}: {
  link: string;
  visit: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    [language, setLanguage] = useState('en'),
    [assigned, setAssigned] = useState(visit),
    [qr, setQr] = useState(''),
    [notice, setNotice] = useState('');
  const url = link ? handoffLink(link, language, assigned, iso(today())) : '';
  useEffect(() => {
    let active = true;
    setQr('');
    if (url)
      QRCode.toDataURL(url, {
        width: 720,
        margin: 4,
        errorCorrectionLevel: 'M',
      })
        .then((v) => {
          if (active) setQr(v);
        })
        .catch(() => {
          if (active) setNotice('QR unavailable. Use the link below.');
        });
    return () => {
      active = false;
    };
  }, [url]);
  const message =
    language === 'es'
      ? `Su calendario de embarazo del Dr. Geffrey Klein. Guarde este enlace. Si cambia la fecha de parto, use el enlace nuevo.\n\n${url}`
      : `Your pregnancy timeline from Dr. Geffrey Klein. Save this link. If your due date changes, replace your old link with the new one.\n\n${url}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Link copied.');
    } catch {
      setNotice('Select and copy the link below.');
    }
  }
  return (
    <>
      <button
        className="primary"
        disabled={!url}
        onClick={() => dialog.current?.showModal()}
      >
        Send to patient →
      </button>
      <dialog
        ref={dialog}
        className="handoff-sheet"
        aria-labelledby="handoff-title"
      >
        <button
          className="sheet-close"
          onClick={() => dialog.current?.close()}
          aria-label="Close sharing"
        >
          ×
        </button>
        <h2 id="handoff-title">A little care to take home.</h2>
        <p>Scan with the patient’s camera, or open a message draft.</p>
        <label htmlFor="handoff-language">Patient language</label>
        <select
          id="handoff-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
        <label className="assigned-check">
          <input
            type="checkbox"
            checked={assigned}
            onChange={(e) => setAssigned(e.target.checked)}
          />{' '}
          This is the due date assigned by Dr. Klein
        </label>
        {qr && (
          <img
            className="patient-qr"
            src={qr}
            alt="Scan to open this patient’s pregnancy timeline"
            width="360"
            height="360"
          />
        )}
        <div className="phone-actions">
          <a href={'sms:?body=' + encodeURIComponent(message)}>Text</a>
          <a
            href={
              'mailto:?subject=' +
              encodeURIComponent(
                language === 'es'
                  ? 'Su calendario de embarazo'
                  : 'Your pregnancy timeline',
              ) +
              '&body=' +
              encodeURIComponent(message)
            }
          >
            Email
          </a>
          <button onClick={copy}>Copy link</button>
        </div>
        <a href={url} target="_blank" rel="noreferrer">
          Preview patient view ↗
        </a>
        <input
          aria-label="Patient link"
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
        />
        <p role="status">{notice}</p>
        <p className="helper">
          Messages open as drafts for you to address and send. Anyone with the
          link can view its dates and selected topics. The assigned-date label
          is informational, not a verified signature.
        </p>
        <details>
          <summary>Updating an assigned due date</summary>
          <p>
            Close this sheet, change “Due date to share,” and send the new link.
            Ask the patient to replace her old bookmark or Home Screen shortcut.
            Old links cannot update automatically.
          </p>
        </details>
      </dialog>
    </>
  );
}
