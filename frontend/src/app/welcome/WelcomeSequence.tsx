'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Mic, Package, Check, ChevronRight, Plus, LoaderCircle } from 'lucide-react';
import { demoCustomers, demoEntry, stageSummary } from './content';

gsap.registerPlugin(ScrollTrigger);

type Props = { compact?: boolean };

export function WelcomeSequence({ compact = false }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const mic = useRef<HTMLButtonElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const waveform = useRef<HTMLDivElement>(null);
  const loader = useRef<SVGSVGElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const fuzzy = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4 || (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 2;
      const isTouch = matchMedia('(pointer: coarse)').matches;
      const setScale = () => {
        const scale = Math.min(1, (window.innerHeight * 0.88) / 800, (window.innerWidth < 900 ? window.innerWidth - 32 : 390) / 390);
        root.current?.style.setProperty('--phone-scale', String(Math.max(0.68, scale)));
      };
      setScale();
      const resize = gsap.delayedCall(0.2, () => { setScale(); ScrollTrigger.refresh(); }).pause();
      const onResize = () => resize.restart(true);
      window.addEventListener('resize', onResize);
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      let lenis: Lenis | undefined;
      if (!isTouch && !reduced) {
        lenis = new Lenis({ autoRaf: false, syncTouch: false });
        gsap.ticker.add((time) => lenis?.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      const setText = (target: HTMLElement | null, value: string) => { if (target && target.textContent !== value) target.textContent = value; };
      const money = new Intl.NumberFormat('en-IN');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: reduced || lowPower ? undefined : { trigger: section.current, pin: true, scrub: 1, start: 'top top', end: '+=1000%', anticipatePin: 1, invalidateOnRefresh: true },
      });

      gsap.set([bubble.current, drawer.current, fuzzy.current, stamp.current, caption.current], { autoAlpha: 0 });
      gsap.set(drawer.current, { yPercent: 100 });
      gsap.set(fuzzy.current, { y: 24 });
      gsap.set(stamp.current, { scale: 1.3, rotation: -8 });
      gsap.set(caption.current, { y: 12 });
      gsap.set(tokenRefs.current, { y: 0 });
      gsap.set(chipRefs.current, { y: 24, autoAlpha: 0 });
      gsap.set(rows.current, { y: 0 });
      gsap.set(loader.current, { strokeDashoffset: 1 });

      if (lowPower && !reduced) {
        tl.to(frame.current, { autoAlpha: 1, duration: 0.2 }).to(bubble.current, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.2).to(drawer.current, { autoAlpha: 1, yPercent: 0, duration: 0.2 }, 0.45).to(caption.current, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.75);
      } else {
        tl.from(frame.current, { y: 20, autoAlpha: 0, duration: 8 })
          .to(mic.current, { scale: 1.04, duration: 8 }, 0)
          .to(bubble.current, { autoAlpha: 1, y: -4, duration: 2 }, 8)
          .to(bubble.current?.querySelectorAll('.word') ?? [], { clipPath: 'inset(0 0% 0 0%)', duration: 1.25, stagger: 1.2 }, 9)
          .to(glow.current, { autoAlpha: 0.75, scale: 1.18, duration: 3 }, 20)
          .to(mic.current, { backgroundColor: 'var(--debt-red)', color: 'var(--surface)', duration: 2 }, 20)
          .to(waveform.current?.querySelectorAll('.wave-bar') ?? [], { scaleY: 1, duration: 9, stagger: { each: 0.12, from: 'center' }, onUpdate: function () { const p = this.progress(); waveform.current?.querySelectorAll<HTMLElement>('.wave-bar').forEach((bar, i) => { bar.style.transform = `scaleY(${Math.abs(Math.sin(i * 0.7 + p * 18)) * Math.max(0, Math.sin(p * Math.PI))})`; }); } }, 20)
          .to(loader.current, { strokeDashoffset: 0, rotation: 360, duration: 8 }, 30)
          .to(waveform.current?.querySelectorAll('.wave-bar') ?? [], { scaleY: 0.12, duration: 8 }, 30)
          .to(tokenRefs.current, { y: -18, duration: 5, stagger: 1 }, 38)
          .to(chipRefs.current, { autoAlpha: 1, y: 0, duration: 5, stagger: 1 }, 43)
          .to(drawer.current, { autoAlpha: 1, yPercent: 0, duration: 8, ease: 'power2.out' }, 50)
          .to(fuzzy.current, { autoAlpha: 1, y: 0, duration: 4, ease: 'power2.out' }, 60)
          .to(mic.current, { scale: 0.95, duration: 2 }, 70)
          .to(stamp.current, { autoAlpha: 1, scale: 1, rotation: -3, duration: 4, ease: 'power3.in' }, 72)
          .to(drawer.current, { yPercent: 100, autoAlpha: 0, duration: 6 }, 76)
          .to(rows.current?.[0], { y: -96, duration: 6 }, 78)
          .to(rows.current?.[1], { y: 0, duration: 6 }, 78)
          .to(caption.current, { autoAlpha: 1, y: 0, duration: 4, ease: 'power2.out' }, 96)
          .to({}, { duration: 0 }, 100);
      }
      if (reduced) tl.progress(1).kill();

      return () => { window.removeEventListener('resize', onResize); resize.kill(); lenis?.destroy(); };
    }, root);
    return () => ctx.revert();
  }, { scope: root });

  return (
    <div ref={root} className="welcome-root" data-compact={compact}>
      <section ref={section} className="welcome-section" aria-labelledby="welcome-title">
        <a className="skip-link" href="#welcome-end">Skip animation</a>
        <div className="welcome-layout">
          <div className="stage-column">
            <div ref={frame} className="phone-frame" role="img" aria-label={stageSummary}>
              <p className="sr-only">{stageSummary}</p>
              <header className="phone-header"><div><span className="brand-hi" lang="hi">खाता</span><span className="micro-label">Hisabb ledger</span></div><div className="phone-actions"><span className="stock-badge"><Package size={17} /> स्टॉक <strong>2</strong></span><span className="week-tab">हफ्ता</span></div></header>
              <div className="phone-body">
                <div className="ledger-title"><div><span lang="hi">किससे लेना है?</span><span className="micro-label">Customers with credit</span></div><Plus size={22} /></div>
                <ul className="customer-list">{demoCustomers.map((customer, index) => <li ref={(el) => { rows.current[index] = el; }} className={`customer-row ${customer.fresh ? 'fresh-row' : ''}`} key={customer.name}><span className="avatar">{customer.name.slice(0, 1)}</span><span className="customer-copy"><strong lang="hi">{customer.name}</strong><small>{customer.detail}</small></span><b className="debt-amount" aria-hidden="true">₹{customer.balance.toLocaleString('en-IN')}</b><ChevronRight size={18} /></li>)}</ul>
                <div ref={bubble} className="speech-bubble"><span className="bubble-label">You said</span><p lang="hi">{demoEntry.words.map((word, index) => <span ref={(el) => { tokenRefs.current[index] = el; }} className="word" key={`${word}-${index}`}>{word}{index < demoEntry.words.length - 1 ? ' ' : ''}</span>)}</p></div>
                <div className="waveform" ref={waveform} aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i className="wave-bar" key={i} style={{ transform: `scaleY(${0.12 + (i % 4) * 0.08})` }} />)}</div>
                <div className="mic-zone"><div ref={glow} className="mic-glow" /><button ref={mic} className="hero-mic" aria-label="Voice entry demonstration"><Mic size={42} strokeWidth={2.2} /><span>बोलें</span></button><div className="mic-status"><span lang="hi">सुनिए, बोलिए</span><small>Voice makes bookkeeping human</small></div></div>
              </div>
              <div ref={drawer} className="confirm-drawer"><div className="drawer-handle" /><div className="drawer-heading"><div><span lang="hi">जाँच लें</span><small>Confirm entry</small></div><LoaderCircle ref={loader} size={22} className="drawer-loader" /></div><div className="token-row">{[demoEntry.customer, demoEntry.type, demoEntry.item, demoEntry.quantity, `₹${demoEntry.amount}`].map((token, index) => <span ref={(el) => { chipRefs.current[index] = el; }} className="token-chip" key={token}>{token}</span>)}</div><div className="entry-fields"><div><small>किससे</small><strong lang="hi">शर्मा जी</strong></div><div><small>क्या</small><strong lang="hi">5 किलो चावल</strong></div><div><small>रकम</small><strong>₹700</strong></div></div><div ref={fuzzy} className="fuzzy-match"><span lang="hi">क्या आपका मतलब शर्मा जी है?</span><button><Check size={17} /> हाँ</button></div><button className="save-button"><span lang="hi">खाते में जोड़ें</span><small>Save to ledger</small></button><div ref={stamp} className="debt-stamp" aria-hidden="true">उधार</div></div>
              <div className="phone-footer"><span className="footer-dot active" /><span className="footer-dot" /><span className="footer-dot" /></div>
            </div>
          </div>
          <div className="welcome-copy"><p className="eyebrow">VOICE-LEDGER / 001</p><h1 id="welcome-title"><span lang="hi">बोलो.</span> हिसाब हो गया.</h1><p className="lead">The fastest way to remember every rupee your shop is owed.</p><p className="copy-hindi" lang="hi">आप बोलिए, Hisabb लिखता जाएगा — बिना रुकावट, बिना कागज़ के ढेर.</p><div className="copy-rule" /><p className="copy-note">A tiny voice note becomes a clear customer ledger. Built for the counter, made for real life.</p><div id="welcome-end" className="welcome-end"><span>Scroll to replay</span><span className="end-line" /></div></div>
        </div>
        <div ref={caption} className="sequence-caption"><span lang="hi">बोलो. हो गया.</span><small>Speak it. It&apos;s done.</small></div>
      </section>
    </div>
  );
}
