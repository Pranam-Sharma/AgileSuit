'use client';
import * as React from 'react';
import { LandingHeader } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default function ResourcesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <LandingHeader />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
