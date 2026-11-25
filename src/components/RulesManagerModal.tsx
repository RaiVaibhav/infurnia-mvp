import React from 'react';
import { DEFAULT_PRICING_RULES, DEFAULT_TAGS } from '../engine/rulesEngine';
import { X, Layers, Tag as TagIcon, Sparkles, BookOpen } from 'lucide-react';

interface RulesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesManagerModal: React.FC<RulesManagerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Infurnia Tag & Rules Engine Architecture</h2>
              <p className="text-xs text-slate-500">
                How Infurnia automates pricing, geometry validation, and hardware selection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-700">
          {/* Explanation Banner */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start space-x-3">
            <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-blue-900">Why Infurnia Uses Tag-Based Rules</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                In modular interior manufacturing, a cabinet cannot be priced simply by SKU. The exact price depends on the combined choice of 
                <strong> Core Board Substrate</strong>, <strong>External Shutter Finish</strong>, and <strong>Internal Liner</strong>. 
                Infurnia matches these tags in real-time, completely replacing hardcoded spreadsheets.
              </p>
            </div>
          </div>

          {/* Section 1: Active Pricing Rule Templates */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Tag-Based Panel Pricing Matrix (Active Rules)</span>
            </h4>
            <div className="overflow-hidden border border-slate-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 text-[11px] border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-2.5">Rule Name</th>
                    <th className="p-2.5">Core Tag</th>
                    <th className="p-2.5">Ext Finish Tag</th>
                    <th className="p-2.5">Int Finish Tag</th>
                    <th className="p-2.5 text-right">Sq.Ft Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {DEFAULT_PRICING_RULES.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-medium text-slate-900">{rule.name}</td>
                      <td className="p-2.5 font-mono text-[11px] text-emerald-600 font-semibold">{rule.coreTag}</td>
                      <td className="p-2.5 font-mono text-[11px] text-blue-600 font-semibold">{rule.extFinishTag}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">{rule.intFinishTag}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-amber-600">
                        ${rule.ratePerSqFt}/sq.ft
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Hardware Calculation Rules */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <TagIcon className="w-4 h-4 text-pink-600" />
              <span>Geometry-Driven Hardware Rules</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-semibold text-pink-700 block">Concealed Hinge Rule</span>
                <p className="text-[11px] text-slate-600">
                  Evaluates vertical shutter height in millimeters:
                </p>
                <ul className="text-[11px] text-slate-700 list-disc list-inside space-y-0.5">
                  <li>Height &lt; 900mm: <strong>2 hinges / door</strong></li>
                  <li>Height 900mm – 1400mm: <strong>3 hinges / door</strong></li>
                  <li>Height 1400mm – 1800mm: <strong>4 hinges / door</strong></li>
                  <li>Height &ge; 1800mm: <strong>5 hinges / door</strong></li>
                </ul>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-semibold text-blue-700 block">Drawer Runner Rule</span>
                <p className="text-[11px] text-slate-600">
                  Evaluates cabinet depth in millimeters:
                </p>
                <ul className="text-[11px] text-slate-700 list-disc list-inside space-y-0.5">
                  <li>Depth &ge; 500mm: <strong>500mm Soft-close Tandembox</strong></li>
                  <li>Depth &lt; 500mm: <strong>450mm Soft-close Tandembox</strong></li>
                  <li>Automatically injects 3 runner pairs for 3-tier drawer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
