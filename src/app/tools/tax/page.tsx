
'use client';

import { useState, useEffect } from 'react';
import { Calculator, Crown, Scale, FileText, Download, RefreshCw } from 'lucide-react';

export default function TaxLateFeeWizard() {
  const [firmName, setFirmName] = useState('');
  const [clientName, setClientName] = useState('');
  const [delayDays, setDelayDays] = useState('');
  const [taxType, setTaxType] = useState('GSTR-3B (Regular)');
  const [taxLiability, setTaxLiability] = useState('Yes');

  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [slipGenerated, setSlipGenerated] = useState(false);

  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('biztools_tax_free_limit');
      if (savedCount) {
        const parsed = Number.parseInt(savedCount, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          setUsageCount(parsed);
        }
      }
    } catch {
      // Continue if browser storage is unavailable.
    }
  }, []);

  const days = Math.max(0, Number(delayDays) || 0);
  const isIncomeTax = taxType === 'Income Tax (ITR-1/ITR-4)';

  let dailyRate = 0;
  let maxCap = 0;

  if (taxType === 'GSTR-3B (Regular)' || taxType === 'GSTR-1') {
    if (taxLiability === 'Yes') {
      dailyRate = 50;
      maxCap = 5000;
    } else {
      dailyRate = 20;
      maxCap = 500;
    }
  } else if (taxType === 'GSTR-3B (Composition)') {
    dailyRate = taxLiability === 'Yes' ? 20 : 10;
    maxCap = taxLiability === 'Yes' ? 2000 : 500;
  }

  // Simplified estimate only. Actual statutory fees depend on the
  // applicable return, period, taxpayer and current law.
  const calculatedLateFee = isIncomeTax
    ? 0
    : Math.min(days * dailyRate, maxCap);

  const estimatedInterest =
    !isIncomeTax && taxLiability === 'Yes'
      ? Math.round(calculatedLateFee * 0.18 * (days / 365))
      : 0;

  const totalPenalty = calculatedLateFee + estimatedInterest;

  const handleCalculateTax = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (usageCount >= 5) {
      setShowPaywall(true);
      return;
    }

    const newCount = usageCount + 1;
    setUsageCount(newCount);

    try {
      localStorage.setItem('biztools_tax_free_limit', newCount.toString());
    } catch {
      // Calculation can still proceed if storage is unavailable.
    }

    setSlipGenerated(true);
  };

  const handleReset = () => {
    setClientName('');
    setDelayDays('');
    setTaxType('GSTR-3B (Regular)');
    setTaxLiability('Yes');
    setSlipGenerated(false);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-sans">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #tax-slip, #tax-slip * { visibility: visible !important; }
          #tax-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
        }
      `}</style>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left Side: Input Dashboard */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
                <Calculator className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-black text-gray-800">
                  Tax Late Fee Estimator
                </h2>
                <p className="text-xs text-gray-500">
                  Calculate GST &amp; ITR penalties instantly
                </p>
              </div>
            </div>

            <form onSubmit={handleCalculateTax} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  CA Firm / Advocate Name
                </label>
                <input
                  type="text"
                  required
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none text-gray-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Client / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Ramesh Traders"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Total Days of Delay
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={delayDays}
                    onChange={(e) => setDelayDays(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tax / Return Type
                  </label>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium outline-none"
                  >
                    <option value="GSTR-3B (Regular)">
                      GST GSTR-3B (Regular)
                    </option>
                    <option value="GSTR-1">GST GSTR-1 (Sales)</option>
                    <option value="GSTR-3B (Composition)">
                      GST GSTR-3B (Comp)
                    </option>
                    <option value="Income Tax (ITR-1/ITR-4)">
                      Income Tax (ITR-1/4)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Any Tax Liability?
                  </label>
                  <select
                    value={taxLiability}
                    onChange={(e) => setTaxLiability(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium outline-none"
                  >
                    <option value="Yes">Yes (Taxable Return)</option>
                    <option value="No">No (NIL Return)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm mt-4 flex items-center justify-center gap-2"
              >
                📊 Calculate Late Fee Sum ({Math.max(0, 5 - usageCount)} free left)
              </button>

              <p className="text-xs text-gray-400 text-center">
                Estimates are indicative and should be verified against
                applicable tax rules.
              </p>
            </form>
          </div>
        </div>

        {/* Right Side: Penalty Slip Preview */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between min-h-[380px]">
          {slipGenerated ? (
            <>
              <div
                id="tax-slip"
                className="border-4 border-double border-slate-900/20 p-5 rounded-xl bg-neutral-50 flex-1 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="text-center pb-3 border-b-2 border-slate-900/20">
                    <h3 className="text-base font-black text-slate-900 tracking-wider uppercase flex items-center justify-center gap-1.5 break-words">
                      <Scale className="w-4 h-4 shrink-0" />
                      {firmName || 'TAX CONSULTANT'}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-0.5">
                      Late Fee Estimation Slip
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs font-semibold text-gray-600 border-b border-gray-100 pb-3 uppercase tracking-wider">
                    <div className="break-words">
                      Client Name:{' '}
                      <span className="text-slate-900 font-black">
                        {clientName}
                      </span>
                    </div>

                    <div className="sm:text-right">
                      Delay:{' '}
                      <span className="text-slate-900 font-black">
                        {days} Days
                      </span>
                    </div>

                    <div className="break-words">
                      Return Type:{' '}
                      <span className="text-slate-900 font-black">
                        {taxType}
                      </span>
                    </div>

                    <div className="sm:text-right">
                      Date:{' '}
                      <span className="text-slate-900 font-black">
                        {new Date().toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs font-medium text-gray-700">
                    <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                      <span>Estimated Late Fee</span>
                      <span className="font-black text-gray-900">
                        ₹{calculatedLateFee.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                      <span>Illustrative Interest</span>
                      <span className="font-black text-gray-900">
                        ₹{estimatedInterest.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {isIncomeTax && (
                    <p className="mt-3 text-xs text-amber-700">
                      ITR late-filing fees are not calculated by this
                      simplified GST estimator. Check the applicable
                      provisions and assessment year.
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-gray-200">
                  <div className="w-full py-2 px-2 rounded-lg text-center text-[9px] font-black tracking-wider border uppercase bg-amber-50 text-amber-800 border-amber-200 mb-3">
                    Indicative estimate only — verify current statutory rules
                    before payment or filing.
                  </div>

                  <div className="flex justify-between items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">
                        Estimated Total
                      </span>
                      <span className="text-xs text-slate-500 font-semibold block uppercase">
                        Indicative amount
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-rose-600">
                        ₹{totalPenalty.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 print:hidden">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Calculation
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center p-6">
              <div>
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-700">
                  Your Tax Slip
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Fill in the details and calculate to generate your estimate.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Free Usage Paywall */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <Crown className="mx-auto mb-3 h-10 w-10 text-amber-500" />

            <h2 className="text-xl font-black text-gray-900">
              Free Limit Reached
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              You have used all 5 free calculations.
            </p>

            <button
              type="button"
              onClick={() => setShowPaywall(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
