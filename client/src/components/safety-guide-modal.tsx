import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Eye, Shield, Thermometer, Droplets } from "lucide-react";

interface SafetyGuideModalProps {
  children: React.ReactNode;
}

export default function SafetyGuideModal({ children }: SafetyGuideModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            Virtual Chemistry Lab Safety Guide
          </DialogTitle>
          <DialogDescription>
            Essential safety guidelines for conducting virtual chemistry experiments
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* General Safety */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                General Laboratory Safety
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Always read experiment instructions completely before starting</li>
                <li>• Follow all procedural steps in the correct order</li>
                <li>• Never skip safety warnings or precautions</li>
                <li>• Report any unusual observations or unexpected results</li>
                <li>• Keep your virtual workspace organized and clean</li>
              </ul>
            </section>

            {/* Chemical Handling */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                Chemical Handling
              </h3>
              <div className="space-y-3">
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-800">Aspirin Synthesis Safety</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Salicylic acid: Handle with care, avoid skin contact</li>
                    <li>• Acetic anhydride: Corrosive, keep away from water</li>
                    <li>• Sulfuric acid: Strong acid, extremely corrosive</li>
                    <li>• Always add chemicals in the specified order</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-800">Acid-Base Titration Safety</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• NaOH solution: Caustic, avoid contact with skin</li>
                    <li>• HCl solution: Corrosive acid, handle carefully</li>
                    <li>• Phenolphthalein: Indicator solution, use sparingly</li>
                    <li>• Rinse all glassware thoroughly before use</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Temperature Control */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-red-600" />
                Temperature and Heating Safety
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Monitor temperature continuously during heating</li>
                <li>• Never exceed recommended temperature ranges</li>
                <li>• Allow hot equipment to cool before handling</li>
                <li>• Use appropriate heating rates - avoid rapid temperature changes</li>
                <li>• Be aware that some reactions are exothermic (release heat)</li>
              </ul>
            </section>

            {/* Equipment Safety */}
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Virtual Equipment Guidelines
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Check that all virtual equipment is properly set up</li>
                <li>• Ensure stirring mechanisms are functioning correctly</li>
                <li>• Verify temperature controls are responsive</li>
                <li>• Use appropriate glassware for each step</li>
                <li>• Follow proper mixing and stirring techniques</li>
              </ul>
            </section>

            {/* Emergency Procedures */}
            <section>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="text-lg font-semibold mb-3 text-red-800">
                  Virtual Emergency Procedures
                </h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• If an experiment behaves unexpectedly, stop and review instructions</li>
                  <li>• Reset the simulation if parameters go out of safe ranges</li>
                  <li>• Contact instructor if you encounter persistent issues</li>
                  <li>• Document any unusual observations in your lab notebook</li>
                </ul>
              </div>
            </section>

            {/* Best Practices */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Best Practices for Virtual Labs</h3>
              <ul className="space-y-2 text-sm">
                <li>• Take your time - rushing leads to mistakes</li>
                <li>• Record observations and measurements accurately</li>
                <li>• Review safety information before each new experiment</li>
                <li>• Practice proper laboratory techniques even in virtual environment</li>
                <li>• Ask questions if you're unsure about any procedure</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}