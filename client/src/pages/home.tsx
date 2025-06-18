import { useState } from "react";
import { useExperiments, useUserProgress } from "@/hooks/use-experiments";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import ExperimentCard from "@/components/experiment-card";
import ExperimentModal from "@/components/experiment-modal";
import FeaturesSection from "@/components/features-section";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Experiment } from "@shared/schema";

export default function Home() {
  const { data: experiments, isLoading: experimentsLoading } = useExperiments();
  const { data: userProgress } = useUserProgress();
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Experiments");

  const categories = [
    "All Experiments",
    "Organic Chemistry",
    "Acid-Base",
    "Equilibrium",
    "Synthesis",
    "Beginner"
  ];

  const filteredExperiments = experiments?.filter(exp => {
    if (selectedCategory === "All Experiments") return true;
    return exp.category === selectedCategory || exp.difficulty === selectedCategory;
  }) || [];

  const getProgressForExperiment = (experimentId: number) => {
    return userProgress?.find(p => p.experimentId === experimentId);
  };

  const handleViewDetails = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <StatsSection />
      
      {/* Experiments Section */}
      <section id="experiments" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Available Experiments</h3>
            <p className="text-xl text-lab-gray max-w-2xl mx-auto">
              Choose from our collection of interactive chemistry experiments, each designed to provide 
              hands-on learning experience with real-world applications.
            </p>
          </div>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={
                  selectedCategory === category
                    ? "bg-science-blue text-white hover:bg-blue-700"
                    : "bg-white border-gray-300 text-lab-gray hover:border-science-blue hover:text-science-blue"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Experiments Grid */}
          {experimentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredExperiments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lab-gray text-lg">No experiments found for the selected category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExperiments.map((experiment) => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  progress={getProgressForExperiment(experiment.id)}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <FeaturesSection />
      <Footer />

      <ExperimentModal
        experiment={selectedExperiment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
