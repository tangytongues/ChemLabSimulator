import React from 'react';
import { Droplets, RotateCw } from 'lucide-react';

interface AnimatedEquipmentProps {
  isStirring: boolean;
  isDropping: boolean;
  temperature: number;
  solutionColor: string;
  volume: number;
  bubbling: boolean;
}

export const AnimatedEquipment: React.FC<AnimatedEquipmentProps> = ({
  isStirring,
  isDropping,
  temperature,
  solutionColor,
  volume,
  bubbling
}) => {
  return (
    <div className="relative w-full h-full">
      {/* Burette - Better positioned and sized */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          {/* Burette tube - Larger */}
          <div className="w-6 h-64 bg-gradient-to-b from-transparent to-blue-100 border-2 border-blue-400 rounded-b-lg">
            {/* Solution in burette */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-blue-300 rounded-b-lg transition-all duration-1000"
              style={{ height: `${Math.max(20, 240 - volume * 4)}px` }}
            ></div>
            {/* Volume markings - Better positioned */}
            {[10, 20, 30, 40, 50].map(mark => (
              <div key={mark} className="absolute right-8 text-xs text-gray-600" style={{ top: `${mark * 4.5}px` }}>
                {50 - mark}
              </div>
            ))}
          </div>
          
          {/* Burette tap */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3">
            <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            
            {/* Enhanced Droplet Animation */}
            {isDropping && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                {/* Continuous stream of droplets */}
                <div className="relative w-3 h-40">
                  {/* Main droplet stream */}
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-1/2 transform -translate-x-1/2"
                      style={{
                        top: `${i * 15}px`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    >
                      <div className="w-2 h-4 bg-blue-400 rounded-full animate-bounce opacity-80"
                           style={{ 
                             animationDuration: '1.2s',
                             animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                           }}>
                      </div>
                    </div>
                  ))}
                  
                  {/* Splash effect at bottom */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    {isDropping && (
                      <div className="relative">
                        {/* Ripple effect */}
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-6 h-1 bg-blue-300 rounded-full opacity-40 animate-ping"
                            style={{
                              left: '-12px',
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '0.8s'
                            }}
                          ></div>
                        ))}
                        
                        {/* Micro droplets splashing */}
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={`splash-${i}`}
                            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                            style={{
                              left: `${-2 + i}px`,
                              top: '-3px',
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.6s'
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Droplet formation at tip */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse opacity-90"
                         style={{ animationDuration: '0.5s' }}>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Burette clamp - Better positioned */}
          <div className="absolute top-12 -left-3 w-10 h-6 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Conical Flask - Larger and better positioned */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          {/* Flask body - Larger */}
          <div className="w-32 h-40 bg-gradient-to-b from-transparent via-transparent to-gray-100 border-2 border-gray-400 rounded-b-full relative overflow-hidden">
            {/* Solution */}
            <div 
              className="absolute bottom-3 left-3 right-3 rounded-b-full transition-all duration-500"
              style={{ 
                height: `${Math.min(120, volume * 2.5 + 25)}px`,
                backgroundColor: solutionColor,
                opacity: 0.8
              }}
            >
              {/* Surface ripples from droplets */}
              {isDropping && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`ripple-${i}`}
                      className="absolute w-12 h-1 bg-white opacity-30 rounded-full animate-ping"
                      style={{
                        left: '25%',
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '1s'
                      }}
                    ></div>
                  ))}
                </div>
              )}
              
              {/* Stirring animation */}
              {isStirring && (
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                  <div className="w-2 h-12 bg-white opacity-50 mx-auto mt-3 rounded-full"></div>
                </div>
              )}
              
              {/* Bubbling animation */}
              {bubbling && (
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-white opacity-60 rounded-full animate-bounce"
                      style={{
                        left: `${15 + i * 12}%`,
                        bottom: `${15 + (i % 2) * 25}px`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '1.5s'
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Flask neck - Larger */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gray-100 border-2 border-gray-400 rounded-t-lg"></div>
          
          {/* Magnetic stirrer bar */}
          {isStirring && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-2 bg-gray-800 rounded-full animate-spin" style={{ animationDuration: '0.5s' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Magnetic Stirrer - Larger */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="w-40 h-12 bg-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="text-sm text-white font-medium">MAGNETIC STIRRER</div>
            <div className={`w-4 h-4 rounded-full ${isStirring ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          </div>
        </div>
      </div>

      {/* pH Indicator - Better positioned */}
      <div className="absolute top-8 right-8">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md">
          <div className="text-xs text-gray-600 mb-1">pH Level</div>
          <div className="text-xl font-bold" style={{ color: solutionColor }}>
            {temperature > 25 ? '7.2' : '6.8'}
          </div>
        </div>
      </div>

      {/* Temperature Display */}
      <div className="absolute top-24 right-8">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md">
          <div className="text-xs text-gray-600 mb-1">Temperature</div>
          <div className="text-xl font-bold text-blue-600">
            {temperature.toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* Volume Display */}
      <div className="absolute bottom-8 right-8">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md">
          <div className="text-xs text-gray-600 mb-1">Volume Added</div>
          <div className="text-xl font-bold text-blue-600">
            {volume.toFixed(1)} mL
          </div>
        </div>
      </div>

      {/* Titration Status Indicator */}
      {isDropping && (
        <div className="absolute top-8 left-8">
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center space-x-2">
              <Droplets size={20} />
              <span className="text-sm font-medium">Titrating...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};