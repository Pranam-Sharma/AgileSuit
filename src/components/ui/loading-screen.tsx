import React from 'react';

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f8f5f0] dark:bg-zinc-950">
            <div className="flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                    {/* Spinning Outer Ring */}
                    <div className="absolute h-32 w-32 animate-spin rounded-full border-4 border-primary/30 border-t-primary shadow-lg shadow-primary/20"></div>

                    {/* Logo Container */}
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-white shadow-sm flex items-center justify-center relative z-10">
                        <img
                            src="/images/AgileSuitLogo.jpg"
                            alt="Loading..."
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
                <p className="text-sm font-medium text-zinc-500 animate-pulse tracking-wide font-headline">{message}</p>
            </div>
        </div>
    );
}
