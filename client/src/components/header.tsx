import { Button } from "@/components/ui/button";
import { FlaskRound, Menu } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
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
          <button className="md:hidden p-2 text-gray-600">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
