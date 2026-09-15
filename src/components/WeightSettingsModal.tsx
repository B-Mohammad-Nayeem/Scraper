import React from 'react';
import { X, RotateCcw, Shield, Sliders } from 'lucide-react';
import { VerificationWeightConfig } from '../types.js';

interface WeightSettingsModalProps {
  weights: VerificationWeightConfig;
  onSaveWeights: (newWeights: VerificationWeightConfig) => void;
  onClose: () => void;
}

export const DEFAULT_CONFIG: VerificationWeightConfig = {
  mapsMatch: 25,
  websiteFound: 20,
  addressMatch: 20,
  phoneMatch: 15,
  independentSource: 10,
  registryMatch: 10
};

export const WeightSettingsModal: React.FC<WeightSettingsModalProps> = ({
  weights,
  onSaveWeights,
  onClose
}) => {
  const [current, setCurrent] = React.useState<VerificationWeightConfig>({ ...weights });

  const total =
    current.mapsMatch +
    current.websiteFound +
    current.addressMatch +
    current.phoneMatch +
    current.independentSource +
    current.registryMatch;

  const handleChange = (key: keyof VerificationWeightConfig, val: number) => {
    setCurrent((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(50, val))
    }));
  };

  const handleReset = () => {
    setCurrent({ ...DEFAULT_CONFIG });
  };

  const handleApply = () => {
    onSaveWeights(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Verification Scoring Configuration</h3>
              <p className="text-xs text-slate-500">Customize point allocations for verification signals</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between">
            <div>
              <span className="font-semibold">Current Cumulative Max:</span> {total} points
              <div className="text-[11px] text-blue-700 mt-0.5">
                90-100: VERIFIED &bull; 70-89: LIKELY VERIFIED &bull; &lt;70: UNVERIFIED
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Defaults
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Maps match */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Maps / Places Match</span>
                <span className="font-bold text-blue-600">+{current.mapsMatch} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={current.mapsMatch}
                onChange={(e) => handleChange('mapsMatch', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-400">Validated against OpenStreetMap / Places geodatabases</span>
            </div>

            {/* Official website found */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Official Website Found</span>
                <span className="font-bold text-blue-600">+{current.websiteFound} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={current.websiteFound}
                onChange={(e) => handleChange('websiteFound', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-400">Valid HTTP domain registered for organization</span>
            </div>

            {/* Address match */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Address Locality Match</span>
                <span className="font-bold text-blue-600">+{current.addressMatch} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={current.addressMatch}
                onChange={(e) => handleChange('addressMatch', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-400">Physical street and locality within target radius</span>
            </div>

            {/* Phone match */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Verified Phone Contact</span>
                <span className="font-bold text-blue-600">+{current.phoneMatch} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={current.phoneMatch}
                onChange={(e) => handleChange('phoneMatch', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-400">Valid national telecom formatted contact line</span>
            </div>

            {/* Independent source match */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Independent Source Cross-Reference</span>
                <span className="font-bold text-blue-600">+{current.independentSource} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={current.independentSource}
                onChange={(e) => handleChange('independentSource', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-400">Confirmed across secondary directory or aggregator</span>
            </div>

            {/* Registry match */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Public / Healthcare Registry Match</span>
                <span className="font-bold text-blue-600">+{current.registryMatch} pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={current.registryMatch}
                onChange={(e) => handleChange('registryMatch', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[11px] text-slate-400">Corporate ROC / State Clinical registry accreditation</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-xs"
          >
            Apply Scoring Weights
          </button>
        </div>
      </div>
    </div>
  );
};
