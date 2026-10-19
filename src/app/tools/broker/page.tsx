'use client';
import { useState, useEffect } from 'react';
import { Building, Download, Crown, Send, Landmark, Percent } from 'lucide-react';

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_broker_free_limit';

// Home loan assumptions (indicative)
const DOWN_PAYMENT_PERCENT = 20;
const LOAN_PERCENT = 80;
const ANNUAL_INTEREST_RATE = 8.5; // % p.a.
const TENURE_YEARS = 20;

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function PropertyBrokerWizard() {
  // Agent & Client Input States
  const [agencyName, setAgencyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyPrice, setPropertyPrice] = useState(''); // kul keemat (₹)
  const [commissionRate, setCommissionRate] = useState('2'); // default 2% brokerage

  // Business & Paywall States
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [slipGenerated, setSlipGenerated] = useState(false);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN'));
    try {
      const savedCount = localStorage.getItem(STORAGE_KEY);
      if (savedCount) setUsageCount(parseInt(savedCount, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  // --- Real Estate Mathematical Logic ---
  const totalPrice = Number(propertyPrice) || 0;

  // 1. Downpayment (20%) aur Loan amount (80%)
  const downPayment = Math.round(totalPrice * (DOWN_PAYMENT_PERCENT / 100));
  const loanAmount = Math.round(totalPrice * (LOAN_PERCENT / 100));

  // 2. Home loan EMI (8.5% p.a., 20 years)
  const monthlyRate = ANNUAL_INTEREST_RATE / 100 / 12;
  const totalMonths = TENURE_YEARS * 12;

  let monthlyEMI = 0;
  if (loanAmount > 0) {
    monthlyEMI = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  }

  // 3. Broker ka net commission
  const ratePercent = Number(commissionRate) || 0;
  const netCommission = Math.round(totalPrice * (ratePercent / 100));

  const isFormValid = totalPrice > 0 && !!clientName && clientPhone.length === 10 && !!propertyTitle;

  // WhatsApp link (wa.me, message properly encoded)
  const buildWhatsappUrl = () => {
    const lines: string[] = [];
    lines.push('🏢 *PROPERTY ESTIMATE & EMI SUMMARY* 🏢');
    lines.push('');
    if (agencyName.trim()) lines.push(`*Agency:* ${agencyName.trim()}`);
    lines.push(`*Date:* ${today}`);
    lines.push('-----------------------------------');
    lines.push(`*Client Name:* ${clientName}`);
    lines.push(`*Property:* ${propertyTitle}`);
    lines.push(`*Total Deal Value:* *${inr(totalPrice)}*`);
    lines.push('-----------------------------------');
    lines.push(`*FINANCIAL BREAKDOWN (${ANNUAL_INTEREST_RATE}% for ${TENURE_YEARS} Yrs):*`);
    lines.push(`- Min Downpayment (${DOWN_PAYMENT_PERCENT}%): ${inr(downPayment)}`);
    lines.push(`- Estimated Home Loan (${LOAN_PERCENT}%): ${inr(loanAmount)}`);
    lines.push(`- *Estimated Monthly EMI:* *${inr(monthlyEMI)}/month*`);
    lines.push('-----------------------------------');
    lines.push(`*Agency Brokerage Charge (${commissionRate}%):* ${inr(netCommission)}`);
    lines.push('');
    lines.push('_Note: EMI is indicative. Loan approval is subject to bank guidelines._');

    // Indian numbers ke liye '91' prefix
    const formattedPhone =
      clientPhone.startsWith('91') && clientPhone.length > 10 ? clientPhone : `91${clientPhone}`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // Client ke WhatsApp par seedha property estimate + EMI slip bhejna
  const handleSendSlipOnWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (usageCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const newCount = usageCount + 1;
    setUsageCount(newCount);
    try {
      localStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch {
      /* ignore */
    }

    setSlipGenerated(true);
    window.open(buildWhatsappUrl(), '_blank');
  };

  // Dobara bhejna (free count kam nahi hoga)
  const handleResend = () => {
    if (!isFormValid) return;
    window.open(buildWhatsappUrl(), '_blank');
  };

  const handleDownload = () => {
    // Print dialog -> "Save as PDF"
    window.print();
  };

  const freeLeft = Math.max(FREE_LIMIT - usageCount, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center font-sans">
      {/* Print styles: sirf slip print hogi */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #broker-slip, #broker-slip * { visibility: visible !important; }
          #broker-slip { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* ========================================================== */}
        {/* LEFT PANEL: BROKER DATA ENTRY SHEET                        */}
        {/* ========================================================== */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl shadow-md border border-gray-100 text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Property EMI & Brokerage Wizard</h2>
              <p className="text-xs text-gray-500">Generate real estate financial summaries instantly</p>
            </div>
          </div>

          <form onSubmit={handleSendSlipOnWhatsApp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Real Estate Agency Name (Optional)
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Sai Realty Services"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none text-gray-800 font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rajesh Mehta"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 text-gray-800 font-medium"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  WhatsApp No.
                </label>
                <input
                  type="tel"
                  required
                  minLength={10}
                  maxLength={10}
                  inputMode="numeric"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-Digit Mobile"
                  className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 font-black"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Property Title/Config
                </label>
                <input
                  type="text"
                  required
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  placeholder="e.g. 2BHK Flat Bandra"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 text-gray-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Total Property Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(e.target.value)}
                  placeholder="e.g. 7500000"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none text-gray-800 font-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Brokerage Commission Rate
                </label>
                <select
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-bold outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="1">1% Commission Slip</option>
                  <option value="2">2% Standard Brokerage (Recommended)</option>
                  <option value="3">3% Premium Commercial Deal</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-slate-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-3.5 px-4 rounded-xl transition-all shadow-md text-sm mt-4 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Done & Send Estimate on WhatsApp ({freeLeft} left)
            </button>
          </form>
        </div>

        {/* ========================================================== */}
        {/* RIGHT PANEL: LIVE AGENT MONITOR SUITE                      */}
        {/* ========================================================== */}
        <div className="md:col-span-5 flex flex-col justify-between min-h-[420px]">
          <div
            id="broker-slip"
            className="border-2 border-slate-900/20 p-5 rounded-2xl bg-stone-50/50 flex-1 flex flex-col justify-between text-left"
          >
            <div>
              <div className="text-center pb-3 border-b-2 border-dashed border-gray-200">
                {agencyName.trim() && (
                  <h3 className="text-base font-black text-slate-900 tracking-wider uppercase flex items-center justify-center gap-1.5">
                    <Landmark className="w-5 h-5 text-slate-700" /> {agencyName.trim()}
                  </h3>
                )}
                <span className="text-[9px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 inline-block">
                  AGENT REAL-TIME SLIP
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-[10px] font-bold text-gray-500 border-b border-gray-200/60 pb-3 uppercase tracking-wider">
                <div>
                  Client:{' '}
                  <span className="text-gray-900 font-extrabold">{clientName || 'Waiting...'}</span>
                </div>
                <div className="text-right">
                  WhatsApp:{' '}
                  <span className="text-amber-700 font-black">
                    {clientPhone ? `+91 ${clientPhone}` : 'Required 📱'}
                  </span>
                </div>
                <div>
                  Property:{' '}
                  <span className="text-gray-900 font-extrabold">{propertyTitle || '-'}</span>
                </div>
                <div className="text-right">
                  Date: <span className="text-gray-900 font-extrabold">{today}</span>
                </div>
              </div>

              {/* Live Mortgage Math breakdowns */}
              <div className="mt-4 space-y-2 text-xs font-bold text-gray-700">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span>Total Deal Value</span>
                  <span className="font-black text-gray-900">{inr(totalPrice)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span>Min Downpayment ({DOWN_PAYMENT_PERCENT}%)</span>
                  <span className="font-black text-gray-900">{inr(downPayment)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span>Estimated Home Loan ({LOAN_PERCENT}%)</span>
                  <span className="font-black text-gray-900">{inr(loanAmount)}</span>
                </div>
                <p className="text-[9px] text-gray-400 font-semibold">
                  EMI basis: {ANNUAL_INTEREST_RATE}% p.a. for {TENURE_YEARS} years
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Estimated Monthly EMI
                </span>
                <span className="text-xl font-black text-slate-900">{inr(monthlyEMI)}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Percent className="w-3 h-3" /> Brokerage ({commissionRate}%)
                </span>
                <span className="text-lg font-black text-emerald-700">{inr(netCommission)}</span>
              </div>
              <p className="text-center text-[9px] text-gray-400 font-semibold">
                EMI is indicative. Loan approval is subject to bank guidelines.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {slipGenerated && (
              <button
                type="button"
                onClick={handleResend}
                disabled={!isFormValid}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Resend on WhatsApp
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download / Print Slip (PDF)
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Print dialog mein &quot;Save as PDF&quot; select karein
            </p>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Crown className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-gray-800">Free limit khatam ho gayi</h3>
            <p className="text-sm text-gray-500 mt-2">
              Aap {FREE_LIMIT} free estimates bana chuke hain. Unlimited estimates ke liye Pro plan le
              lein.
            </p>
            <button
              type="button"
              onClick={() => {
                // TODO: yahan apna payment link / Razorpay checkout lagayein
                window.open('https://your-payment-link.com', '_blank');
              }}
              className="w-full mt-5 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" /> Upgrade to Pro
            </button>
            <button
              type="button"
              onClick={() => setShowPaywall(false)}
              className="w-full mt-2 text-gray-500 hover:text-gray-700 font-semibold py-2 text-sm"
            >
              Baad mein
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
