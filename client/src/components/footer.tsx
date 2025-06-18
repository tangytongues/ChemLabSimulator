import { FlaskRound } from "lucide-react";
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FlaskRound className="text-2xl text-science-blue" />
              <h4 className="text-xl font-bold">ChemLab Virtual</h4>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering chemistry education through interactive virtual experiments. 
              Learn safely, practice endlessly, and master chemistry concepts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-science-blue transition-colors">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-science-blue transition-colors">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-science-blue transition-colors">
                <FaLinkedin className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-science-blue transition-colors">
                <FaGithub className="text-xl" />
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Platform</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Experiments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Progress Tracking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ChemLab Virtual. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
