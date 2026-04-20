'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useFeatureFlag } from '@/firebase/provider';
import { ComingSoonPage } from './coming-soon';
import { LandingPage } from './landing-page';
import { SolutionsSection } from './solutions';
import { FeaturesSection } from './features';
import { ResourcesSection } from './resources';

export function HomePageResolver() {
  const { value: showComingSoon, loading } = useFeatureFlag('show_coming_soon', true);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              </div>
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 text-indigo-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (showComingSoon) {
    return <ComingSoonPage />;
  }

  return (
    <LandingPage>
      <SolutionsSection />
      <FeaturesSection />
      <ResourcesSection />
    </LandingPage>
  );
}
