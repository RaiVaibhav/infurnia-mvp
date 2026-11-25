import React from 'react';
import { BOQItem } from '../types';
import { X, Download, Printer, CheckCircle, Calculator, FileSpreadsheet } from 'lucide-react';

interface BOQModalProps {
  isOpen: boolean;
  onClose: () => void;
  boq: {
    items: BOQItem[];
    totalCost: number;
    breakdown: {
      cabinetPanels: number;
      hardware: number;
      countertopAndSkirting: number;
      civilWalls: number;
    };
  };
  projectName: string;
}

export const BOQModal: React.FC<BOQModalProps> = ({ isOpen, onClose, boq, projectName }) => {
  if (!isOpen) return null;

  const categories = [
    'Carcass & Shutters',
    'Hardware & Fittings',
    'Countertops & Skirting',
    'Civil / Walls',
  ] as const;

  const handleExportCSV = () => {
    const headers = ['Category', 'Description', 'Quantity', 'Unit', 'Rate ($)', 'Amount ($)', 'Rule Notes'];
    const rows = boq.items.map(item => [
      `"${item.category}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      item.quantity,
      item.unit,
      item.rate,
      item.amount,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${projectName.replace(/\s+/g, '_')}_BOQ.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Automated Bill of Quantities & Material Take-off</h2>
              <p className="text-xs text-slate-500">
                Calculated dynamically via Infurnia Tag-Matching & Hardware Rule Engines
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50/80 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[11px] block">Cabinet Panels & Shutters</span>
            <span className="text-lg font-bold text-blue-600 font-mono mt-0.5 block">
              ${boq.breakdown.cabinetPanels.toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[11px] block">Hardware & Channels</span>
            <span className="text-lg font-bold text-pink-600 font-mono mt-0.5 block">
              ${boq.breakdown.hardware.toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[11px] block">Countertops & Skirting</span>
            <span className="text-lg font-bold text-amber-600 font-mono mt-0.5 block">
              ${boq.breakdown.countertopAndSkirting.toLocaleString()}
            </span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-300 shadow-xs">
            <span className="text-emerald-700 text-[11px] block font-semibold">Total Estimated Cost</span>
            <span className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5 block">
              ${boq.totalCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map(category => {
            const items = boq.items.filter(i => i.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>{category}</span>
                </h4>
                <div className="overflow-hidden border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-center">Unit</th>
                        <th className="p-2.5 text-right">Unit Rate</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5">Triggered Rule / Specification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                          <td className="p-2.5 text-center font-mono text-slate-700">{item.quantity}</td>
                          <td className="p-2.5 text-center text-slate-500">{item.unit}</td>
                          <td className="p-2.5 text-right font-mono text-slate-700">${item.rate}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                            ${item.amount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-500 italic font-mono">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 text-emerald-600 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Matched against active Infurnia Tag-Based Pricing Template</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
