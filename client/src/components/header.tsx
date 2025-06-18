import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FlaskRound, Menu, X } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <FlaskRound className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ChemLab Virtual</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#experiments" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
              Experiments
            </a>
            <a href="#progress" className="text-gray-600 hover:text-gray-900 transition-colors">
              My Progress
            </a>
            <a href="#safety" className="text-gray-600 hover:text-gray-900 transition-colors">
              Safety Guide
            </a>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Sign In
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#experiments" className="text-blue-600 font-medium px-4 py-2">
                Experiments
              </a>
              <a href="#progress" className="text-gray-600 hover:text-gray-900 px-4 py-2">
                My Progress
              </a>
              <a href="#safety" className="text-gray-600 hover:text-gray-900 px-4 py-2">
                Safety Guide
              </a>
              <div className="px-4">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
