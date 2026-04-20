'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  CalendarDays,
  TrendingUp,
  Star,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Rocket,
  Mail,
} from 'lucide-react';

// ─── Floating UI Card Components ────────────────────────────────────

function SprintCard() {
  return (
    <div className="absolute top-4 right-0 w-72 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] p-6 rotate-3 animate-float-card-1 border border-indigo-100/60">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <CalendarDays className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900">Sprint 24</p>
          <p className="text-[11px] text-slate-400 font-medium">2 weeks · 8 members</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">Velocity</span>
          <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> 42 pts
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full animate-shimmer-bar" />
        </div>
        <div className="flex gap-2 mt-4">
          {[
            { label: 'To Do', count: '4', color: 'bg-slate-50 text-slate-500 border-slate-200' },
            { label: 'In Progress', count: '6', color: 'bg-amber-50 text-amber-600 border-amber-200' },
            { label: 'Done', count: '12', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`flex-1 py-2 rounded-xl text-center text-[10px] font-bold border ${color}`}>
              <span className="block text-lg font-black leading-none mb-0.5">{count}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard() {
  return (
    <div className="absolute top-56 right-20 w-64 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(139,92,246,0.15)] p-6 -rotate-2 animate-float-card-2 border border-violet-100/60 z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-extrabold text-slate-900">AI Insights</p>
        </div>
        <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-20 px-1">
        {[35, 55, 40, 75, 50, 85, 65, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-lg bg-gradient-to-t from-indigo-500 to-violet-400 transition-all duration-500"
            style={{
              height: `${h}%`,
              opacity: 0.7 + (i * 0.04),
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[11px] text-slate-500 font-semibold">Throughput +23% this quarter</p>
      </div>
    </div>
  );
}

function TeamCard() {
  return (
    <div className="absolute bottom-8 right-8 w-64 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(236,72,153,0.12)] p-6 rotate-1 animate-float-card-3 border border-pink-100/60">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <Users className="h-4 w-4 text-white" />
        </div>
        <p className="text-sm font-extrabold text-slate-900">Team Capacity</p>
      </div>
      <div className="flex -space-x-2.5 mb-4">
        {[
          'from-rose-400 to-orange-400',
          'from-indigo-400 to-purple-400',
          'from-emerald-400 to-teal-400',
          'from-amber-400 to-yellow-400',
          'from-pink-400 to-fuchsia-400',
        ].map((gradient, i) => (
          <div key={i} className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md`}>
            {['PS', 'AK', 'RJ', 'MK', 'DV'][i]}
          </div>
        ))}
        <div className="h-9 w-9 rounded-full bg-slate-100 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-md">
          +3
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wide">Excellent</span>
      </div>
    </div>
  );
}

// ─── Animated Counter ──────────────────────────────────────────────
function SpotsCounter() {
  const [count, setCount] = useState(100);

  useEffect(() => {
    // Simulate spots being taken
    const interval = setInterval(() => {
      setCount(prev => {
        const next = prev - 1;
        if (next <= 73) { clearInterval(interval); return 73; }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
      <span className="text-[11px] font-extrabold tabular-nums">{count}</span>
      <span className="text-[11px] font-bold">spots left</span>
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Staggered reveal
  const [show, setShow] = useState({ label: false, headline: false, sub: false, cta: false, cards: false });

  useEffect(() => {
    const timers = [
      setTimeout(() => setShow(s => ({ ...s, label: true })), 200),
      setTimeout(() => setShow(s => ({ ...s, headline: true })), 500),
      setTimeout(() => setShow(s => ({ ...s, sub: true })), 900),
      setTimeout(() => setShow(s => ({ ...s, cta: true })), 1300),
      setTimeout(() => setShow(s => ({ ...s, cards: true })), 600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitted(false);
    setIsAlreadySubscribed(false);
    if (!email.trim()) { setError('Please enter your email address.'); inputRef.current?.focus(); return; }
    if (!validateEmail(email)) { setError('Please enter a valid email address.'); inputRef.current?.focus(); return; }
    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const history = JSON.parse(localStorage.getItem('waitlist_history') || '[]');
      if (history.includes(normalizedEmail)) {
        setIsAlreadySubscribed(true);
        setIsSubmitting(false);
        return;
      }

      await setDoc(doc(firestore, 'waitlist_emails', normalizedEmail), {
        email: normalizedEmail,
        updated_at: serverTimestamp(),
        source: 'coming_soon_page',
      }, { merge: true });
      
      history.push(normalizedEmail);
      localStorage.setItem('waitlist_history', JSON.stringify(history));
      
      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Failed to save email:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fafbff] overflow-hidden flex flex-col">

      {/* Animated Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-200/80 via-violet-200/60 to-purple-200/40 blur-[100px] pointer-events-none animate-blob-1" />
      <div className="absolute top-1/3 -left-60 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-100/60 via-orange-100/40 to-rose-100/30 blur-[80px] pointer-events-none animate-blob-2" />
      <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-100/40 via-sky-100/30 to-indigo-100/20 blur-[80px] pointer-events-none animate-blob-3" />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 dotted-bg opacity-30 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center min-h-[85vh]">

            {/* Left: Text Content */}
            <div className="flex flex-col justify-center max-w-lg">

              {/* Badge */}
              <div className={`transition-all duration-700 ease-out ${show.label ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                  <Rocket className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">Coming Soon</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className={`text-[3.5rem] sm:text-6xl lg:text-[4.25rem] font-black leading-[1.08] tracking-[-0.03em] transition-all duration-1000 ease-out ${show.headline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <span className="text-slate-900">Get Notified</span>
                <br />
                <span className="text-slate-900">When we </span>
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 bg-clip-text text-transparent">Launch</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C40 2 70 2 100 6C130 10 170 4 198 8" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round" className="animate-draw-line" />
                    <defs>
                      <linearGradient id="underline-grad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366f1" />
                        <stop offset="0.5" stopColor="#8b5cf6" />
                        <stop offset="1" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              {/* Subtext */}
              <p className={`mt-7 text-[17px] text-slate-500 leading-relaxed font-medium transition-all duration-1000 delay-100 ease-out ${show.sub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                Project management shouldn&apos;t feel like a second job.
                We&apos;re building something{' '}
                <span className="text-slate-800 font-bold">lightning-fast</span>,{' '}
                <span className="text-slate-800 font-bold">zero-bloat</span>, and powered by{' '}
                <span className="text-slate-800 font-bold">AI</span>
                &nbsp;&mdash; for teams that actually ship.
              </p>

              {/* CTA */}
              <div className={`mt-10 transition-all duration-1000 delay-300 ease-out ${show.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {isAlreadySubscribed ? (
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-200 shadow-lg shadow-indigo-100/50">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-indigo-800">You're already on the list!</p>
                      <p className="text-sm text-indigo-600 mt-1 font-medium">Keep an eye on your inbox for updates.</p>
                      <button onClick={() => { setIsAlreadySubscribed(false); setEmail(''); }} className="mt-3 text-xs font-bold text-indigo-600 underline hover:text-indigo-800 transition-colors">Enter a different email</button>
                    </div>
                  </div>
                ) : isSubmitted ? (
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 shadow-lg shadow-emerald-100/50">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-emerald-800">You're on the list! 🎉</p>
                      <p className="text-sm text-emerald-600 mt-1 font-medium">We'll send you an invite when early access opens.</p>
                      <button onClick={() => { setIsSubmitted(false); setEmail(''); }} className="mt-3 text-xs font-bold text-emerald-600 underline hover:text-emerald-800 transition-colors">Enter a different email</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <form onSubmit={handleSubmit}>
                      <div className="relative group">
                        {/* Animated gradient border */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />

                        <div className="relative flex items-center gap-0 p-2 rounded-full border-2 border-slate-200 bg-white shadow-xl shadow-slate-200/40 group-focus-within:border-transparent group-focus-within:shadow-indigo-200/30 transition-all duration-300">
                          <Mail className="h-5 w-5 text-slate-300 ml-4 shrink-0" />
                          <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            placeholder="Enter your email address"
                            className="flex-1 bg-transparent border-0 outline-none px-4 py-3 text-slate-900 placeholder-slate-400 text-[15px] font-medium"
                            disabled={isSubmitting}
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="shrink-0 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.97]"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Notify Me
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {error && (
                        <p className="mt-2 text-xs text-red-500 font-semibold pl-6">{error}</p>
                      )}
                    </form>

                    {/* Trust indicators */}
                    <div className="flex items-center gap-4 pl-1">
                      <SpotsCounter />
                      <span className="text-[11px] text-slate-400 font-medium">No spam, ever. Unsubscribe anytime.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Floating UI Cards */}
            <div className={`relative hidden lg:block h-[580px] transition-all duration-1200 delay-200 ease-out ${show.cards ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
              <SprintCard />
              <AnalyticsCard />
              <TeamCard />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {[
              { icon: Github, href: '#' },
              { icon: Twitter, href: '#' },
              { icon: Linkedin, href: '#' },
              { icon: Instagram, href: '#' },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 transform hover:scale-110"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors duration-200">FAQ</a>
            <a href="#" className="hover:text-indigo-600 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors duration-200">Email Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
