'use client';

import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, getDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { joinWaitlistAction } from '@/app/actions/waitlist';
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Zap,
  Sun,
  Sparkles,
  ShieldCheck,
  Pencil,
} from 'lucide-react';

// ─── Floating UI Card Components (Sahara Theme) ────────────────────

function SprintProgressCard() {
  return (
    <div className="col-span-2 md:col-span-1 bg-white p-8 rounded-[2rem] shadow-[0_2px_16px_rgba(58,48,42,0.04)] border border-[#d8d0c8]/30 flex flex-col gap-6 animate-float-card-1">
      <div className="flex justify-between items-center">
        <h3 className="font-body font-bold text-[#3a302a] uppercase tracking-widest text-xs">Sprint Progress</h3>
        <TrendingUp className="h-5 w-5 text-[#c2652a]" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-5xl font-headline text-[#3a302a]">84%</span>
        <span className="text-sm font-body text-[#c2652a] mb-2">+12% this week</span>
      </div>
      <div className="w-full h-2 bg-[#eae2da] rounded-full overflow-hidden">
        <div className="bg-[#c2652a] h-full rounded-full animate-shimmer-bar" style={{ width: '84%' }} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-[#f6f0e8] rounded-xl">
          <p className="text-[10px] font-body text-[#605850] uppercase">Tasks</p>
          <p className="text-lg font-headline text-[#3a302a]">42 / 50</p>
        </div>
        <div className="p-3 bg-[#f6f0e8] rounded-xl">
          <p className="text-[10px] font-body text-[#605850] uppercase">Time Left</p>
          <p className="text-lg font-headline text-[#3a302a]">3 Days</p>
        </div>
      </div>
    </div>
  );
}

function TeamVelocityCard() {
  return (
    <div className="col-span-2 md:col-span-1 bg-[#ece6dc] p-8 rounded-[2rem] shadow-[0_2px_16px_rgba(58,48,42,0.04)] border border-[#d8d0c8]/30 flex flex-col justify-between animate-float-card-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-body font-bold text-[#3a302a] uppercase tracking-widest text-xs mb-1">Team Velocity</h3>
          <p className="text-[#605850] text-xs font-body">Consistent performance</p>
        </div>
        <Zap className="h-5 w-5 text-[#8c3c3c]" />
      </div>
      <div className="flex items-baseline gap-1 mt-8">
        <div className="w-full flex items-end justify-between h-24 gap-1">
          {[40, 60, 55, 85, 70, 95].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-t-full transition-all duration-500"
              style={{
                height: `${h}%`,
                backgroundColor: `rgba(194, 101, 42, ${0.2 + i * 0.16})`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-[#d8d0c8]/60 flex justify-between items-center">
        <span className="text-sm font-body font-bold text-[#3a302a]">Avg. Score</span>
        <span className="text-lg font-headline text-[#8c3c3c]">9.2</span>
      </div>
    </div>
  );
}

function ActivityFeedCard() {
  return (
    <div className="col-span-2 bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-[#d8d0c8]/20 shadow-sm animate-float-card-3">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#fbe8d8] flex items-center justify-center shrink-0">
          <Pencil className="h-4 w-4 text-[#8a4518]" />
        </div>
        <div className="flex-grow">
          <p className="text-sm font-body font-medium text-[#3a302a]">
            <span className="font-bold">Alex Chen</span> updated the{' '}
            <span className="text-[#c2652a] italic">AgileSuit Brand System</span>
          </p>
          <p className="text-[11px] font-body text-[#605850] uppercase tracking-wide">2 minutes ago</p>
        </div>
        <div className="w-6 h-6 rounded-full border border-white bg-[#8c3c3c]/10 flex items-center justify-center text-[10px] text-[#8c3c3c] font-bold">
          +3
        </div>
      </div>
    </div>
  );
}

// ─── Constants ─────────────────────────────────────────────────────
const TOTAL_SPOTS = 100;

// ─── Dynamic Counter ───────────────────────────────────────────────
function SpotsCounter({ firestore }: { firestore: ReturnType<typeof useFirestore> }) {
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    // Listen for real-time updates to the actual waitlist_emails collection
    const unsubscribe = onSnapshot(
      collection(firestore, 'waitlist_emails'),
      (snapshot) => {
        const signupCount = snapshot.size;
        setSpotsLeft(Math.max(0, TOTAL_SPOTS - signupCount));
      },
      (err) => {
        console.warn('SpotsCounter: could not read collection, using fallback', err);
        setSpotsLeft(TOTAL_SPOTS); // fallback
      }
    );
    return () => unsubscribe();
  }, [firestore]);

  if (spotsLeft === null) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#fce0e0] text-[#6e3030] rounded-lg text-xs font-bold uppercase tracking-wider">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>checking spots…</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#fce0e0] text-[#6e3030] rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c2652a] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c2652a]" />
      </span>
      <span>Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left in this batch</span>
    </span>
  );
}

// ─── Main Coming Soon Component ────────────────────────────────────
export function ComingSoonPage() {
  const firestore = useFirestore();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [error, setError] = useState('');
  const [honey, setHoney] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Staggered reveal
  const [show, setShow] = useState({ label: false, headline: false, sub: false, cta: false, cards: false, philosophy: false });

  useEffect(() => {
    // Inject Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    const timers = [
      setTimeout(() => setShow(s => ({ ...s, label: true })), 200),
      setTimeout(() => setShow(s => ({ ...s, headline: true })), 500),
      setTimeout(() => setShow(s => ({ ...s, sub: true })), 900),
      setTimeout(() => setShow(s => ({ ...s, cta: true })), 1300),
      setTimeout(() => setShow(s => ({ ...s, cards: true })), 600),
      setTimeout(() => setShow(s => ({ ...s, philosophy: true })), 1800),
    ];
    return () => {
      timers.forEach(clearTimeout);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honey) return; // Honeypot trap
    setError('');
    setIsSubmitted(false);
    setIsAlreadySubscribed(false);
    if (!email.trim()) { setError('Please enter your email address.'); inputRef.current?.focus(); return; }
    if (!validateEmail(email)) { setError('Please enter a valid email address.'); inputRef.current?.focus(); return; }

    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    // Rate Limiting (Cooldown)
    const lastSubmit = localStorage.getItem('last_waitlist_submit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      setError('Please wait a minute before trying again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Strict Email Validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }

      // 2. Rate Limiting (Cooldown)
      const lastSubmit = localStorage.getItem('last_waitlist_submit');
      if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
        setError('Please wait a minute before trying again.');
        setIsSubmitting(false);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const history = JSON.parse(localStorage.getItem('waitlist_history') || '[]');
      if (history.includes(normalizedEmail)) {
        setIsAlreadySubscribed(true);
        setIsSubmitting(false);
        return;
      }

      console.log('ComingSoon: Initiating joinWaitlistAction for', normalizedEmail);
      const result = await joinWaitlistAction({
        email: normalizedEmail,
        source: 'coming_soon_page',
        turnstileToken,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      });
      console.log('ComingSoon: Waitlist action result:', result);

      if (result.success) {
        history.push(normalizedEmail);
        localStorage.setItem('waitlist_history', JSON.stringify(history));
        localStorage.setItem('last_waitlist_submit', Date.now().toString());

        setIsSubmitted(true);
        setEmail('');
        setTurnstileToken(null); // Reset after success
      } else {
        setError(result.error || 'Failed to join waitlist. Please try again.');
      }
    } catch (err: any) {
      console.error('ComingSoon: Failed to join waitlist:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Turnstile Callback
  useEffect(() => {
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ backgroundColor: '#faf5ee', fontFamily: "'Manrope', sans-serif" }}>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Manrope:wght@200..800&display=swap" rel="stylesheet" />

      {/* Warm Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#fbe8d8] opacity-20 blur-[100px] rounded-full pointer-events-none animate-blob-1" />
      <div className="absolute top-1/3 -left-40 w-60 h-60 bg-[#fce0e0] opacity-20 blur-[80px] rounded-full pointer-events-none animate-blob-2" />
      <div className="absolute -bottom-20 right-1/3 w-60 h-60 bg-[#fbe8d8] opacity-15 blur-[80px] rounded-full pointer-events-none animate-blob-3" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 pt-24 pb-32">
        <section className="max-w-7xl mx-auto px-8 lg:flex items-center gap-16">

          {/* Left: Hero Content */}
          <div className="lg:w-1/2 flex flex-col items-start gap-8">

            {/* Badge */}
            <div className={`transition-all duration-700 ease-out ${show.label ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center px-4 py-1.5 bg-[#fbe8d8] text-[#8a4518] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase font-body">
                <span className="mr-2">Coming Soon</span>
                <Sparkles className="h-3.5 w-3.5" />
                <div className="ml-4 pl-4 border-l border-[#8a4518]/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c2652a] animate-pulse" />
                  <span>Limited Availability</span>
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1
              className={`text-6xl md:text-8xl leading-[0.9] tracking-tight transition-all duration-1000 ease-out ${show.headline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ fontFamily: "'EB Garamond', serif", color: '#3a302a' }}
            >
              Elevate Your <br />
              <span className="italic" style={{ color: '#c2652a' }}>Workflow</span>
            </h1>

            {/* Subtext */}
            <p
              className={`text-xl md:text-2xl max-w-lg leading-relaxed transition-all duration-1000 delay-100 ease-out ${show.sub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ color: '#605850', fontFamily: "'Manrope', sans-serif" }}
            >
              Experience lightning-fast project management designed for modern teams who value sun-baked simplicity and focused execution.
            </p>

            {/* CTA */}
            <div className={`w-full max-w-md space-y-3 transition-all duration-1000 delay-300 ease-out ${show.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

              {isAlreadySubscribed && (
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-[#fbe8d8] border-2 border-[#c2652a]/30 shadow-lg">
                  <div className="h-12 w-12 rounded-2xl bg-[#c2652a]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[#c2652a]" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold" style={{ color: '#3a302a', fontFamily: "'Manrope', sans-serif" }}>You&apos;re already on the list!</p>
                    <p className="text-sm mt-1 font-medium" style={{ color: '#8a4518' }}>Keep an eye on your inbox for updates.</p>
                    <button onClick={() => { setIsAlreadySubscribed(false); setEmail(''); if ((window as any).turnstile) (window as any).turnstile.reset(); }} className="mt-3 text-xs font-bold underline transition-colors" style={{ color: '#c2652a' }}>Enter a different email</button>
                  </div>
                </div>
              )}
              
              {isSubmitted && (
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 shadow-lg">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-emerald-800" style={{ fontFamily: "'Manrope', sans-serif" }}>You&apos;re on the list! 🎉</p>
                    <p className="text-sm text-emerald-600 mt-1 font-medium">We&apos;ll send you an invite when early access opens.</p>
                    <button onClick={() => { setIsSubmitted(false); setEmail(''); if ((window as any).turnstile) (window as any).turnstile.reset(); }} className="mt-3 text-xs font-bold text-emerald-600 underline hover:text-emerald-800 transition-colors">Enter a different email</button>
                  </div>
                </div>
              )}

              <div style={{ display: (isAlreadySubscribed || isSubmitted) ? 'none' : 'block' }}>
                <SpotsCounter firestore={firestore} />

                {/* Honeypot field for bot protection */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="full_name_verification"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honey}
                    onChange={(e) => setHoney(e.target.value)}
                  />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-2">
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your work email"
                    className="flex-grow h-14 px-6 rounded-xl border border-[#d8d0c8] bg-white focus:ring-2 focus:ring-[#c2652a] focus:border-transparent outline-none transition-all text-[#3a302a] placeholder-[#9a9088]"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-8 rounded-xl font-bold text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:shadow-lg active:scale-[0.98] inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    style={{
                      backgroundColor: '#c2652a',
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Join the Waitlist
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Turnstile Widget */}
                <div
                  className="cf-turnstile mt-4 flex justify-center sm:justify-start"
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  data-callback="onTurnstileSuccess"
                  data-theme="light"
                ></div>

                {error && (
                  <p className="text-xs text-red-500 font-semibold pl-1">{error}</p>
                )}

                <div className="flex items-center gap-2 px-1 mt-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#9a9088]" />
                  <p className="text-[11px] uppercase tracking-wider" style={{ color: '#605850', fontFamily: "'Manrope', sans-serif" }}>
                    Privacy Guaranteed · Secure Onboarding
                  </p>
                </div>
              </div>
            </div>
          </div>

            {/* Right: UI Cards Visualization */}
            <div className={`lg:w-1/2 mt-20 lg:mt-0 relative transition-all duration-1000 delay-200 ease-out ${show.cards ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
              {/* Decorative blobs behind cards */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#fbe8d8] opacity-20 blur-[100px] rounded-full -z-10" />
              <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-[#fce0e0] opacity-20 blur-[80px] rounded-full -z-10" />

              <div className="grid grid-cols-2 gap-6 relative z-10">
                <SprintProgressCard />
                <TeamVelocityCard />
                <ActivityFeedCard />
              </div>
            </div>
        </section>

        {/* ─── Product Philosophy Section ─── */}
        <section className={`max-w-7xl mx-auto px-8 mt-48 transition-all duration-1000 ease-out ${show.philosophy ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{ fontFamily: "'EB Garamond', serif", color: '#3a302a' }}
            >
              Designed for Focus
            </h2>
            <p
              className="leading-relaxed text-lg italic"
              style={{ color: '#605850', fontFamily: "'Manrope', sans-serif" }}
            >
              &ldquo;Complexity is the enemy of execution. AgileSuit strips away the noise, leaving only what moves you forward.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <Sun className="h-10 w-10 text-[#c2652a] mx-auto md:mx-0" />
              <h4
                className="text-xl font-bold"
                style={{ fontFamily: "'EB Garamond', serif", color: '#3a302a' }}
              >
                Linen Workspace
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#605850' }}>
                A warm, calm environment that reduces eye strain and helps you maintain deep focus for longer periods.
              </p>
            </div>
            <div className="space-y-4">
              <Zap className="h-10 w-10 text-[#c2652a] mx-auto md:mx-0" />
              <h4
                className="text-xl font-bold"
                style={{ fontFamily: "'EB Garamond', serif", color: '#3a302a' }}
              >
                Sub-100ms Feel
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#605850' }}>
                Optimized interactions and instant updates so the software never gets in the way of your thinking speed.
              </p>
            </div>
            <div className="space-y-4">
              <Sparkles className="h-10 w-10 text-[#c2652a] mx-auto md:mx-0" />
              <h4
                className="text-xl font-bold"
                style={{ fontFamily: "'EB Garamond', serif", color: '#3a302a' }}
              >
                Smart Prioritization
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: '#605850' }}>
                Let AgileSuit&apos;s intuitive engine surface what matters most, so you don&apos;t waste time sorting lists.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
