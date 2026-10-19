'use client';
import { useState, useEffect } from 'react';
import { Dumbbell, Download, Crown, Send } from 'lucide-react';

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_gym_free_limit';

export default function GymReceiptWizard() {
  // Form Inputs State
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState(''); // member ka WhatsApp number
  const [amount, setAmount] = useState('');
  const [planType, setPlanType] = useState('1 Month (Monthly)');

  // Business & Paywall States
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [today, setToday] = useState('');

  // Load free limits from LocalStorage
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN'));
    try {
      const savedCount = localStorage.getItem(STORAGE_KEY);
      if (savedCount) {
        setUsageCount(parseInt(savedCount, 10) || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // WhatsApp link (wa.me, message properly encoded)
  const buildWhatsappUrl = () => {
    const lines: string[] = [];
    lines.push('🏋️ *FITNESS CLUB FEES RECEIPT* 🏋️');
    lines.push('');
    lines.push(`*Date:* ${today}`);
    lines.push('-----------------------------------');
    lines.push(`*Member Name:* ${clientName}`);
    lines.push(`*Mobile No:* +91 ${phone}`);
    lines.push(`*Plan Validity:* ${planType} Membership`);
    lines.push('-----------------------------------');
    lines.push(`*TOTAL AMOUNT PAID:* *₹${amount}*`);
    lines.push('');
    lines.push(
      '*Status:* Fees Received Successfully. Your membership is now active. Keep crushing your goals! 💪'
    );
    lines.push('');
    lines.push('_Powered by BizTools.in_');

    // Indian numbers ke liye '91' prefix
    const formattedPhone = phone.startsWith('91') && phone.length > 10 ? phone : `91${phone}`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // Member ke WhatsApp par seedha digital receipt bhejna
  const handleSendReceiptOnWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || phone.length !== 10 || !amount) return;

    // Free limit khatam hone par paywall
    if (usageCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    // Update Usage Counter
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    try {
      localStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch {
      // ignore
    }

    setReceiptGenerated(true);
    window.open(buildWhatsappUrl(), '_blank');
  };

  // Dobara bhejna (free count kam nahi hoga)
  const handleResend = () => {
    if (!clientName || phone.length !== 10 || !amount) return;
    window.open(buildWhatsappUrl(), '_blank');
  };

  const handleDownload = () => {
    // Print dialog -> "Save as PDF"
    window.print();
  };

  const freeLeft = Math.max(FREE_LIMIT - usageCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      {/* Print styles: sirf receipt print hogi */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #receipt-slip, #receipt-slip * { visibility: visible !important; }
          #receipt-slip { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ========================================================== */}
        {/* LEFT SIDE: FORM WITH WHATSAPP SEND                         */}
        {/* ========================================================== */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Free Gym Receipt Maker</h2>
              <p className="text-xs text-gray-500">
                Generate monthly fees receipts & send via WhatsApp
              </p>
            </div>
          </div>

          <form onSubmit={handleSendReceiptOnWhatsApp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Member Name
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                WhatsApp Mobile No.
              </label>
              <input
                type="tel"
                required
                minLength={10}
                maxLength={10}
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9876543210"
                className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none text-gray-800 font-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Fees Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1500"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Plan Validity
                </label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-700 font-bold"
                >
                  <option value="1 Month (Monthly)">1 Month (Monthly)</option>
                  <option value="3 Months (Quarterly)">3 Months (Quarterly)</option>
                  <option value="1 Year (Yearly)">1 Year (Yearly)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!clientName || phone.length !== 10 || !amount}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm mt-4 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Done & Send Receipt on WhatsApp ({freeLeft} left)
            </button>
          </form>
        </div>

        {/* ========================================================== */}
        {/* RIGHT SIDE: RECEIPT PREVIEW                                */}
        {/* ========================================================== */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between min-h-[350px]">
          {receiptGenerated || (clientName && amount) ? (
            <>
              <div
                id="receipt-slip"
                className="border-4 border-dashed border-gray-100 p-6 rounded-xl bg-amber-50/30 flex-1 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="text-center pb-4 border-b border-gray-200/60">
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">
                      FITNESS CLUB RECEIPT
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Mumbai, Maharashtra • India</p>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-gray-800 font-bold">{clientName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">WhatsApp No:</span>
                      <span className="text-amber-800 font-black">
                        {phone ? `+91 ${phone}` : 'Required 📱'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plan Type:</span>
                      <span className="text-gray-800 font-bold">{planType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-gray-800 font-bold">{today}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Total Paid</span>
                  <span className="text-xl font-black text-emerald-600">₹{amount || '0'}</span>
                </div>
              </div>

              <div className="mt-4 text-center space-y-2">
                <p className="text-[10px] text-gray-400">Powered by BizTools.in</p>
                {receiptGenerated && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Resend on WhatsApp
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Optional Download / Print
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <Dumbbell className="w-12 h-12 stroke-[1.5] mb-3 text-gray-300 animate-bounce" />
              <p className="text-sm font-semibold text-center">
                Fill the form to view live English receipt preview
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🛑 Premium Paywall Popup */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center border border-gray-100 shadow-2xl relative overflow-hidden">
            <div className="flex justify-center mb-4">
              <Crown className="w-8 h-8 fill-amber-400 text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Free Limit Reached! 👑</h3>
            <p className="text-sm text-gray-500 mt-2">
              Aap {FREE_LIMIT} free receipts bana chuke hain. Unlimited receipts aur WhatsApp
              sending ke liye Premium plan lein.
            </p>
            <button
              type="button"
              onClick={() => {
                // TODO: yahan apna payment link / Razorpay checkout lagayein
                window.open('https://your-payment-link.com', '_blank');
              }}
              className="w-full mt-5 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" /> Upgrade to Premium (₹399)
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
