'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Mic, Package, Check, ChevronRight, Plus, LoaderCircle } from 'lucide-react';
import { demoCustomers, demoEntry, stageSummary } from './content';

gsap.registerPlugin(ScrollTrigger);

type Props = { compact?: boolean };
type LangMode = 'bilingual' | 'en' | 'hi';

export function WelcomeSequence({ compact = false }: Props) {
  const [lang, setLang] = useState<LangMode>('bilingual');
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
            {/* Language Switcher */}
            <div className="flex items-center justify-center gap-1.5 p-1 bg-stone-100/95 backdrop-blur-md rounded-full w-fit mx-auto mb-3 border border-stone-200 shadow-xs z-10 relative">
              <button
                type="button"
                onClick={() => setLang('bilingual')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === 'bilingual' ? 'bg-[#1C1917] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🌐 English + हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-[#1C1917] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === 'hi' ? 'bg-[#1C1917] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                हिंदी
              </button>
            </div>

            <div ref={frame} className="phone-frame" role="img" aria-label={stageSummary}>
              <p className="sr-only">{stageSummary}</p>
              <header className="phone-header">
                <div>
                  <span className="brand-hi">
                    {lang === 'en' ? 'Khata' : lang === 'hi' ? 'खाता' : <>Khata <span className="text-stone-400 text-sm font-normal">/ खाता</span></>}
                  </span>
                  <span className="micro-label">
                    {lang === 'en' ? 'Hisabb Digital Ledger' : lang === 'hi' ? 'डिजिटल उधार बही' : 'Hisabb Ledger · डिजिटल बही'}
                  </span>
                </div>
                <div className="phone-actions">
                  <span className="stock-badge">
                    <Package size={17} /> {lang === 'en' ? 'Stock' : lang === 'hi' ? 'स्टॉक' : 'Stock'} <strong>2</strong>
                  </span>
                  <span className="week-tab">
                    {lang === 'en' ? 'Weekly' : lang === 'hi' ? 'हफ्ता' : 'Weekly (हफ्ता)'}
                  </span>
                </div>
              </header>

              <div className="phone-body">
                <div className="ledger-title">
                  <div>
                    <span>
                      {lang === 'en' ? 'Who Owes?' : lang === 'hi' ? 'किससे लेना है?' : <>Kisse Lena Hai? <span className="text-xs font-normal text-stone-500">(किससे लेना है?)</span></>}
                    </span>
                    <span className="micro-label">
                      {lang === 'en' ? 'Customers with pending credit' : lang === 'hi' ? 'उधार बाकी वाले ग्राहक' : 'Customers with credit · उधार बाकी'}
                    </span>
                  </div>
                  <Plus size={22} />
                </div>

                <ul className="customer-list">
                  {demoCustomers.map((customer, index) => {
                    const displayName = lang === 'en' ? customer.name : lang === 'hi' ? customer.name_hi : customer.name;
                    const displaySub = lang === 'en' ? customer.detail : lang === 'hi' ? customer.detail_hi : customer.detail;
                    const initial = customer.avatar || customer.name.slice(0, 1);

                    return (
                      <li
                        ref={(el) => { rows.current[index] = el; }}
                        className={`customer-row ${customer.fresh ? 'fresh-row' : ''}`}
                        key={customer.name}
                      >
                        <span className={`avatar ${customer.avatar_bg || 'bg-stone-100'} ${customer.avatar_text || 'text-stone-700'}`}>
                          {initial}
                        </span>
                        <span className="customer-copy">
                          <strong>
                            {displayName}
                            {lang === 'bilingual' && (
                              <span className="text-xs font-normal text-stone-400 ml-1.5">
                                ({customer.name_hi})
                              </span>
                            )}
                          </strong>
                          <small>{displaySub}</small>
                        </span>
                        <b className="debt-amount" aria-hidden="true">
                          ₹{customer.balance.toLocaleString('en-IN')}
                        </b>
                        <ChevronRight size={18} />
                      </li>
                    );
                  })}
                </ul>

                <div ref={bubble} className="speech-bubble">
                  <div className="flex items-center justify-between mb-1">
                    <span className="bubble-label">
                      {lang === 'en' ? 'You said' : lang === 'hi' ? 'आपने कहा' : 'You said · आपने कहा'}
                    </span>
                  </div>
                  <p lang="hi">
                    {demoEntry.words.map((word, index) => (
                      <span
                        ref={(el) => { tokenRefs.current[index] = el; }}
                        className="word"
                        key={`${word}-${index}`}
                      >
                        {word}{index < demoEntry.words.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </p>
                  {lang !== 'hi' && (
                    <div className="text-xs text-stone-600 font-semibold mt-1.5 pt-1.5 border-t border-stone-200/80 flex items-center gap-1.5">
                      <span className="text-stone-400 font-mono text-[10px] uppercase">EN</span>
                      <span>&ldquo;{demoEntry.sentence_en}&rdquo;</span>
                    </div>
                  )}
                </div>

                <div className="waveform" ref={waveform} aria-hidden="true">
                  {Array.from({ length: 24 }, (_, i) => (
                    <i className="wave-bar" key={i} style={{ transform: `scaleY(${0.12 + (i % 4) * 0.08})` }} />
                  ))}
                </div>

                <div className="mic-zone">
                  <div ref={glow} className="mic-glow" />
                  <button ref={mic} className="hero-mic" aria-label="Voice entry demonstration">
                    <Mic size={42} strokeWidth={2.2} />
                    <span>{lang === 'en' ? 'SPEAK' : lang === 'hi' ? 'बोलें' : 'SPEAK / बोलें'}</span>
                  </button>
                  <div className="mic-status">
                    <span>
                      {lang === 'en' ? 'Speak Naturally' : lang === 'hi' ? 'सुनिए, बोलिए' : 'सुनिए, बोलिए · Speak Naturally'}
                    </span>
                    <small>Voice makes bookkeeping human</small>
                  </div>
                </div>
              </div>

              <div ref={drawer} className="confirm-drawer">
                <div className="drawer-handle" />
                <div className="drawer-heading">
                  <div>
                    <span>
                      {lang === 'en' ? 'Review & Confirm' : lang === 'hi' ? 'जाँच लें' : <>Review & Confirm <small className="inline ml-1 font-normal">(जाँच लें)</small></>}
                    </span>
                    <small>
                      {lang === 'en' ? 'Confirm voice entry' : lang === 'hi' ? 'विवरण की पुष्टि करें' : 'Verify entry details · पुष्टि करें'}
                    </small>
                  </div>
                  <LoaderCircle ref={loader} size={22} className="drawer-loader" />
                </div>
                <div className="token-row">
                  {[
                    lang === 'hi' ? demoEntry.customer_hi : demoEntry.customer,
                    lang === 'en' ? demoEntry.type : lang === 'hi' ? demoEntry.type_hi : `${demoEntry.type} · ${demoEntry.type_hi}`,
                    lang === 'hi' ? demoEntry.item_hi : demoEntry.item,
                    lang === 'hi' ? demoEntry.quantity_hi : demoEntry.quantity,
                    `₹${demoEntry.amount}`,
                  ].map((token, index) => (
                    <span ref={(el) => { chipRefs.current[index] = el; }} className="token-chip" key={token}>
                      {token}
                    </span>
                  ))}
                </div>
                <div className="entry-fields">
                  <div>
                    <small>{lang === 'en' ? 'Customer' : lang === 'hi' ? 'किससे' : 'Customer · किससे'}</small>
                    <strong>{lang === 'hi' ? 'शर्मा जी' : 'Sharma Ji'}</strong>
                  </div>
                  <div>
                    <small>{lang === 'en' ? 'Item' : lang === 'hi' ? 'क्या' : 'Item · सामान'}</small>
                    <strong>{lang === 'hi' ? '5 किलो चावल' : '5 kg Rice (चावल)'}</strong>
                  </div>
                  <div>
                    <small>{lang === 'en' ? 'Amount' : lang === 'hi' ? 'रकम' : 'Amount · रकम'}</small>
                    <strong>₹700</strong>
                  </div>
                </div>
                <div ref={fuzzy} className="fuzzy-match">
                  <span>
                    {lang === 'en' ? 'Did you mean Sharma Ji?' : lang === 'hi' ? 'क्या आपका मतलब शर्मा जी है?' : 'Did you mean Sharma Ji? (क्या आपका मतलब शर्मा जी है?)'}
                  </span>
                  <button>
                    <Check size={17} /> {lang === 'en' ? 'Yes' : lang === 'hi' ? 'हाँ' : 'Yes · हाँ'}
                  </button>
                </div>
                <button className="save-button">
                  <span>
                    {lang === 'en' ? 'Save to Ledger' : lang === 'hi' ? 'खाते में जोड़ें' : 'Save to Ledger · खाते में जोड़ें'}
                  </span>
                  <small>{lang === 'en' ? 'Tap to save' : lang === 'hi' ? 'दर्ज करें' : 'Instant offline-first sync'}</small>
                </button>
                <div ref={stamp} className="debt-stamp" aria-hidden="true">
                  {lang === 'en' ? 'CREDIT' : lang === 'hi' ? 'उधार' : 'UDHAAR'}
                </div>
              </div>

              <div className="phone-footer">
                <span className="footer-dot active" />
                <span className="footer-dot" />
                <span className="footer-dot" />
              </div>
            </div>
          </div>

          <div className="welcome-copy">
            <p className="eyebrow">VOICE-LEDGER / 001</p>
            <h1 id="welcome-title">
              <span>Speak.</span> It&apos;s Recorded.
              <span className="text-xl text-stone-400 font-normal block mt-1">बोलो. हिसाब हो गया.</span>
            </h1>
            <p className="lead">The fastest way to remember every rupee your shop is owed.</p>
            <p className="copy-hindi">You speak naturally, Hisabb writes it down — zero paperwork, zero friction.</p>
            <p className="text-sm text-stone-400 mt-1 font-serif">आप बोलिए, Hisabb लिखता जाएगा — बिना रुकावट, बिना कागज़ के ढेर.</p>
            <div className="copy-rule" />
            <p className="copy-note">A tiny voice note becomes a clear customer ledger. Built for the counter, made for real life.</p>
            <div id="welcome-end" className="welcome-end">
              <span>Scroll to explore comparison & weekly digest</span>
              <span className="end-line" />
            </div>
          </div>
        </div>

        <div ref={caption} className="sequence-caption">
          <span>Speak it. It&apos;s done.</span>
          <small>बोलो. हो गया. · Voice to ledger in under 1 second.</small>
        </div>
      </section>
    </div>
  );
}
