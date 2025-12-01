import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import KillerFeature from "@/components/KillerFeature";
import HowItWorks from "@/components/HowItWorks";
import AIConsultant from "@/components/AIConsultant";
import UseCases from "@/components/UseCases";
import Security from "@/components/Security";

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
    </div>
  );
};

export default Index;
