import { LandingHeader } from "./header";
import { HeroSection } from "./hero";

export function LandingPage() {
    return (
        <div className="min-h-screen w-full dotted-bg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <LandingHeader />
                <HeroSection />
            </div>
        </div>
    )
}
