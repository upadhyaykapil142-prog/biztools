'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Download, Crown, Send, Heart, Plus, Trash2 } from 'lucide-react';

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_event_free_limit';

interface WeddingExpense {
  id: string;
  name: string;
  cost: number;
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// 18 MOST DEMANDING WEDDING EXPENSES (planner ko kuch type nahi karna padega!)
const POPULAR_WEDDING_EXPENSES = [
  // --- Main Venue & Food ---
  { name: 'Luxury Banquet Hall & Venue', cost: 150000 },
  { name: 'Premium Catering (Per Plate Service)', cost: 120000 },
  { name: 'Destination Resort Accommodation', cost: 200000 },

  // --- Decoration & Theme ---
  { name: 'Grand Stage Flower Decoration', cost: 75000 },
  { name: 'Luxury Mandap & Entry Walkway Setup', cost: 45000 },
  { name: 'Haldi & Mehendi Colorful Theme Decor', cost: 25000 },

  // --- Media & Entertainment ---
  { name: 'Cinematic Photography & Drone Team', cost: 60000 },
  { name: 'Pre-Wedding Shoot & Video Teaser', cost: 30000 },
  { name: 'Professional DJ, Sound & LED Lights', cost: 35000 },
  { name: 'Live Anchor / Anchor & Dance Troupe', cost: 25000 },
  { name: 'Sangeet Choreographer Team', cost: 15000 },

  // --- Bride & Groom Luxury ---
  { name: 'Bridal Luxury Makeover & Mehendi', cost: 25000 },
  { name: 'Groom Shave & Pre-Grooming Package', cost: 5000 },
  { name: 'Luxury Vintage Groom Entry Car/Ghodi', cost: 12000 },

  // --- Gifts & Invites ---
  { name: 'Designer Invitation Cards & Digital Invites', cost: 15000 },
  { name: 'Return Gifts & Premium Sweet Boxes', cost: 30000 },

  // --- Logistics & Management ---
  { name: 'Guest Transport & Premium Bus Rental', cost: 20000 },
  { name: 'Event Management Team Support Fee', cost: 40000 },
];

export default function WeddingBudgetWizard() {
  const [plannerName, setPlannerName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('');

  const [customExpenseName, setCustomExpenseName] = useState('');
  const [customExpenseCost, setCustomExpenseCost] = useState('');

  // Starting empty to let user select from the grid
  const [selectedExpenses, setSelectedExpenses] = useState<WeddingExpense[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
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

  const handleAddPopularExpense = (item: { name: string; cost: number }) => {
    const exists = selectedExpenses.some((e) => e.name === item.name);
    if (exists) return;

    const newItem: WeddingExpense = {
      id: Math.random().toString(),
      name: item.name,
      cost: item.cost,
    };
    setSelectedExpenses((prev) => [...prev, newItem]);
  };

  // Custom expense (alag chhota form, isliye Enter dabane par sirf item add hota hai)
  const handleAddCustomExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExpenseName.trim() || !customExpenseCost) return;

    const newItem: WeddingExpense = {
      id: Date.now().toString(),
      name: customExpenseName.trim(),
      cost: Number(customExpenseCost),
    };

    setSelectedExpenses([...selectedExpenses, newItem]);
    setCustomExpenseName('');
    setCustomExpenseCost('');
  };

  const handleRemoveExpense = (id: string) => {
    setSelectedExpenses(selectedExpenses.filter((item) => item.id !== id));
  };

  const totalBudget = selectedExpenses.reduce((total, item) => total + item.cost, 0);
  const isFormValid = selectedExpenses.length > 0 && !!clientName && clientPhone.length === 10;

  // WhatsApp link (wa.me, message properly encoded)
  const buildWhatsappUrl = () => {
    const lines: string[] = [];
    lines.push('🎪 *WEDDING BUDGET & EVENT ESTIMATE* 🎪');
    lines.push('');
    if (plannerName.trim()) lines.push(`*Planner:* ${plannerName.trim()}`);
    lines.push(`*Event Date:* ${eventDate || 'TBD'}`);
    lines.push('-----------------------------------');
    lines.push(`*Client Name:* ${clientName}`);
    lines.push('-----------------------------------');
    lines.push('*Estimated Event Expenses:*');
    selectedExpenses.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.name} (${inr(item.cost)})`);
    });
    lines.push('-----------------------------------');
    lines.push(`*TOTAL ESTIMATED BUDGET:* *${inr(totalBudget)}*`);
    lines.push('');
    lines.push('_Note: Prices are dynamic based on final guest count bookings._');
    lines.push('_Powered by BizTools.in_');

    // Indian numbers ke liye '91' prefix
    const formattedPhone =
      clientPhone.startsWith('91') && clientPhone.length > 10 ? clientPhone : `91${clientPhone}`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleSendBudgetOnWhatsApp = (e: React.FormEvent) => {
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

    setBillGenerated(true);
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
      {/* Print styles: sirf monitor/estimate print hoga */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #wedding-monitor, #wedding-monitor * { visibility: visible !important; }
          #wedding-monitor { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================== */}
        {/* LEFT PANEL: EVENT DATA CREATOR AREA                        */}
        {/* ========================================================== */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-md border border-gray-100 text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md">
                <Heart className="w-5 h-5 fill-white text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800">Wedding Budget Tracker</h2>
                <p className="text-xs text-gray-500">
                  Plan marriage functions and send direct quotes on WhatsApp
                </p>
              </div>
            </div>

            <form id="wedding-form" onSubmit={handleSendBudgetOnWhatsApp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Event Organizer Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={plannerName}
                  onChange={(e) => setPlannerName(e.target.value)}
                  placeholder="e.g. Shubh Vivah Events"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none text-gray-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Groom/Bride Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rahul & Priya"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 font-medium"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
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
                    className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 font-black"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Wedding Date
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. 12th Dec 2026"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* 18 MASTER QUICK SELECTION EXPENSE GRID */}
              <div className="bg-rose-50/20 p-3 rounded-2xl border border-rose-100">
                <h3 className="text-[11px] font-black text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Wedding Elements
                  (Click to Quick Add)
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {POPULAR_WEDDING_EXPENSES.map((pItem, idx) => {
                    const added = selectedExpenses.some((e) => e.name === pItem.name);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPopularExpense(pItem)}
                        disabled={added}
                        className={`text-[10px] font-bold py-1.5 px-2.5 rounded-xl border transition-all shadow-sm flex items-center gap-1 ${
                          added
                            ? 'bg-rose-500 text-white border-rose-500 opacity-60 cursor-not-allowed'
                            : 'bg-white hover:bg-rose-100 active:scale-95 text-gray-700 border-gray-200'
                        }`}
                      >
                        💍 {pItem.name} ({inr(pItem.cost)})
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            {/* Custom Extras Row (alag form, main form ke bahar) */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-200 mt-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Or Add Unlisted Custom Function/Expense
              </h3>
              <form onSubmit={handleAddCustomExpense} className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Haldi Catering Extra"
                  value={customExpenseName}
                  onChange={(e) => setCustomExpenseName(e.target.value)}
                  className="col-span-2 p-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Cost"
                    value={customExpenseCost}
                    onChange={(e) => setCustomExpenseCost(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 text-center font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-rose-500 text-white font-bold p-2 rounded-xl hover:bg-rose-600 transition-colors"
                    aria-label="Add custom expense"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Total + Send button */}
          <div className="mt-4">
            <div className="flex justify-between items-center bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 mb-3">
              <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider">
                Total Estimated Budget
              </span>
              <span className="text-lg font-black text-rose-600">{inr(totalBudget)}</span>
            </div>
            <button
              type="submit"
              form="wedding-form"
              disabled={selectedExpenses.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Budget on WhatsApp ({freeLeft} free left)
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT PANEL: LIVE BUDGET MONITOR                           */}
        {/* ========================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between min-h-[420px]">
          <div
            id="wedding-monitor"
            className="border-2 border-rose-900/20 p-5 rounded-2xl bg-white flex-1 flex flex-col justify-between text-left shadow-md"
          >
            <div>
              <div className="text-center pb-3 border-b-2 border-dashed border-rose-100">
                {plannerName.trim() && (
                  <h3 className="text-base font-black text-rose-800 tracking-wider uppercase flex items-center justify-center gap-1.5">
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500" /> {plannerName.trim()}
                  </h3>
                )}
                <span className="text-[9px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 inline-block">
                  Wedding Budget Estimate
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-[11px] font-semibold text-gray-500 border-b border-gray-100 pb-3">
                <div>
                  Client:{' '}
                  <span className="text-gray-900 font-black">{clientName || 'Waiting...'}</span>
                </div>
                <div className="text-right">
                  Event Date:{' '}
                  <span className="text-gray-900 font-black">{eventDate || 'TBD'}</span>
                </div>
                <div>
                  WhatsApp:{' '}
                  <span className="text-amber-700 font-black">
                    {clientPhone ? `+91 ${clientPhone}` : 'Required 📱'}
                  </span>
                </div>
                <div className="text-right">
                  Date: <span className="text-gray-900 font-black">{today}</span>
                </div>
              </div>

              {/* Live selected expenses */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-200">
                  <span>Function / Expense</span>
                  <span>Estimate</span>
                </div>
                <div className="mt-2 max-h-[260px] overflow-y-auto space-y-2 text-xs font-medium text-gray-700">
                  {selectedExpenses.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6">
                      Left side se wedding elements add karein.
                    </p>
                  )}
                  {selectedExpenses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-gray-100 pb-1"
                    >
                      <span className="pr-2">💍 {item.name}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-gray-900">{inr(item.cost)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpense(item.id)}
                          className="no-print text-gray-400 hover:text-rose-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-100">
              <div className="flex justify-between items-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                  Total Estimated Budget
                </span>
                <span className="text-xl font-black text-rose-600">{inr(totalBudget)}</span>
              </div>
              <p className="text-center text-[10px] text-gray-400 font-semibold mt-3">
                Prices are dynamic based on final guest count bookings.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {billGenerated && (
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
              disabled={selectedExpenses.length === 0}
              className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download / Print Estimate (PDF)
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
              Aap {FREE_LIMIT} free estimates bana chuke hain. Unlimited estimates ke liye Pro plan
              le lein.
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
