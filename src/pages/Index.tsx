import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import KillerFeature from "@/components/KillerFeature";
import HowItWorks from "@/components/HowItWorks";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProblemSolution />
      <KillerFeature />
      <HowItWorks />
    </div>
  );
};

export default Index;
