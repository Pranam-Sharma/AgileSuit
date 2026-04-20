import { LandingHeader } from "./header";
import { HeroSection } from "./hero";
import { Footer } from "./footer";

export function LandingPage({ children }: { children?: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full dotted-bg">
            <LandingHeader />
            <main>
                <HeroSection />
                {children}
            </main>
            <Footer />
        </div>
    )
}
