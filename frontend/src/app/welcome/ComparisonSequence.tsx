'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Check, Pencil, Sparkles } from 'lucide-react';
import { comparisonCaption, comparisonEntries, comparisonSummary } from './content';

type Props = { compact?: boolean };

export function ComparisonSequence({ compact = false }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const notebook = useRef<HTMLDivElement>(null);
  const hisabb = useRef<HTMLDivElement>(null);
  const notebookLines = useRef<(HTMLLIElement | null)[]>([]);
  const hisabbRows = useRef<(HTMLLIElement | null)[]>([]);
  const brackets = useRef<(HTMLDivElement | null)[]>([]);
  const fuzzy = useRef<HTMLDivElement>(null);
  const blot = useRef<HTMLDivElement>(null);
  const strike = useRef<HTMLDivElement>(null);
  const notebookTotal = useRef<HTMLDivElement>(null);
  const redCircle = useRef<SVGSVGElement>(null);
  const editedAmount = useRef<HTMLSpanElement>(null);
  const hisabbTotal = useRef<HTMLSpanElement>(null);
  const tear = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: reduced || lowPower ? undefined : {
        trigger: section.current,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: '+=1000%',
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap.set([notebook.current, hisabb.current], { autoAlpha: 0, y: 18 });
    gsap.set(notebookLines.current, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(hisabbRows.current, { autoAlpha: 0, x: 18 });
    gsap.set(brackets.current, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(fuzzy.current, { autoAlpha: 0, y: 16 });
    gsap.set([blot.current, strike.current], { autoAlpha: 0 });
    const circle = redCircle.current?.querySelector('ellipse');
    if (!circle) return;
    const totalCounter = { value: 0 };
    gsap.set(circle, { strokeDasharray: 1000, strokeDashoffset: 1000 });
    gsap.set(tear.current, { y: 0, rotation: 0 });
    gsap.set(stamp.current, { autoAlpha: 0, scale: 1.35, rotation: -8 });
    gsap.set(caption.current, { autoAlpha: 0, y: 12 });

    if (reduced || lowPower) {
      tl.to([notebook.current, hisabb.current], { autoAlpha: 1, y: 0, duration: 0.2 })
        .to(notebookLines.current, { clipPath: 'inset(0 0% 0 0%)', duration: 0.2 }, 0)
        .to(hisabbRows.current, { autoAlpha: 1, x: 0, duration: 0.2 }, 0)
        .to(fuzzy.current, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.2)
        .to(stamp.current, { autoAlpha: 1, scale: 1, rotation: -3, duration: 0.2 }, 0.5)
        .to(caption.current, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.8);
    } else {
      tl.to([notebook.current, hisabb.current], { autoAlpha: 1, y: 0, duration: 8 })
        .to(notebookLines.current, { clipPath: 'inset(0 0% 0 0%)', duration: 12, stagger: 2 }, 8)
        .to(hisabbRows.current, { autoAlpha: 1, x: 0, duration: 8, stagger: 2 }, 8)
        .to(brackets.current, { scaleX: 1, duration: 5, stagger: 1 }, 22)
        .to(fuzzy.current, { autoAlpha: 1, y: 0, duration: 5 }, 30)
        .to(hisabbRows.current, { x: -8, duration: 3, stagger: 0.2 }, 35)
        .to(hisabbRows.current, { x: 0, duration: 3, stagger: 0.2 }, 38)
        .to(blot.current, { autoAlpha: 0.92, duration: 3 }, 42)
        .to(strike.current, { autoAlpha: 1, scaleX: 1, duration: 4 }, 44)
        .to(editedAmount.current, { color: 'var(--payment-green)', duration: 3 }, 44)
        .to(notebookTotal.current, { color: 'var(--debt-red)', duration: 3 }, 48)
        .to(circle, { strokeDashoffset: 0, duration: 5 }, 50)
        .to(totalCounter, { value: 700, duration: 8, ease: 'power1.out', onUpdate: () => { if (hisabbTotal.current) hisabbTotal.current.textContent = String(Math.round(totalCounter.value)); } }, 50)
        .set(hisabbTotal.current, { textContent: '700' }, 58)
        .set(circle, { strokeDashoffset: 0 }, 58)
        .to(tear.current, { y: 110, rotation: 8, duration: 5, ease: 'power2.in' }, 64)
        .to(notebook.current, { autoAlpha: 0.45, rotation: 1.5, duration: 8 }, 76)
        .to(hisabbTotal.current, { color: 'var(--debt-red)', duration: 5 }, 80)
        .to(stamp.current, { autoAlpha: 1, scale: 1, rotation: -3, duration: 5, ease: 'power3.in' }, 88)
        .to(caption.current, { autoAlpha: 1, y: 0, duration: 4, ease: 'power2.out' }, 96)
        .to({}, { duration: 0 }, 100);
    }
    tl.eventCallback('onUpdate', () => {
      const progress = tl.progress();
      if (hisabbTotal.current) hisabbTotal.current.textContent = progress >= 0.58 ? '700' : String(Math.round(totalCounter.value));
      if (circle && progress >= 0.58) circle.style.strokeDashoffset = '0';
    });
    if (reduced) tl.progress(1).kill();
    return () => tl.kill();
  }, { scope: root });

  return (
    <div ref={root} className="welcome-root comparison-root" data-compact={compact}>
      <section ref={section} className="comparison-section" aria-labelledby="comparison-title">
        <a className="skip-link" href="#comparison-end">Skip comparison animation</a>
        <div className="comparison-heading"><p className="eyebrow">SEQUENCE / 002</p><h2 id="comparison-title">One Story. Two Ways. <span className="text-xl font-normal text-stone-500">· एक ही बात. दो तरीके.</span></h2><p>Paper notebook vs. Hisabb digital ledger · कागज़ पर लिखा हिसाब और Hisabb में बचा हिसाब.</p></div>
        <div className="comparison-stage" aria-label={comparisonSummary} role="img">
          <div ref={notebook} className="ledger-panel notebook-panel">
            <div className="panel-title"><div><span>Paper Khata <small className="inline ml-1 font-normal">(पुरानी कॉपी)</small></span><small>traditional paper notebook</small></div><span className="page-number">Page 42 · पन्ना 42</span></div>
            <div className="ruled-page"><div className="red-margin" />
              <ul className="notebook-entries">{comparisonEntries.map((entry, index) => <li ref={(el) => { notebookLines.current[index] = el; }} key={entry.item}><span className="hand-name">{entry.notebook}</span><span> · {entry.item}</span><b>₹{entry.amount}</b></li>)}</ul>
              <div className="name-brackets">{comparisonEntries.map((entry, index) => <div ref={(el) => { brackets.current[index] = el; }} className="account-bracket" key={`${entry.notebook}-${index}`}><span>{entry.notebook}</span></div>)}</div>
              <div ref={blot} className="ink-blot" aria-hidden="true" /><div ref={strike} className="strike-stroke" aria-hidden="true" />
              <div ref={tear} className="torn-corner" aria-hidden="true" />
              <div ref={notebookTotal} className="notebook-total"><span>Total · जोड़</span><strong>₹650</strong><svg ref={redCircle} viewBox="0 0 170 65" aria-hidden="true"><ellipse cx="85" cy="32" rx="77" ry="24" /></svg><small>?</small></div>
            </div>
          </div>
          <div ref={hisabb} className="ledger-panel hisabb-panel">
            <div className="panel-title"><div><span>Hisabb Ledger <small className="inline ml-1 font-normal">(हिसाब)</small></span><small>clean digital record</small></div><span className="saved-label"><Check size={15} /> saved</span></div>
            <div className="clean-ledger"><div className="clean-ledger-head"><span>Customer · ग्राहक</span><span>Item · सामान</span><span>Balance · बाकी</span></div><ul>{comparisonEntries.map((entry, index) => <li ref={(el) => { hisabbRows.current[index] = el; }} key={entry.item}><span className="clean-customer">{entry.hisabb}<small lang="hi">शर्मा जी</small></span><span>{entry.item}</span><strong>₹{entry.amount}</strong><Check size={15} className="row-check" /></li>)}</ul><div ref={fuzzy} className="merge-banner"><Sparkles size={15} /><span>Three spellings, one customer · तीन नाम, एक ग्राहक</span><small>Fuzzy match: Sharma Ji</small></div><div className="clean-total"><span>Sharma Ji · Balance · कुल बाकी</span><strong>₹<span ref={hisabbTotal}>0</span></strong></div><div className="edit-note"><Pencil size={14} /><span>Quick edit</span><b ref={editedAmount}>₹350</b><small>saved</small></div></div>
            <div ref={stamp} className="final-stamp">SETTLED · हिसाब पक्का</div>
          </div>
        </div>
        <div id="comparison-end" ref={caption} className="sequence-caption"><span>From paper notebook to clear accounts</span><small>कॉपी से हिसाब तक · Zero manual recalculation</small></div>
      </section>
    </div>
  );
}
