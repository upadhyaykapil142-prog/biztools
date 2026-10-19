'use client';
import { useState, useEffect } from 'react';
import { Wrench, Download, Crown, Car, Plus, Trash2, Sparkles, Send } from 'lucide-react';

interface GarageService {
  id: string;
  name: string;
  price: number;
}

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_garage_free_limit';

const POPULAR_GARAGE_SERVICES = [
  // --- Washing & Cleaning ---
  { name: 'Foam Wash & Interior Vacuum', price: 399 },
  { name: 'Underbody Anti-Rust Wash', price: 599 },
  { name: 'Engine Deep Degreasing', price: 299 },
  { name: 'Full Body Teflon Coating', price: 2499 },
  { name: 'Luxury Ceramic Detailing', price: 9999 },
  // --- Mechanical & Oil ---
  { name: 'Synthetic Engine Oil Change', price: 1799 },
  { name: 'Oil Filter Replacement', price: 350 },
  { name: 'Coolant Top-Up Service', price: 250 },
  { name: 'Full Brake Pad Servicing', price: 450 },
  { name: 'Clutch Plates Overhaul', price: 3500 },
  // --- Electrical & AC ---
  { name: 'AC Gas Refill & Filter Clean', price: 1200 },
  { name: 'Battery Health Check & Charge', price: 150 },
  { name: 'Headlight/Taillight Bulb Change', price: 200 },
  { name: 'Full Car Wiring Scan', price: 600 },
  // --- Tyres & Suspension ---
  { name: 'Wheel Alignment & Balancing', price: 550 },
  { name: 'Tyre Rotation & Nitrogen Air', price: 199 },
  { name: 'Front Suspension Bushing', price: 1499 },
  // --- Bodywork & Others ---
  { name: 'Single Panel Denting & Painting', price: 1999 },
  { name: 'Bumper Scratch Removal', price: 899 },
  { name: 'General Periodic Maintenance', price: 999 },
];

export default function GarageJobCardBuilder() {
  const [garageName, setGarageName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(''); // customer ka WhatsApp number
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');

  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');

  const [selectedServices, setSelectedServices] = useState<GarageService[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [cardGenerated, setCardGenerated] = useState(false);
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

  const handleAddCustomService = () => {
    if (!customServiceName.trim() || !customServicePrice) return;

    const newItem: GarageService = {
      id: Date.now().toString(),
      name: customServiceName.trim(),
      price: Number(customServicePrice),
    };

    setSelectedServices([...selectedServices, newItem]);
    setCustomServiceName('');
    setCustomServicePrice('');
  };

  const handleAddPopularService = (item: { name: string; price: number }) => {
    const exists = selectedServices.some((s) => s.name === item.name);
    if (exists) return;

    const newItem: GarageService = {
      id: Math.random().toString(),
      name: item.name,
      price: item.price,
    };
    setSelectedServices((prev) => [...prev, newItem]);
  };

  const handleRemoveService = (id: string) => {
    setSelectedServices(selectedServices.filter((item) => item.id !== id));
  };

  const totalBill = selectedServices.reduce((total, item) => total + item.price, 0);
  const freeLeft = Math.max(FREE_LIMIT - usageCount, 0);

  // WhatsApp link (wa.me, message properly encoded)
  const buildWhatsappUrl = () => {
    const lines: string[] = [];
    lines.push('🚗 *VEHICLE JOB CARD & ESTIMATE* 🚗');
    lines.push('');
    if (garageName.trim()) lines.push(`*Workshop:* ${garageName.trim()}`);
    lines.push(`*Date:* ${today}`);
    lines.push('-----------------------------------');
    lines.push(`*Customer Name:* ${customerName}`);
    lines.push(`*Vehicle Model:* ${vehicleModel}`);
    lines.push(`*Vehicle Reg No:* *${vehicleNo}*`);
    lines.push('-----------------------------------');
    lines.push('*Estimated Services & Parts:*');
    selectedServices.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.name} (₹${item.price})`);
    });
    lines.push('-----------------------------------');
    lines.push(`*TOTAL ESTIMATED COST:* ₹${totalBill}`);
    lines.push('');
    lines.push(
      '*Note:* This is an estimated cost sheet. Final invoice will be shared post vehicle delivery. Thank you!'
    );

    // Indian numbers ke liye '91' prefix
    const formattedPhone =
      customerPhone.startsWith('91') && customerPhone.length > 10
        ? customerPhone
        : `91${customerPhone}`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // Estimate seedha customer ke WhatsApp par bhejna
  const handleSendJobCardOnWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      selectedServices.length === 0 ||
      !customerName ||
      customerPhone.length !== 10 ||
      !vehicleNo
    )
      return;

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

    setCardGenerated(true);
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
          #job-card-slip, #job-card-slip * { visibility: visible !important; }
          #job-card-slip { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================== */}
        {/* LEFT SIDE: OWNER INPUT PANEL                               */}
        {/* ========================================================== */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-md border border-gray-100 text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800">Digital Job-Card Builder</h2>
                <p className="text-xs text-gray-500">
                  Fast workshop logging with direct Customer WhatsApp sync
                </p>
              </div>
            </div>

            <form id="garage-form" onSubmit={handleSendJobCardOnWhatsApp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Workshop / Garage Name (Optional)
                </label>
                <input
                  type="text"
                  value={garageName}
                  onChange={(e) => setGarageName(e.target.value)}
                  placeholder="e.g. Sharma Auto Works"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none text-gray-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Anil Kapoor"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 text-gray-800 font-medium"
                  />
                </div>
                {/* Customer ka WhatsApp number */}
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
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-Digit Mobile"
                    className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs outline-none text-gray-800 font-black focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Thar / Activa"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  placeholder="e.g. MH-02-BY-1234"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none text-gray-800 font-bold uppercase tracking-widest focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* 20 QUICK ADD BUTTONS */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200">
                <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Hot Operations
                  (Click to Quick Add)
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {POPULAR_GARAGE_SERVICES.map((pItem, idx) => {
                    const added = selectedServices.some((s) => s.name === pItem.name);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPopularService(pItem)}
                        disabled={added}
                        className={`text-[10px] font-bold py-1.5 px-2.5 rounded-xl border transition-all shadow-sm flex items-center gap-1 ${
                          added
                            ? 'bg-slate-900 text-white border-slate-900 opacity-60 cursor-not-allowed'
                            : 'bg-white hover:bg-slate-200 active:scale-95 text-gray-700 border-gray-200'
                        }`}
                      >
                        🛠️ {pItem.name} (₹{pItem.price})
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            {/* Custom Row (form ke bahar, taaki Enter dabane par job card na bane) */}
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-200 mt-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Or Add Custom Service / Spare Part
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Service / Part Name"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="col-span-2 p-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 text-gray-800"
                />
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="₹ Price"
                    value={customServicePrice}
                    onChange={(e) => setCustomServicePrice(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-2.5 bg-slate-900 hover:bg-black text-white rounded-xl shadow-md"
                    aria-label="Add custom service"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Selected services list */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden mt-3">
              <div className="bg-gray-50 px-3 py-2 text-[11px] font-black text-gray-600 uppercase tracking-wider flex justify-between">
                <span>Selected Services</span>
                <span>Price</span>
              </div>
              <div className="max-h-[150px] overflow-y-auto divide-y divide-gray-100">
                {selectedServices.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Koi service select nahi hai. Upar se service add karein.
                  </p>
                )}
                {selectedServices.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 font-medium"
                  >
                    <span className="pr-2">{item.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-gray-900">₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(item.id)}
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
            <div className="flex justify-between items-center bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 mb-3">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Total Estimate
              </span>
              <span className="text-lg font-black text-slate-900">₹{totalBill}</span>
            </div>
            <button
              type="submit"
              form="garage-form"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Job Card on WhatsApp ({freeLeft} free left)
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT SIDE: JOB CARD PREVIEW                               */}
        {/* ========================================================== */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-md border border-gray-200 flex flex-col justify-between min-h-[420px]">
          {cardGenerated ? (
            <>
              <div
                id="job-card-slip"
                className="border-4 border-double border-slate-900/20 p-5 rounded-2xl bg-slate-50/50 flex-1 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="text-center pb-3 border-b-2 border-slate-200">
                    {garageName.trim() && (
                      <h3 className="text-base font-black text-slate-900 tracking-wider uppercase flex items-center justify-center gap-1.5">
                        <Wrench className="w-5 h-5 text-slate-700" /> {garageName.trim()}
                      </h3>
                    )}
                    <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-0.5">
                      Vehicle Job Card & Estimate
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs font-semibold text-gray-600 border-b border-gray-100 pb-3">
                    <div>
                      Customer: <span className="text-gray-900 font-black">{customerName}</span>
                    </div>
                    <div className="text-right">
                      Date: <span className="text-gray-900 font-black">{today}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-500" /> Model:{' '}
                      <span className="text-gray-900 font-black">{vehicleModel}</span>
                    </div>
                    <div className="text-right">
                      Reg No:{' '}
                      <span className="text-gray-900 font-black tracking-wider">{vehicleNo}</span>
                    </div>
                  </div>

                  {/* Services table */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-200">
                      <span>Service / Part</span>
                      <span>Charges</span>
                    </div>
                    <div className="space-y-2 mt-2 text-xs font-medium text-gray-700">
                      {selectedServices.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between border-b border-gray-100 pb-1"
                        >
                          <span className="pr-2">🛠️ {item.name}</span>
                          <span className="font-black text-gray-900 shrink-0">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Total Estimated Cost
                    </span>
                    <span className="text-xl font-black text-slate-900">₹{totalBill}</span>
                  </div>
                  <p className="text-center text-[10px] text-gray-400 font-semibold mt-3">
                    Estimate only. Final invoice will be shared after vehicle delivery.
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
                  <Download className="w-4 h-4" /> Download / Print Job Card (PDF)
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                  Print dialog mein &quot;Save as PDF&quot; select karein
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10">
              <Car className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">Job card yahan dikhega</p>
              <p className="text-xs mt-1">
                Customer aur vehicle details bharkar &quot;Send Job Card on WhatsApp&quot; dabayein
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
              Aap {FREE_LIMIT} free job cards bana chuke hain. Unlimited job cards ke liye Pro plan le
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
