import * as React from 'react';
import { Logo } from '@/components/logo';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-400 to-blue-600 text-white relative">
           <div className="absolute inset-0 bg-no-repeat bg-center opacity-10" style={{backgroundImage: 'url(/wavy-bg.svg)'}}></div>
          <div className='z-10'>
            <Logo className="text-white" />
          </div>
          <div className="z-10">
            <h2 className="text-lg text-blue-100">The Operating system for Agile Teams</h2>
             <p className="text-sm text-blue-100 z-10 mt-4">
              AgileSuit is a central place to manage sprints, insights, and team performance , it helps team plan better, deliver faster and improve continuosly
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
