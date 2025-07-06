import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Calculator, Beaker, Droplets, Atom, FlaskConical, Zap, BarChart3, Plus, Edit3 } from 'lucide-react';

interface Result {
  id: string;
  type: 'success' | 'warning' | 'error' | 'reaction';
  title: string;
  description: string;
  timestamp: string;
  calculation?: {
    volumeAdded?: number;
    totalVolume?: number;
    concentration?: string;
    molarity?: number;
    moles?: number;
    reaction?: string;
    yield?: number;
    ph?: number;
    balancedEquation?: string;
    reactionType?: string;
    products?: string[];
    mechanism?: string[];
    thermodynamics?: {
      deltaH?: number;
      deltaG?: number;
      equilibriumConstant?: number;
    };
  };
}

interface TitrationTrial {
  trial: number;
  initialReading: number;
  finalReading: number;
  volumeUsed: number;
  colorChange: string;
  endpoint: boolean;
}

interface ResultsPanelProps {
  results: Result[];
  onClear: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, onClear }) => {
  const [titrationTrials, setTitrationTrials] = useState<TitrationTrial[]>([]);
  const [isAddingTrial, setIsAddingTrial] = useState(false);
  const [newTrial, setNewTrial] = useState({
    initialReading: '',
    finalReading: '',
    colorChange: 'Colorless to light pink',
    endpoint: true
  });

  const handleAddTrial = () => {
    if (newTrial.initialReading && newTrial.finalReading) {
      const initial = parseFloat(newTrial.initialReading);
      const final = parseFloat(newTrial.finalReading);
      const volumeUsed = final - initial;

      const trial: TitrationTrial = {
        trial: titrationTrials.length + 1,
        initialReading: initial,
        finalReading: final,
        volumeUsed: volumeUsed,
        colorChange: newTrial.colorChange,
        endpoint: newTrial.endpoint
      };

      setTitrationTrials(prev => [...prev, trial]);
      setNewTrial({
        initialReading: '',
        finalReading: '',
        colorChange: 'Colorless to light pink',
        endpoint: true
      });
      setIsAddingTrial(false);
    }
  };

  const handleClearTrials = () => {
    setTitrationTrials([]);
  };

  // Calculate statistics from titration data
  const calculateTitrationStats = () => {
    if (titrationTrials.length === 0) {
      return {
        average: '0.00',
        standardDeviation: '0.000',
        rsd: '0.00',
        hclMolarity: '0.0000',
        precision: 'No data'
      };
    }

    const volumes = titrationTrials.map(trial => trial.volumeUsed);
    const average = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    
    // Calculate standard deviation
    const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - average, 2), 0) / volumes.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate relative standard deviation (RSD)
    const rsd = (standardDeviation / average) * 100;
    
    // Calculate concentration of HCl (assuming 0.1 M NaOH)
    const naohMolarity = 0.1; // M
    const hclVolume = 25.0; // mL (assumed)
    const hclMolarity = (naohMolarity * average) / hclVolume;
    
    return {
      average: average.toFixed(2),
      standardDeviation: standardDeviation.toFixed(3),
      rsd: isNaN(rsd) ? '0.00' : rsd.toFixed(2),
      hclMolarity: hclMolarity.toFixed(4),
      precision: rsd < 1 ? 'Excellent' : rsd < 2 ? 'Good' : rsd < 5 ? 'Acceptable' : 'Poor'
    };
  };

  const stats = calculateTitrationStats();

  const getIcon = (type: Result['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'reaction':
        return <Atom className="text-purple-500" size={20} />;
    }
  };

  const getBgColor = (type: Result['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'reaction':
        return 'bg-purple-50 border-purple-200';
    }
  };

  const formatCalculation = (calc: Result['calculation']) => {
    if (!calc) return null;

    return (
      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Calculator className="text-blue-600" size={16} />
          <span className="text-sm font-medium text-blue-900">Calculations & Analysis</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          {calc.volumeAdded && (
            <div className="flex items-center space-x-1">
              <Droplets className="text-blue-500" size={12} />
              <span className="text-gray-600">Volume Added:</span>
              <span className="font-medium text-blue-700">{calc.volumeAdded.toFixed(1)} mL</span>
            </div>
          )}
          
          {calc.totalVolume && (
            <div className="flex items-center space-x-1">
              <Beaker className="text-blue-500" size={12} />
              <span className="text-gray-600">Total Volume:</span>
              <span className="font-medium text-blue-700">{calc.totalVolume.toFixed(1)} mL</span>
            </div>
          )}
          
          {calc.concentration && (
            <div>
              <span className="text-gray-600">Concentration:</span>
              <span className="font-medium text-purple-700 ml-1">{calc.concentration}</span>
            </div>
          )}
          
          {calc.molarity && (
            <div>
              <span className="text-gray-600">Molarity:</span>
              <span className="font-medium text-purple-700 ml-1">{calc.molarity.toFixed(3)} M</span>
            </div>
          )}
          
          {calc.moles && (
            <div>
              <span className="text-gray-600">Moles:</span>
              <span className="font-medium text-indigo-700 ml-1">{calc.moles.toFixed(4)} mol</span>
            </div>
          )}
          
          {calc.ph && (
            <div>
              <span className="text-gray-600">pH:</span>
              <span className={`font-medium ml-1 ${calc.ph < 7 ? 'text-red-600' : calc.ph > 7 ? 'text-blue-600' : 'text-green-600'}`}>
                {calc.ph.toFixed(2)}
              </span>
            </div>
          )}
          
          {calc.yield && (
            <div>
              <span className="text-gray-600">Yield:</span>
              <span className="font-medium text-green-700 ml-1">{calc.yield.toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        {/* Chemical Reaction Details */}
        {calc.balancedEquation && (
          <div className="mt-3 space-y-3">
            {/* Reaction Type */}
            {calc.reactionType && (
              <div className="bg-purple-100 border border-purple-200 rounded p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <FlaskConical className="text-purple-600" size={14} />
                  <span className="text-xs font-medium text-purple-900">Reaction Type</span>
                </div>
                <div className="text-sm font-medium text-purple-800">{calc.reactionType}</div>
              </div>
            )}

            {/* Balanced Equation */}
            <div className="bg-white border border-gray-200 rounded p-2">
              <span className="text-xs text-gray-600 block mb-1">Balanced Chemical Equation:</span>
              <div className="text-sm font-mono text-gray-800 bg-gray-50 p-2 rounded border">
                {calc.balancedEquation}
              </div>
            </div>

            {/* Products */}
            {calc.products && calc.products.length > 0 && (
              <div className="bg-green-100 border border-green-200 rounded p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Beaker className="text-green-600" size={14} />
                  <span className="text-xs font-medium text-green-900">Products Formed</span>
                </div>
                <ul className="text-xs text-green-800 space-y-1">
                  {calc.products.map((product, idx) => (
                    <li key={idx} className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                      <span>{product}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reaction Mechanism */}
            {calc.mechanism && calc.mechanism.length > 0 && (
              <div className="bg-indigo-100 border border-indigo-200 rounded p-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="text-indigo-600" size={14} />
                  <span className="text-xs font-medium text-indigo-900">Reaction Mechanism</span>
                </div>
                <ol className="text-xs text-indigo-800 space-y-1">
                  {calc.mechanism.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-indigo-600 font-medium">{idx + 1}.</span>
                      <span className="font-mono">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Thermodynamics */}
            {calc.thermodynamics && (
              <div className="bg-orange-100 border border-orange-200 rounded p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Atom className="text-orange-600" size={14} />
                  <span className="text-xs font-medium text-orange-900">Thermodynamic Properties</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {calc.thermodynamics.deltaH && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enthalpy Change (ΔH):</span>
                      <span className={`font-medium ${calc.thermodynamics.deltaH < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {calc.thermodynamics.deltaH > 0 ? '+' : ''}{calc.thermodynamics.deltaH} kJ/mol
                        <span className="text-xs ml-1">
                          ({calc.thermodynamics.deltaH < 0 ? 'Exothermic' : 'Endothermic'})
                        </span>
                      </span>
                    </div>
                  )}
                  {calc.thermodynamics.deltaG && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gibbs Free Energy (ΔG):</span>
                      <span className={`font-medium ${calc.thermodynamics.deltaG < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calc.thermodynamics.deltaG > 0 ? '+' : ''}{calc.thermodynamics.deltaG} kJ/mol
                        <span className="text-xs ml-1">
                          ({calc.thermodynamics.deltaG < 0 ? 'Spontaneous' : 'Non-spontaneous'})
                        </span>
                      </span>
                    </div>
                  )}
                  {calc.thermodynamics.equilibriumConstant && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equilibrium Constant (K):</span>
                      <span className="font-medium text-purple-600">
                        {calc.thermodynamics.equilibriumConstant.toExponential(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simple reaction equation for non-detailed reactions */}
        {calc.reaction && !calc.balancedEquation && (
          <div className="mt-2 p-2 bg-white rounded border">
            <span className="text-xs text-gray-600">Reaction:</span>
            <div className="text-sm font-mono text-gray-800 mt-1">{calc.reaction}</div>
          </div>
        )}
      </div>
    );
  };

  // Calculate summary statistics
  const totalVolume = results.reduce((sum, result) => {
    return sum + (result.calculation?.volumeAdded || 0);
  }, 0);

  const totalReactions = results.filter(result => 
    result.type === 'reaction' || result.title.includes('Reaction') || result.calculation?.reaction
  ).length;

  const averagePH = results
    .filter(result => result.calculation?.ph)
    .reduce((sum, result, _, arr) => sum + (result.calculation?.ph || 0) / arr.length, 0);

  const reactionTypes = results
    .filter(result => result.calculation?.reactionType)
    .map(result => result.calculation?.reactionType)
    .filter((type, index, arr) => arr.indexOf(type) === index);

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <div>
          <h3 className="font-semibold">Experiment Results & Chemical Analysis</h3>
          <p className="text-sm opacity-90">Real-time chemical reactions and calculations</p>
        </div>
        <button
          onClick={onClear}
          className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition-colors"
        >
          Clear All
        </button>
      </div>
      
      {/* Titration Data Table */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="text-blue-600" size={20} />
            <h4 className="font-semibold text-blue-900">Acid-Base Titration Results</h4>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsAddingTrial(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              <span>Add Trial</span>
            </button>
            {titrationTrials.length > 0 && (
              <button
                onClick={handleClearTrials}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Clear Trials
              </button>
            )}
          </div>
        </div>
        
        {/* Add Trial Form */}
        {isAddingTrial && (
          <div className="mb-4 bg-white rounded-lg border p-4">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <Edit3 className="text-blue-600 mr-2" size={16} />
              Add New Trial Data
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Initial Reading (mL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTrial.initialReading}
                  onChange={(e) => setNewTrial(prev => ({ ...prev, initialReading: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Final Reading (mL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTrial.finalReading}
                  onChange={(e) => setNewTrial(prev => ({ ...prev, finalReading: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="23.50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Color Change
                </label>
                <select
                  value={newTrial.colorChange}
                  onChange={(e) => setNewTrial(prev => ({ ...prev, colorChange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Colorless to light pink">Colorless to light pink</option>
                  <option value="Colorless to pink">Colorless to pink</option>
                  <option value="Colorless to deep pink">Colorless to deep pink</option>
                  <option value="No color change">No color change</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Endpoint Reached
                </label>
                <select
                  value={newTrial.endpoint.toString()}
                  onChange={(e) => setNewTrial(prev => ({ ...prev, endpoint: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleAddTrial}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Trial
              </button>
              <button
                onClick={() => setIsAddingTrial(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Trial</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Initial Reading (mL)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Final Reading (mL)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Volume Used (mL)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Color Change</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Endpoint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {titrationTrials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="text-gray-400 mb-2" size={32} />
                        <p className="text-lg font-medium">No trial data yet</p>
                        <p className="text-sm">Click "Add Trial" to record your experimental results</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  titrationTrials.map((trial, index) => (
                    <tr key={trial.trial} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-blue-600">{trial.trial}</td>
                      <td className="px-4 py-3 text-gray-900">{trial.initialReading.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-900">{trial.finalReading.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium text-purple-600">{trial.volumeUsed.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-700">{trial.colorChange}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          trial.endpoint 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trial.endpoint ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistical Analysis - Only show if there are trials */}
        {titrationTrials.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statistics */}
            <div className="bg-white rounded-lg border p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calculator className="text-blue-600 mr-2" size={16} />
                Statistical Analysis
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Volume:</span>
                  <span className="font-medium text-blue-700">{stats.average} mL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Standard Deviation:</span>
                  <span className="font-medium text-purple-700">±{stats.standardDeviation} mL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RSD (%):</span>
                  <span className={`font-medium ${parseFloat(stats.rsd) < 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {stats.rsd}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precision:</span>
                  <span className={`font-medium ${
                    stats.precision === 'Excellent' ? 'text-green-600' : 
                    stats.precision === 'Good' ? 'text-blue-600' : 
                    stats.precision === 'Acceptable' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.precision}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="bg-white rounded-lg border p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <FlaskConical className="text-purple-600 mr-2" size={16} />
                Calculated Results
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">HCl Molarity:</span>
                  <span className="font-medium text-purple-700">{stats.hclMolarity} M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NaOH Molarity:</span>
                  <span className="font-medium text-blue-700">0.1000 M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HCl Volume:</span>
                  <span className="font-medium text-green-700">25.00 mL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Equivalence Point:</span>
                  <span className="font-medium text-indigo-700">pH ≈ 7.00</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experimental Notes - Only show if there are trials */}
        {titrationTrials.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h5 className="font-medium text-yellow-900 mb-2">Experimental Observations</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• {titrationTrials.filter(t => t.endpoint).length} out of {titrationTrials.length} trials reached endpoint successfully</li>
              <li>• Most common color change: {titrationTrials.length > 0 ? titrationTrials[0].colorChange : 'N/A'}</li>
              <li>• RSD of {stats.rsd}% indicates {stats.precision.toLowerCase()} experimental precision</li>
              <li>• Results suggest {parseFloat(stats.hclMolarity) > 0.09 && parseFloat(stats.hclMolarity) < 0.11 ? 'accurate' : 'variable'} neutralization of HCl with NaOH</li>
            </ul>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-5 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-xs text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{totalVolume.toFixed(1)}</div>
            <div className="text-xs text-gray-600">Total Volume (mL)</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{totalReactions}</div>
            <div className="text-xs text-gray-600">Reactions</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className={`text-2xl font-bold ${averagePH < 7 ? 'text-red-600' : averagePH > 7 ? 'text-blue-600' : 'text-green-600'}`}>
              {averagePH ? averagePH.toFixed(1) : '--'}
            </div>
            <div className="text-xs text-gray-600">Avg pH</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{titrationTrials.length}</div>
            <div className="text-xs text-gray-600">Trials Recorded</div>
          </div>
        </div>

        {/* Reaction Types Summary */}
        {reactionTypes.length > 0 && (
          <div className="mt-4 bg-white rounded-lg p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-900 mb-2">Detected Reaction Types:</div>
            <div className="flex flex-wrap gap-2">
              {reactionTypes.map((type, idx) => (
                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 h-80 overflow-y-auto">
        {results.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Calculator className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-lg font-medium">No results yet</p>
            <p className="text-sm">Start your experiment to see detailed calculations and chemical reactions!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border ${getBgColor(result.type)} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start space-x-3">
                  {getIcon(result.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{result.title}</div>
                      <div className="text-xs text-gray-500">{result.timestamp}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{result.description}</div>
                    
                    {formatCalculation(result.calculation)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};