import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import KillerFeature from "@/components/KillerFeature";
import HowItWorks from "@/components/HowItWorks";
import AIConsultant from "@/components/AIConsultant";
import UseCases from "@/components/UseCases";
import Security from "@/components/Security";
import ComparisonTable from "@/components/ComparisonTable";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProblemSolution />
      <KillerFeature />
      <HowItWorks />
      <AIConsultant />
      <UseCases />
      <Security />
      <ComparisonTable />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
