'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Check } from 'lucide-react';
import { finalizeSubscription } from '@/app/actions/stripe';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const router = useRouter();
    const [status, setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorDetails, setErrorDetails] = React.useState('');

    React.useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setErrorDetails('Invalid Session ID');
            return;
        }

        const verify = async () => {
            try {
                await finalizeSubscription(sessionId);
                // Artificial delay to let the animation play if it was instantaneous
                await new Promise(r => setTimeout(r, 800));
                setStatus('success');
                // We NO LONGER auto-redirect. User must click "Continue".
            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setErrorDetails('Failed to verify payment. Please contact support.');
            }
        };

        verify();
    }, [sessionId]);

    if (status === 'error') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-red-600 text-xl font-bold mb-2">Payment Verification Failed</h2>
                    <p className="text-zinc-500 mb-6">{errorDetails}</p>
                    <Button onClick={() => router.push('/checkout')} variant="outline" className="w-full">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Loading State
    if (status === 'verifying') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                <p className="text-zinc-500 font-medium">Verifying Secure Payment...</p>
            </div>
        );
    }

    // Success State (The "Popup")
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-500">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center overlow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

                {/* Background Pattern (Subtle Stars/Sparkles) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-3xl">
                    <div className="absolute top-4 left-8 text-indigo-500 text-xs">✨</div>
                    <div className="absolute top-12 right-12 text-fuchsia-500 text-xs">✨</div>
                    <div className="absolute bottom-8 left-16 text-indigo-500 text-xs">✨</div>
                </div>

                {/* Checkmark Icon with Pulse */}
                <div className="relative mb-6 mx-auto w-24 h-24 flex items-center justify-center">
                    {/* Pulse Rings */}
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-2 bg-green-400 rounded-full opacity-20 animate-pulse"></div>

                    {/* 3D-ish Green Circle */}
                    <div className="relative w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full shadow-[0_8px_16px_rgba(34,197,94,0.3)] flex items-center justify-center transform transition-transform hover:scale-105">
                        {/* Gloss Effect */}
                        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                        <Check className="w-10 h-10 text-white stroke-[4]" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payment Successful 🎉</h1>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                    Your payment has been successfully processed. You can now proceed to set up your organization workspace.
                </p>

                <Button
                    onClick={() => router.push('/company-setup')}
                    className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Continue to Setup
                </Button>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <React.Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        }>
            <PaymentSuccessContent />
        </React.Suspense>
    );
}
