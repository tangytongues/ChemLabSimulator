import { Button } from "@/components/ui/button";
import { Play, Book } from "lucide-react";

export default function HeroSection() {
  const scrollToExperiments = () => {
    const experimentsSection = document.getElementById('experiments');
    if (experimentsSection) {
      experimentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Discover Chemistry Through Virtual Experiments
          </h2>
          <p className="text-xl mb-8 text-blue-50 max-w-3xl mx-auto drop-shadow-md">
            Experience hands-on chemistry learning with our interactive virtual laboratory. 
            Conduct real experiments safely and track your progress step by step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToExperiments}
              className="bg-white text-science-blue px-8 py-3 hover:bg-gray-100"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Experimenting
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white px-8 py-3 hover:bg-white hover:text-science-blue"
            >
              <Book className="mr-2 h-4 w-4" />
              View Safety Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
