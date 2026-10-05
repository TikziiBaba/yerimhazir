import LandingHeader from '@/components/landing/header';
import HeroSection from '@/components/landing/hero-section';
import IndustrySolutionsSection from '@/components/landing/industry-solutions';
import FeaturesSection from '@/components/landing/features-section';
import RoiCalculatorSection from '@/components/landing/roi-calculator';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import PricingSection from '@/components/landing/pricing-section';
import FaqSection from '@/components/landing/faq-section';
import CtaBanner from '@/components/landing/cta-banner';
import LandingFooter from '@/components/landing/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-200 selection:bg-primary-500 selection:text-white">
      <LandingHeader />
      <main>
        <HeroSection />
        <IndustrySolutionsSection />
        <FeaturesSection />
        <RoiCalculatorSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
