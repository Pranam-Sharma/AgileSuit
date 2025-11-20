'use client';

import * as React from 'react';
import { Logo } from '@/components/logo';

function WavyBackground() {
  return (
    <div className="absolute inset-0 opacity-10 overflow-hidden">
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -50,150 Q 150,50 450,150"
          stroke="white"
          fill="none"
          strokeWidth="10"
          className="animate-wave-1"
        />
        <path
          d="M -50,250 Q 150,150 450,250"
          stroke="white"
          fill="none"
          strokeWidth="10"
          className="animate-wave-2"
        />
        <path
          d="M -50,350 Q 150,250 450,350"
          stroke="white"
          fill="none"
          strokeWidth="10"
          className="animate-wave-3"
        />
      </svg>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-fuchsia-600 to-blue-600 text-white relative animate-gradient-bg">
          <WavyBackground />
          <div className="z-10 mt-4">
            <Logo className="text-white" />
          </div>
          <div className="z-10 mt-auto">
            <h2 className="text-lg text-blue-100">
              The Operating system for Agile Teams
            </h2>
            <p className="text-sm text-blue-100 z-10 mt-2">
              AgileSuit is a central place to manage sprints, insights, and team
              performance , it helps team plan better, deliver faster and
              improve continuosly
            </p>
          </div>
        </div>
        <div className="bg-card p-8 sm:p-12 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </main>
  );
}