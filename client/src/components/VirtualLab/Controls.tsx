import React from 'react';
import { Play, Pause, RotateCcw, Save, Download } from 'lucide-react';

interface ControlsProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSave: () => void;
  onExport: () => void;
  isRunning: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onStart,
  onPause,
  onReset,
  onSave,
  onExport,
  isRunning
}) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md border">
      <button
        onClick={isRunning ? onPause : onStart}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isRunning
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} />}
        <span>{isRunning ? 'Pause' : 'Start'} Experiment</span>
      </button>
      
      <button
        onClick={onReset}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
      >
        <RotateCcw size={20} />
        <span>Reset</span>
      </button>
      
      <div className="border-l border-gray-300 h-8"></div>
      
      <button
        onClick={onSave}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
      >
        <Save size={20} />
        <span>Save Setup</span>
      </button>
      
      <button
        onClick={onExport}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
      >
        <Download size={20} />
        <span>Export Results</span>
      </button>
    </div>
  );
};