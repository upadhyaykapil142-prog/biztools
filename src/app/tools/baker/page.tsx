'use client';
import { useState, useEffect } from 'react';
import { Cake, Download, Crown, Plus, Trash2, Sparkles, Smile } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  cost: number;
}

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_baker_free_limit';

// 18 most demanding cake flavours & varieties (owner ko type nahi karna padega)
const POPULAR_FLAVORS = [
  // Standard & Universal Favorites
  { name: 'Black Forest Classic Base', cost: 350 },
  { name: 'Pineapple Delight Crush', cost: 300 },
  { name: 'Rich Chocolate Truffle Core', cost: 450 },
  { name: 'Butterscotch Crunch Mix', cost: 380 },
  { name: 'Creamy Vanilla Bean Base', cost: 280 },

  // Premium & Exotic Flavors
  { name: 'Red Velvet Luxury Velvet', cost: 500 },
  { name: 'Blueberry Cheesecake Base', cost: 650 },
  { name: 'Alfonso Mango Pulp Mix', cost: 400 },
  { name: 'Sizzling Chocolate Brownie Cake', cost: 480 },
  { name: 'Lotus Biscoff Premium Spread', cost: 700 },
  { name: 'White Forest Elegance', cost: 390 },

  // Custom Special & Structure Elements
  { name: 'Full Fondant Structural Work', cost: 800 },
  { name: 'Semi-Fondant Theme Layer', cost: 400 },
  { name: 'Custom Acrylic Birthday Topper', cost: 120 },
  { name: 'Fresh Seasonal Mixed Berries', cost: 250 },
  { name: 'Edible Photo Print Sheet', cost: 180 },
  { name: 'Premium Presentation Box', cost: 90 },
  { name: 'Zero-Sugar Premium Base Charge', cost: 150 },
];

// Basic baking materials
const BASE_INGREDIENTS = [
  { name: 'Flour & Premium Sugar Base', cost: 40 },
  { name: 'Whipped Cream & Fresh Icing', cost: 120 },
  { name: 'Cocoa Powder & Milky Butter', cost: 150 },
];

export default function LuxuryBakerSaaS() {
  const [bakeryName, setBakeryName] = useState('THE CAKE ARTISAN - HOME BAKERY');
  const [customerName, setCustomerName] = useState('');
  const [cakeFlavor, setCakeFlavor] = useState('');
  const [profitMargin, setProfitMargin] = useState('40'); // 40% recommended
  const [isEggless, setIsEggless] = useState<boolean>(true); // default Veg

  const [customIngName, setCustomIngName] = useState('');
  const [customIngCost, setCustomIngPrice] = useState('');

  // Materials list
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    BASE_INGREDIENTS.map((item, idx) => ({ ...item, id: `init-${idx}` }))
  );

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
      // localStorage unavailable - ignore
    }
  }, []);

  // Manual item add
  const handleAddCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIngName || !customIngCost) return;

    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: customIngName,
      cost: Number(customIngCost),
    };

    setIngredients([...ingredients, newItem]);
    setCustomIngName('');
    setCustomIngPrice('');
  };

  // Flavour button click se list mein add
  const handleAddFlavorOrMaterial = (item: { name: string; cost: number }) => {
    const exists = ingredients.some((i) => i.name === item.name);
    if (exists) return;

    const newItem: Ingredient = {
      id: Math.random().toString(),
      name: item.name,
      cost: item.cost,
    };
    setIngredients((prev) => [...prev, newItem]);

    // Agar cake ka main flavour khali hai to default naam set kar do
    if (!cakeFlavor) {
      setCakeFlavor(item.name.split(' ')[0] + ' Cake');
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((item) => item.id !== id));
  };

  // Pricing maths
  const totalMakingCost = ingredients.reduce((total, item) => total + item.cost, 0);
  const marginPercent = Number(profitMargin) || 0;
  const sellingPrice =
    marginPercent < 100 ? Math.round(totalMakingCost / (1 - marginPercent / 100)) || 0 : 0;
  const netProfit = sellingPrice - totalMakingCost;

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0 || !customerName || !cakeFlavor) return;

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
    setSlipGenerated(true);
  };

  const handleDownload = () => {
    // Print dialog -> "Save as PDF"
    window.print();
  };

  const freeLeft = Math.max(FREE_LIMIT - usageCount, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center font-sans">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #baker-invoice, #baker-invoice * { visibility: visible !important; }
          #baker-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================== */}
        {/* LEFT PANEL: SMART DATA CREATOR WIZARD                      */}
        {/* ========================================================== */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl shadow-md border border-gray-100 text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-800">Cake Cost & Margin Wizard</h2>
                <p className="text-xs text-gray-500">Calculate ingredients and plan profit margins</p>
              </div>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Bakery / Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none text-gray-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cake Description / Flavor
                  </label>
                  <input
                    type="text"
                    required
                    value={cakeFlavor}
                    onChange={(e) => setCakeFlavor(e.target.value)}
                    placeholder="e.g. 1kg Choco Truffle"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* Veg (Green) & Eggless Selection Area */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Margin
                  </label>
                  <select
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-bold outline-none"
                  >
                    <option value="30">30% Profit</option>
                    <option value="40">40% Recommended</option>
                    <option value="50">50% Premium</option>
                  </select>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsEggless(true)}
                    className={`py-2 px-2 rounded-xl font-bold text-xs border transition-all ${
                      isEggless
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    🟩 100% Eggless (Veg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEggless(false)}
                    className={`py-2 px-2 rounded-xl font-bold text-xs border transition-all ${
                      !isEggless
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                        : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    🥚 Contains Egg
                  </button>
                </div>
              </div>

              {/* 18 CAKE VARIETY QUICK SELECT GRID */}
              <div className="bg-rose-50/30 p-3 rounded-2xl border border-rose-100">
                <h3 className="text-[11px] font-black text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Hot Flavors & Cake
                  Varieties (Click to Add)
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {POPULAR_FLAVORS.map((pItem, idx) => {
                    const added = ingredients.some((i) => i.name === pItem.name);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddFlavorOrMaterial(pItem)}
                        disabled={added}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                          added
                            ? 'bg-rose-500 text-white border-rose-500 opacity-60 cursor-not-allowed'
                            : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {pItem.name} · ₹{pItem.cost}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom ingredient add */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Add Custom Material
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customIngName}
                    onChange={(e) => setCustomIngName(e.target.value)}
                    placeholder="Item name"
                    className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 font-medium"
                  />
                  <input
                    type="number"
                    min="0"
                    value={customIngCost}
                    onChange={(e) => setCustomIngPrice(e.target.value)}
                    placeholder="₹ Cost"
                    className="w-24 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomIngredient}
                    className="px-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md"
                    aria-label="Add custom material"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Materials list */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-[11px] font-black text-gray-600 uppercase tracking-wider flex justify-between">
                  <span>Materials & Charges</span>
                  <span>Cost</span>
                </div>
                <div className="max-h-[170px] overflow-y-auto divide-y divide-gray-100">
                  {ingredients.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Koi item nahi hai. Upar se flavour ya material add karein.
                    </p>
                  )}
                  {ingredients.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 font-medium"
                    >
                      <span className="pr-2">{item.name}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-gray-900">₹{item.cost}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(item.id)}
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

              {/* Live cost summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Making Cost</span>
                  <span className="text-sm font-black text-gray-800">₹{totalMakingCost}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase block">Net Profit</span>
                  <span className="text-sm font-black text-emerald-700">₹{netProfit}</span>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-2">
                  <span className="text-[9px] font-bold text-rose-500 uppercase block">Selling Price</span>
                  <span className="text-sm font-black text-rose-600">₹{sellingPrice}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
              >
                🎂 Generate Cake Invoice ({freeLeft} free left)
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT PANEL: INVOICE PREVIEW                               */}
        {/* ========================================================== */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl shadow-md border border-gray-200 flex flex-col justify-between min-h-[420px]">
          {slipGenerated ? (
            <>
              <div
                id="baker-invoice"
                className="border-4 border-double border-rose-900/20 p-5 rounded-2xl bg-rose-50/20 flex-1 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="text-center pb-3 border-b-2 border-rose-100">
                    <h3 className="text-base font-black text-rose-800 tracking-wider uppercase flex items-center justify-center gap-1.5">
                      <Cake className="w-5 h-5 text-rose-500" /> {bakeryName || 'YOUR BAKERY'}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-0.5">
                      Custom Cake Order Invoice
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs font-semibold text-gray-600 border-b border-gray-100 pb-3">
                    <div>
                      Customer: <span className="text-gray-900 font-black">{customerName}</span>
                    </div>
                    <div className="text-right">
                      Date: <span className="text-gray-900 font-black">{today}</span>
                    </div>
                    <div>
                      Cake: <span className="text-gray-900 font-black">{cakeFlavor}</span>
                    </div>
                    <div className="text-right">
                      Type:{' '}
                      <span
                        className={`font-black ${isEggless ? 'text-emerald-700' : 'text-amber-700'}`}
                      >
                        {isEggless ? '🟩 Eggless (Veg)' : '🥚 Contains Egg'}
                      </span>
                    </div>
                  </div>

                  {/* Cake components (cost hidden from customer) */}
                  <div className="mt-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                      Cake Includes
                    </p>
                    <ul className="space-y-1 text-xs font-medium text-gray-700">
                      {ingredients.map((item) => (
                        <li key={item.id} className="flex items-center gap-1.5">
                          <Smile className="w-3 h-3 text-rose-400 shrink-0" /> {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-100">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-rose-600">₹{sellingPrice}</span>
                  </div>
                  <p className="text-center text-[10px] text-gray-400 font-semibold mt-3">
                    Thank you for ordering! 🎂 Please enjoy your cake fresh.
                  </p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download / Print Invoice (PDF)
                </button>
                <p className="text-[10px] text-gray-400 mt-2">
                  Print dialog mein &quot;Save as PDF&quot; select karein
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10">
              <Cake className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">Invoice yahan dikhega</p>
              <p className="text-xs mt-1">
                Customer name, cake flavour bharkar &quot;Generate&quot; dabayein
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
              Aap {FREE_LIMIT} free invoices bana chuke hain. Unlimited invoices ke liye Pro plan le
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
