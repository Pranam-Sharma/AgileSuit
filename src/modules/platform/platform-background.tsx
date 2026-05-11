'use client';

export function PlatformBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0 transition-[background] duration-500"
        style={{ background: 'var(--platform-canvas-background)' }}
      />
      <div
        className="absolute -inset-[18%] blur-3xl saturate-[1.22] transition-[background] duration-700"
        style={{ background: 'var(--platform-liquid-background)' }}
      />
      <div
        className="absolute -inset-[8%] opacity-80 blur-xl transition-[background] duration-700"
        style={{ background: 'var(--platform-canvas-overlay)' }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[18px]"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,var(--platform-readability-opacity)) 0%, rgba(255,255,255,0.08) 46%, rgba(255,255,255,var(--platform-readability-opacity)) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-70 transition-[background] duration-700"
        style={{ background: 'var(--platform-glass-highlight)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(var(--platform-subtle-grid) 1px, transparent 1px), linear-gradient(90deg, var(--platform-subtle-grid) 1px, transparent 1px)',
          backgroundSize: '76px 76px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 82%)',
        }}
      />
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: 'var(--platform-vignette-overlay)' }}
      />
      <div
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"
        style={{ opacity: 'var(--platform-noise-opacity)' }}
      />
    </div>
  );
}
