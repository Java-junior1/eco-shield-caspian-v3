import { AiSection } from "@/components/AiSection";
import { DemoModalProvider } from "@/components/DemoModal";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LiveDataProvider } from "@/components/LiveDataProvider";
import { TechCta } from "@/components/TechCta";
import { WhySection } from "@/components/WhySection";

export default function Page() {
  return (
    <LiveDataProvider>
      <DemoModalProvider>
        <Header />
        <main>
          <Hero />
          <Features />
          <AiSection />
          <WhySection />
          <TechCta />
        </main>
        <Footer />
      </DemoModalProvider>
    </LiveDataProvider>
  );
}
