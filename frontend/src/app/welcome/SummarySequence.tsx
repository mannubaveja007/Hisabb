'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowLeft, Check, ChevronRight, Edit3, MessageCircle, Send, Sparkles } from 'lucide-react';
import { summaryCaption, summaryDescription, weeklyDebtors, weeklySummary } from './content';

export function SummarySequence() {
  const root = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const summaryScreen = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  const sentBubble = useRef<HTMLDivElement>(null);
  const paymentRow = useRef<HTMLDivElement>(null);
  const bannerTotal = useRef<HTMLSpanElement>(null);
  const debtorCount = useRef<HTMLSpanElement>(null);
  const message = useRef<HTMLParagraphElement>(null);
  const reminderButton = useRef<HTMLButtonElement>(null);
  const reminderPreview = useRef<HTMLDivElement>(null);
  const balanceOld = useRef<HTMLSpanElement>(null);
  const balanceNew = useRef<HTMLSpanElement>(null);
  const balanceValue = useRef<HTMLSpanElement>(null);
  const debtorCards = useRef<(HTMLLIElement | null)[]>([]);
  const rules = useRef<(HTMLDivElement | null)[]>([]);
  const caption = useRef<HTMLDivElement>(null);
  const ripple = useRef<HTMLSpanElement>(null);
  const paymentStamp = useRef<HTMLSpanElement>(null);
  const ticks = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    const totalCounter = { value: 0 };
    const balanceCounter = { value: 700 };
    const timeline = gsap.timeline({
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

    gsap.set(summaryScreen.current, { autoAlpha: 1, x: 0 });
    gsap.set(composer.current, { autoAlpha: 0, xPercent: 100 });
    gsap.set(sentBubble.current, { autoAlpha: 0, y: 24 });
    gsap.set(paymentRow.current, { autoAlpha: 0, x: -22 });
    gsap.set(debtorCards.current, { autoAlpha: 0, y: 18 });
    gsap.set(rules.current, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(message.current, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(reminderButton.current, { scale: 1 });
    gsap.set(ripple.current, { autoAlpha: 0, scale: 0.6 });
    gsap.set(paymentStamp.current, { autoAlpha: 0, scale: 1.35, rotation: -8 });
    gsap.set([balanceOld.current, balanceNew.current], { autoAlpha: 0 });
    gsap.set(balanceOld.current, { autoAlpha: 1 });
    gsap.set(caption.current, { autoAlpha: 0, y: 14 });

    const countTotal = () => { if (bannerTotal.current) bannerTotal.current.textContent = `₹${Math.round(totalCounter.value).toLocaleString('en-IN')}`; };
    const countBalance = () => { if (balanceValue.current) balanceValue.current.textContent = String(Math.round(balanceCounter.value)); };
    const drawTicks = () => { if (ticks.current) ticks.current.style.strokeDashoffset = '0'; };

    if (reduced || lowPower) {
      timeline.to(totalCounter, { value: 2450, duration: 1, onUpdate: countTotal })
        .to(debtorCount.current, { textContent: '4', duration: 0.2 }, 0)
        .to(debtorCards.current, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, 0.2)
        .to(rules.current, { scaleX: 1, duration: 0.2, stagger: 0.05 }, 0.2)
        .to(message.current, { clipPath: 'inset(0 0% 0 0%)', duration: 0.3 }, 0.5)
        .to(composer.current, { autoAlpha: 1, xPercent: 0, duration: 0.3 }, 0.7)
        .to(caption.current, { autoAlpha: 1, y: 0, duration: 0.2 }, 1);
    } else {
      timeline.to(totalCounter, { value: 2450, duration: 10, onUpdate: countTotal })
        .to(debtorCount.current, { textContent: '4', duration: 4 }, 6)
        .to(debtorCards.current, { autoAlpha: 1, y: 0, duration: 6, stagger: 2 }, 10)
        .to(rules.current, { scaleX: 1, duration: 4, stagger: 1 }, 10)
        .to(debtorCards.current[0], { y: -8, duration: 4 }, 22)
        .to(message.current, { clipPath: 'inset(0 0% 0 0%)', duration: 8 }, 26)
        .to(reminderButton.current, { scale: 0.97, duration: 2, yoyo: true, repeat: 1 }, 34)
        .to(ripple.current, { autoAlpha: 0.28, scale: 1.9, duration: 4 }, 34)
        .to(ripple.current, { autoAlpha: 0, duration: 4 }, 38)
        .to(summaryScreen.current, { xPercent: -100, duration: 8 }, 44)
        .to(composer.current, { autoAlpha: 1, xPercent: 0, duration: 8 }, 44)
        .to(sentBubble.current, { autoAlpha: 1, y: 0, duration: 6 }, 56)
        .to(ticks.current, { strokeDashoffset: 0, duration: 4 }, 60)
        .to(composer.current, { xPercent: 100, autoAlpha: 0, duration: 5 }, 64)
        .to(summaryScreen.current, { xPercent: 0, duration: 5 }, 64)
        .to(paymentRow.current, { autoAlpha: 1, x: 0, duration: 5 }, 64)
        .to(paymentStamp.current, { autoAlpha: 1, scale: 1, rotation: -3, duration: 4 }, 68)
        .to(balanceOld.current, { autoAlpha: 0, duration: 4 }, 74)
        .to(balanceNew.current, { autoAlpha: 1, duration: 4 }, 74)
        .to(balanceCounter, { value: 400, duration: 8, onUpdate: countBalance }, 74)
        .to(debtorCards.current[0], { y: 92, autoAlpha: 0.55, duration: 6 }, 84)
        .to(debtorCards.current.slice(1), { y: -12, duration: 6, stagger: 1 }, 84)
        .to(totalCounter, { value: 2150, duration: 8, onUpdate: countTotal }, 86)
        .to(caption.current, { autoAlpha: 1, y: 0, duration: 6, ease: 'power2.out' }, 94)
        .to({}, { duration: 0 }, 100);
    }

    timeline.eventCallback('onUpdate', () => {
      const progress = timeline.progress();
      if (progress >= 0.1 && bannerTotal.current) bannerTotal.current.textContent = '₹2,450';
      if (progress >= 0.34 && message.current) message.current.style.clipPath = 'inset(0 0% 0 0%)';
      if (progress >= 0.56) {
        if (sentBubble.current) { sentBubble.current.style.opacity = '1'; sentBubble.current.style.transform = 'translateY(0px)'; }
        drawTicks();
      }
      if (progress >= 0.64) {
        gsap.set(composer.current, { xPercent: 100, autoAlpha: 0 });
        gsap.set(summaryScreen.current, { xPercent: 0, autoAlpha: 1 });
        gsap.set(reminderPreview.current, { autoAlpha: 0 });
        if (paymentRow.current) { paymentRow.current.style.opacity = '1'; paymentRow.current.style.transform = 'translateX(0px)'; }
      }
      if (progress >= 0.68 && paymentStamp.current) { paymentStamp.current.style.opacity = '1'; paymentStamp.current.style.transform = 'rotate(-3deg) scale(1)'; }
      if (progress >= 0.74) {
        if (balanceOld.current) balanceOld.current.style.opacity = '0';
        if (balanceNew.current) balanceNew.current.style.opacity = '1';
        if (balanceValue.current) balanceValue.current.textContent = '400';
      }
      if (progress >= 0.84) {
        debtorCards.current[0]?.style.setProperty('transform', 'translateY(92px)');
        debtorCards.current[0]?.style.setProperty('opacity', '0.55');
        debtorCards.current.slice(1).forEach((card) => card?.style.setProperty('transform', 'translateY(-12px)'));
        if (bannerTotal.current) bannerTotal.current.textContent = '₹2,150';
      }
      if (progress >= 0.96 && caption.current) caption.current.style.opacity = '1';
    });
    if (reduced) timeline.progress(1).kill();
    return () => timeline.kill();
  }, { scope: root });

  return (
    <div ref={root} className="welcome-root summary-root">
      <section ref={section} className="summary-section" aria-labelledby="summary-title">
        <a className="skip-link" href="#summary-end">Skip summary animation</a>
        <div className="summary-heading"><p className="eyebrow">SEQUENCE / 003</p><h2 id="summary-title">हफ्ता. एक नज़र में.</h2><p>बकाया देखिए, तगादा भेजिए, भुगतान लिखिए.</p></div>
        <div className="summary-stage" aria-label={summaryDescription} role="img">
          <div className="summary-phone">
            <div className="summary-screen" ref={summaryScreen}>
              <header className="summary-phone-header"><button aria-label="Go back"><ArrowLeft size={17} /></button><div><strong>हफ्ता</strong><small>इस हफ्ते का हिसाब</small></div><span className="summary-week">W / 42</span></header>
              <div className="summary-body">
                <div className="summary-banner"><div><small>कुल बाकी</small><strong ref={bannerTotal}>₹0</strong></div><div><small>ग्राहक</small><strong ref={debtorCount}>0</strong></div><Sparkles size={20} /></div>
                <div className="sorted-label"><span>सबसे ज्यादा बाकी</span><ChevronRight size={14} /></div>
                <ul className="debtor-stack">{weeklyDebtors.map((debtor, index) => <li ref={(el) => { debtorCards.current[index] = el; }} className="debtor-card" key={debtor.name}><div className="debtor-avatar">{debtor.name.slice(0, 1)}</div><div className="debtor-copy"><strong>{debtor.name}</strong><small>{debtor.detail}</small></div><b>₹{debtor.balance}</b><Check size={14} /></li>)}</ul>
                {weeklyDebtors.slice(0, -1).map((_, index) => <div ref={(el) => { rules.current[index] = el; }} className="stack-rule" key={index} />)}
                <div ref={reminderPreview} className="reminder-preview"><span className="preview-label">तगादा का मसौदा</span><p ref={message}>{weeklySummary.reminder}</p><button ref={reminderButton}><MessageCircle size={17} /><span>व्हाट्सएप पर तगादा भेजें</span><span ref={ripple} className="button-ripple" /></button></div>
                <div ref={paymentRow} className="payment-row"><span className="payment-dot" /><div><strong>जमा ₹{weeklySummary.payment}</strong><small>शर्मा जी · अभी</small></div><span ref={paymentStamp} className="payment-stamp">दर्ज</span></div>
                <div className="balance-row"><span>शर्मा जी · बाकी</span><strong>₹<span ref={balanceValue}>700</span></strong><span ref={balanceOld} className="balance-layer old">₹700</span><span ref={balanceNew} className="balance-layer new">₹400</span></div>
              </div>
              <footer className="summary-phone-footer"><span className="footer-dot active" /><span className="footer-dot" /><span className="footer-dot" /></footer>
            </div>
            <div ref={composer} className="chat-composer"><header><span><ArrowLeft size={16} /></span><div><strong>शर्मा जी</strong><small>नया संदेश</small></div><MessageCircle size={17} /></header><div className="chat-paper"><div className="chat-bubble draft"><Edit3 size={14} /><p>{weeklySummary.reminder}</p></div><div ref={sentBubble} className="chat-bubble sent"><p>{weeklySummary.reminder}</p><small>अभी <svg ref={ticks} viewBox="0 0 30 16" aria-hidden="true"><path d="M1 8l4 4L13 3M12 8l4 4L29 2" /></svg></small></div></div><div className="composer-bar"><span>संदेश लिखें...</span><button aria-label="Send message"><Send size={17} /></button></div></div>
          </div>
        </div>
        <div id="summary-end" ref={caption} className="sequence-caption"><span lang="hi">{summaryCaption}</span><small>Respectful reminders, clear records.</small></div>
      </section>
    </div>
  );
}
