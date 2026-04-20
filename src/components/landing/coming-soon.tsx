'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Loader2, ArrowRight, CheckCircle2, Sparkles, Zap, Shield } from 'lucide-react';

// ─── Gradient Palettes ─────────────────────────────────────────────
const GRADIENT_PALETTES = [
  { name: 'Midnight Aurora', colors: ['#0f0c29', '#302b63', '#24243e', '#0f0c29'] },
  { name: 'Ocean Depths', colors: ['#0a1628', '#1a3a5c', '#0d4f6e', '#0a1628'] },
  { name: 'Cosmic Purple', colors: ['#1a0533', '#3d1466', '#6b21a8', '#1a0533'] },
  { name: 'Northern Lights', colors: ['#0a192f', '#112240', '#233554', '#0a192f'] },
  { name: 'Deep Space', colors: ['#000000', '#0f172a', '#1e1b4b', '#000000'] },
  { name: 'Ember Glow', colors: ['#1a0a00', '#3d1c00', '#7c2d12', '#1a0a00'] },
  { name: 'Jade Matrix', colors: ['#021a0f', '#064e3b', '#0d9488', '#021a0f'] },
  { name: 'Twilight Rose', colors: ['#1a0a1e', '#4a1942', '#831843', '#1a0a1e'] },
  { name: 'Arctic Steel', colors: ['#0c1220', '#1e293b', '#334155', '#0c1220'] },
  { name: 'Neon Void', colors: ['#0a0a0a', '#1a0533', '#312e81', '#0a0a0a'] },
];

// ─── Floating Orb Component ────────────────────────────────────────
function FloatingOrb({ delay, size, color, position }: {
  delay: number;
  size: number;
  color: string;
  position: { top?: string; left?: string; right?: string; bottom?: string };
}) {
  return (
    <div
      className="absolute rounded-full blur-3xl opacity-20 animate-orb-float pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        animationDelay: `${delay}s`,
        ...position,
      }}
    />
  );
}

// ─── Particle Field ────────────────────────────────────────────────
function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white animate-particle-twinkle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Coming Soon Component ────────────────────────────────────
export function ComingSoonPage() {
  const firestore = useFirestore();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [activePalette] = useState(() => GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animate headline typing
  const [headlineVisible, setHeadlineVisible] = useState(false);
  const [subtextVisible, setSubtextVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeadlineVisible(true), 300);
    const t2 = setTimeout(() => setSubtextVisible(true), 800);
    const t3 = setTimeout(() => setCtaVisible(true), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      inputRef.current?.focus();
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'waitlist_emails'), {
        email: email.trim().toLowerCase(),
        created_at: serverTimestamp(),
        source: 'coming_soon_page',
      });
      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Failed to save email:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradientBg = `linear-gradient(135deg, ${activePalette.colors.join(', ')})`;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: gradientBg, backgroundSize: '400% 400%' }}
    >
      {/* Animated background layer */}
      <div
        className="absolute inset-0 animate-aurora-mesh"
        style={{ background: gradientBg, backgroundSize: '400% 400%' }}
      />

      {/* Floating Orbs */}
      <FloatingOrb delay={0} size={400} color="#6366f1" position={{ top: '-10%', left: '-5%' }} />
      <FloatingOrb delay={2} size={300} color="#8b5cf6" position={{ bottom: '-5%', right: '-5%' }} />
      <FloatingOrb delay={4} size={250} color="#a78bfa" position={{ top: '40%', right: '10%' }} />
      <FloatingOrb delay={1} size={200} color="#c084fc" position={{ bottom: '20%', left: '5%' }} />

      {/* Particle Field */}
      <ParticleField />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center">

        {/* Logo */}
        <div className={`mb-12 transition-all duration-1000 ${headlineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              </div>
            </div>
            <span className="text-sm font-bold text-white/80 tracking-wider uppercase">AgileSuit</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight transition-all duration-1000 ease-out ${headlineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="text-white">Your team deserves tools</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            that move at the speed of thought.
          </span>
        </h1>

        {/* Subtext */}
        <p
          className={`mt-6 md:mt-8 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed font-medium transition-all duration-1000 delay-200 ease-out ${subtextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          No more waiting for pages to load. No more drowning in features you&apos;ll never use.
          <span className="text-white/80 font-semibold"> Project management, rebuilt from zero.</span>
        </p>

        {/* Feature Pills */}
        <div
          className={`mt-8 flex flex-wrap justify-center gap-3 transition-all duration-1000 delay-300 ease-out ${subtextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {[
            { icon: Zap, label: 'Sub-second latency' },
            { icon: Sparkles, label: 'AI-powered sprints' },
            { icon: Shield, label: 'Zero bloat' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/70 text-xs font-bold uppercase tracking-wider"
            >
              <Icon className="h-3.5 w-3.5 text-indigo-400" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div
          className={`mt-12 transition-all duration-1000 delay-500 ease-out ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {isSubmitted ? (
            <div className="animate-fade-in-up">
              <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
                <div>
                  <p className="text-xl font-bold text-white">You&apos;re on the list!</p>
                  <p className="mt-1 text-sm text-white/60">We&apos;ll notify you when early access opens.</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <div className="relative w-full max-w-md">
                <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/20 focus-within:border-indigo-500/40 focus-within:bg-white/10 transition-all duration-300">
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Enter your email address"
                    className="flex-1 bg-transparent border-0 outline-none px-4 py-3 text-white placeholder-white/30 text-sm font-medium"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Join the Beta
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="absolute -bottom-6 left-4 text-xs text-red-400 font-medium animate-fade-in">{error}</p>
                )}
              </div>

              {/* Trust Text */}
              <p className="mt-4 text-xs text-white/30 font-medium tracking-wide">
                🔒 Only <span className="text-white/50 font-bold">100 spots</span> available for early access. No spam, ever.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[11px] text-white/20 font-medium tracking-wider uppercase">
          © {new Date().getFullYear()} AgileSuit · Built for teams that ship.
        </p>
      </div>
    </div>
  );
}
