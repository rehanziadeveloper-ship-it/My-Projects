import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemVsSolution from "@/components/ProblemVsSolution";
import LiveVoiceSimulator from "@/components/LiveVoiceSimulator";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import ArchitectureVisualizer from "@/components/ArchitectureVisualizer";
import RoiCalculator from "@/components/RoiCalculator";
import PartnershipModels from "@/components/PartnershipModels";
import FounderSection from "@/components/FounderSection";
import LeadIntakeAndCal from "@/components/LeadIntakeAndCal";
import Footer from "@/components/Footer";
import { getProjects } from "@/lib/projects";

export default function HomePage() {
  const initialProjects = getProjects();

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main>
        <Hero />
        <ProblemVsSolution />
        <LiveVoiceSimulator />
        <ProjectsShowcase initialProjects={initialProjects} />
        <ArchitectureVisualizer />
        <RoiCalculator />
        <PartnershipModels />
        <FounderSection />
        <LeadIntakeAndCal />
      </main>
      <Footer />
    </div>
  );
}
