'use client';
import { useState, useEffect } from 'react';
import { Activity, Download, Crown, Plus, Trash2, Sparkles, User, Send } from 'lucide-react';

interface MedicalTest {
  id: string;
  name: string;
  price: number;
  category: string;
}

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_lab_free_limit';

// Prices Mumbai ke hisaab se (₹). Apne lab ke rate ke hisaab se yahin badal sakte hain.
const MASTER_DISEASE_TESTS = [
  // --- Fever & Viral (bukhar aur infection) ---
  { name: 'Dengue NS1 Antigen Test', price: 1000, category: 'Fever & Viral' },
  { name: 'Malaria Parasite Smear (MP)', price: 500, category: 'Fever & Viral' },
  { name: 'Typhoid Widal Blood Test', price: 600, category: 'Fever & Viral' },
  { name: 'Complete Blood Count (CBC)', price: 1000, category: 'Fever & Viral' },

  // --- Diabetes & Sugar ---
  { name: 'HbA1c (3 Months Sugar Average)', price: 900, category: 'Diabetes Tracker' },
  { name: 'Blood Sugar (Fasting & PP)', price: 400, category: 'Diabetes Tracker' },

  // --- Vital Organs (heart, liver, kidney) ---
  { name: 'Lipid Profile (Cholesterol)', price: 1200, category: 'Organ Care' },
  { name: 'Liver Function Test (LFT)', price: 1300, category: 'Organ Care' },
  { name: 'Kidney Function Test (KFT)', price: 1300, category: 'Organ Care' },
  { name: 'Thyroid Profile (T3, T4, TSH)', price: 1000, category: 'Organ Care' },

  // --- Vitamins & Deficiency ---
  { name: 'Vitamin D3 (Bone Health)', price: 1500, category: 'Vitamins' },
  { name: 'Vitamin B12 (Nerve Energy)', price: 1100, category: 'Vitamins' },

  // --- Full Body Packages ---
  { name: 'Full Body Health Package', price: 3500, category: 'Health Packages' },
];

const CATEGORIES = [
  'Fever & Viral',
  'Diabetes Tracker',
  'Organ Care',
  'Vitamins',
  'Health Packages',
];

export default function LuxuryLabSaaS() {
  const [labName, setLabName] = useState('');
  const [patientName, setCustomerName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState(''); // patient ka WhatsApp number
  const [referredBy, setReferredBy] = useState('Self / Dr. Internal');

  const [customTestName, setCustomTestName] = useState('');
  const [customTestPrice, setCustomTestPrice] = useState('');

  const [selectedTests, setSelectedTests] = useState<MedicalTest[]>([]);
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
      // localStorage unavailable - ignore
    }
  }, []);

  const handleAddCustomTest = () => {
    if (!customTestName.trim() || !customTestPrice) return;

    const newItem: MedicalTest = {
      id: Date.now().toString(),
      name: customTestName.trim(),
      price: Number(customTestPrice),
      category: 'Special Custom',
    };

    setSelectedTests([...selectedTests, newItem]);
    setCustomTestName('');
    setCustomTestPrice('');
  };

  const handleAddDiseaseTest = (item: (typeof MASTER_DISEASE_TESTS)[number]) => {
    const exists = selectedTests.some((t) => t.name === item.name);
    if (exists) return;

    const newItem: MedicalTest = {
      id: Math.random().toString(),
      name: item.name,
      price: item.price,
      category: item.category,
    };
    setSelectedTests((prev) => [...prev, newItem]);
  };

  const handleRemoveTest = (id: string) => {
    setSelectedTests(selectedTests.filter((item) => item.id !== id));
  };

  const totalBill = selectedTests.reduce((total, item) => total + item.price, 0);
  const freeLeft = Math.max(FREE_LIMIT - usageCount, 0);

  // WhatsApp link banane ka logic (wa.me link, message properly encoded)
  const buildWhatsappUrl = () => {
    const lines: string[] = [];
    lines.push('🔬 *DIGITAL MEDICAL INVOICE* 🔬');
    lines.push('');
    if (labName.trim()) lines.push(`*Lab Name:* ${labName.trim()}`);
    lines.push(`*Date:* ${today}`);
    lines.push('-----------------------------------');
    lines.push(`*Patient Name:* ${patientName}`);
    lines.push(`*Age/Gender:* ${patientAge}`);
    lines.push(`*Referred By:* ${referredBy}`);
    lines.push('-----------------------------------');
    lines.push('*Prescribed Tests:*');
    selectedTests.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.name} (₹${item.price})`);
    });
    lines.push('-----------------------------------');
    lines.push(`*TOTAL PAYABLE AMOUNT:* ₹${totalBill}`);
    lines.push('');
    lines.push(
      '*Status:* Payment Received. Your blood report will be shared on this number within 24 hours. Thank you!'
    );

    // Indian numbers ke liye '91' prefix
    const formattedPhone = patientPhone.startsWith('91') && patientPhone.length > 10
      ? patientPhone
      : `91${patientPhone}`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // Patient ke WhatsApp par seedha digital bill bhejna
  const handleSendBillOnWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0 || !patientName || patientPhone.length !== 10) return;

    if (usageCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const newCount = usageCount + 1;
    setUsageCount(newCount);
    try {
      localStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch {
      // ignore
    }

    setBillGenerated(true);
    window.open(buildWhatsappUrl(), '_blank');
  };

  // Dobara bhejna (free count kam nahi hoga)
  const handleResend = () => {
    window.open(buildWhatsappUrl(), '_blank');
  };

  const handleDownload = () => {
    // Print dialog -> "Save as PDF"
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center font-sans">
      {/* Print layout CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #lab-invoice-slip, #lab-invoice-slip * { visibility: visible !important; }
          #lab-invoice-slip { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================== */}
        {/* LEFT SIDE: PATIENT ENTRY COUNTER                           */}
        {/* ========================================================== */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-md border border-gray-100 text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800">Diagnostic Bill Generator</h2>
                <p className="text-xs text-gray-500">
                  Fast category billing with direct Patient WhatsApp sync
                </p>
              </div>
            </div>

            <form id="lab-form" onSubmit={handleSendBillOnWhatsApp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Diagnostic Lab Name (Optional)
                </label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g. Sai Diagnostic Centre"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none text-gray-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kapil Upadhyay"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 text-gray-800 font-semibold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Age / Gender
                  </label>
                  <input
                    type="text"
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 23 / Male"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 text-gray-800 font-semibold"
                  />
                </div>
                {/* Patient ka WhatsApp number */}
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
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-Digit Mobile"
                    className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs outline-none text-gray-800 font-black focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Referred By (Doctor Name)
                </label>
                <input
                  type="text"
                  required
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 text-gray-800 font-medium"
                />
              </div>

              {/* DISEASE-WISE HIGH-SPEED CATALOG */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200">
                <h3 className="text-[11px] font-black text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-blue-500 text-blue-500" /> Disease Test Catalog
                  (Click to Auto Add)
                </h3>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {CATEGORIES.map((category) => {
                    const matchedTests = MASTER_DISEASE_TESTS.filter((t) => t.category === category);
                    return (
                      <div key={category}>
                        <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase block mb-1">
                          {category}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedTests.map((pItem, idx) => {
                            const added = selectedTests.some((t) => t.name === pItem.name);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleAddDiseaseTest(pItem)}
                                disabled={added}
                                className={`text-[10px] font-bold py-1.5 px-2.5 rounded-xl border transition-all shadow-sm flex items-center gap-1 ${
                                  added
                                    ? 'bg-blue-600 text-white border-blue-600 opacity-60 cursor-not-allowed'
                                    : 'bg-white hover:bg-blue-100 active:scale-95 text-gray-700 border-gray-200'
                                }`}
                              >
                                🧪 {pItem.name} (₹{pItem.price})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>

            {/* Custom test input (form ke bahar, taaki Enter dabane par bill na bane) */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-200 mt-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Or Add Unlisted Special Test Charge
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Custom Test Name"
                  value={customTestName}
                  onChange={(e) => setCustomTestName(e.target.value)}
                  className="col-span-2 p-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                />
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="₹ Price"
                    value={customTestPrice}
                    onChange={(e) => setCustomTestPrice(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTest}
                    className="px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                    aria-label="Add custom test"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Selected tests list */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden mt-3">
              <div className="bg-gray-50 px-3 py-2 text-[11px] font-black text-gray-600 uppercase tracking-wider flex justify-between">
                <span>Selected Tests</span>
                <span>Price</span>
              </div>
              <div className="max-h-[150px] overflow-y-auto divide-y divide-gray-100">
                {selectedTests.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Koi test select nahi hai. Upar se test add karein.
                  </p>
                )}
                {selectedTests.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 font-medium"
                  >
                    <span className="pr-2">{item.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-gray-900">₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(item.id)}
                        className="text-gray-400 hover:text-rose-600"
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

          {/* Total + Send button */}
          <div className="mt-4">
            <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-3">
              <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider">
                Total Bill
              </span>
              <span className="text-lg font-black text-blue-700">₹{totalBill}</span>
            </div>
            <button
              type="submit"
              form="lab-form"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Bill on WhatsApp ({freeLeft} free left)
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT SIDE: BILL PREVIEW                                   */}
        {/* ========================================================== */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-md border border-gray-200 flex flex-col justify-between min-h-[420px]">
          {billGenerated ? (
            <>
              <div
                id="lab-invoice-slip"
                className="border-4 border-double border-blue-900/20 p-5 rounded-2xl bg-slate-50/50 flex-1 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="text-center pb-3 border-b-2 border-blue-100">
                    {labName.trim() && (
                      <h3 className="text-base font-black text-blue-900 tracking-wider uppercase flex items-center justify-center gap-1.5">
                        <Activity className="w-5 h-5 text-blue-600" /> {labName.trim()}
                      </h3>
                    )}
                    <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-0.5">
                      Pathology Test Bill
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs font-semibold text-gray-600 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-500" /> Patient:{' '}
                      <span className="text-gray-900 font-black">{patientName}</span>
                    </div>
                    <div className="text-right">
                      Date: <span className="text-gray-900 font-black">{today}</span>
                    </div>
                    <div>
                      Age / Gender: <span className="text-gray-900 font-black">{patientAge}</span>
                    </div>
                    <div className="text-right">
                      Referred By: <span className="text-gray-900 font-black">{referredBy}</span>
                    </div>
                  </div>

                  {/* Tests table */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-200">
                      <span>Test Name</span>
                      <span>Charges</span>
                    </div>
                    <div className="space-y-2 mt-2 text-xs font-medium text-gray-700">
                      {selectedTests.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between border-b border-gray-100 pb-1"
                        >
                          <span className="pr-2">🧪 {item.name}</span>
                          <span className="font-black text-gray-900 shrink-0">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-100">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-blue-700">₹{totalBill}</span>
                  </div>
                  <p className="text-center text-[10px] text-gray-400 font-semibold mt-3">
                    Reports will be ready as per schedule. Get well soon! 💙
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Resend on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download / Print Bill (PDF)
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                  Print dialog mein &quot;Save as PDF&quot; select karein
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10">
              <Activity className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">Bill yahan dikhega</p>
              <p className="text-xs mt-1">
                Patient details aur test select karke &quot;Send Bill on WhatsApp&quot; dabayein
              </p>
            </div>
          )}
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
              Aap {FREE_LIMIT} free bills bana chuke hain. Unlimited bills ke liye Pro plan le lein.
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
