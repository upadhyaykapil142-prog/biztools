
'use client';

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {
  ShoppingBag,
  Download,
  Crown,
  Send,
  Plus,
  Trash2,
  Sparkles,
  Percent,
} from 'lucide-react';

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_grocery_free_limit';

interface GroceryItem {
  id: string;
  name: string;
  wholesalePrice: number;
  mrp: number;
  discount: number;
  finalPrice: number;
  netProfit: number;
}

const POPULAR_GROCERY_ITEMS = [
  { name: 'Basmati Rice (1kg Premium)', wholesalePrice: 90, mrp: 140 },
  { name: 'Fortune Mustard Oil (1L)', wholesalePrice: 135, mrp: 175 },
  { name: 'Ashirvaad Atta (5kg Pack)', wholesalePrice: 210, mrp: 260 },
  { name: 'Amul Butter (500g)', wholesalePrice: 225, mrp: 275 },
  { name: 'Tata Salt (1kg Pack)', wholesalePrice: 22, mrp: 28 },
  { name: 'Surf Excel Easy Wash (1kg)', wholesalePrice: 110, mrp: 140 },
  { name: 'Dettol Liquid Handwash', wholesalePrice: 75, mrp: 99 },
  { name: 'Maggi 2-Min Noodles (Pack of 12)', wholesalePrice: 128, mrp: 168 },
  { name: 'Cadbury Dairy Milk Silk', wholesalePrice: 65, mrp: 80 },
  { name: 'Red Label Tea (500g)', wholesalePrice: 260, mrp: 310 },
  { name: 'Haldirams Bhujia Sev (400g)', wholesalePrice: 85, mrp: 110 },
  { name: 'Good Day Cashew Cookies (Combo)', wholesalePrice: 40, mrp: 50 },
  { name: 'Amul Taaza Milk (1L Packet)', wholesalePrice: 62, mrp: 66 },
  { name: 'Amul Butter (100g Small)', wholesalePrice: 52, mrp: 58 },
  { name: 'Premium Fresh Eggs (Tray of 6)', wholesalePrice: 42, mrp: 55 },
  { name: 'Harvest Gold White Bread (Large)', wholesalePrice: 32, mrp: 40 },
  { name: 'Ashirvaad Shudh Chakki Atta (1kg)', wholesalePrice: 44, mrp: 52 },
  { name: 'Fortune Refined Sunflower Oil (1L)', wholesalePrice: 125, mrp: 155 },
  { name: 'Maggi 2-Min Single Noodles', wholesalePrice: 12, mrp: 14 },
  { name: 'Red Label Tea Powder (250g)', wholesalePrice: 130, mrp: 160 },
  { name: 'Nescafe Classic Instant Coffee (50g)', wholesalePrice: 145, mrp: 185 },
  { name: 'Amulya Milk Powder (500g)', wholesalePrice: 210, mrp: 245 },
  { name: 'Dettol Antiseptic Bath Soap (Combo)', wholesalePrice: 140, mrp: 172 },
  { name: 'Surf Excel Easy Wash Detergent (500g)', wholesalePrice: 65, mrp: 85 },
  { name: 'Colgate Strong Teeth Toothpaste (200g)', wholesalePrice: 82, mrp: 105 },
  { name: 'Vim Dishwash Gel Liquid (250ml)', wholesalePrice: 48, mrp: 60 },
  { name: 'Catch Garam Masala Powder (100g)', wholesalePrice: 72, mrp: 92 },
];

export default function GroceryProfitWizard() {
  const [storeName, setStoreName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [customItemName, setCustomItemName] = useState('');
  const [customWholesale, setCustomWholesale] = useState('');
  const [customMRP, setCustomMRP] = useState('');
  const [customDiscount, setCustomDiscount] = useState('5');

  const [selectedItems, setSelectedItems] = useState<GroceryItem[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN'));

    try {
      const savedCount = localStorage.getItem(STORAGE_KEY);
      if (savedCount !== null) {
        const parsed = Number.parseInt(savedCount, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          setUsageCount(parsed);
        }
      }
    } catch {
      // Local storage may be unavailable.
    }
  }, []);

  const formatMoney = (amount: number) =>
    amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const createItem = (
    name: string,
    wholesalePrice: number,
    mrp: number,
    discount: number
  ): GroceryItem => {
    const finalPrice =
      Math.round(mrp * (1 - discount / 100) * 100) / 100;

    return {
      id: `${Date.now()}-${Math.random()}`,
      name,
      wholesalePrice,
      mrp,
      discount,
      finalPrice,
      netProfit:
        Math.round((finalPrice - wholesalePrice) * 100) / 100,
    };
  };

  const handleAddPopularItem = (item: {
    name: string;
    wholesalePrice: number;
    mrp: number;
  }) => {
    if (selectedItems.some((i) => i.name === item.name)) return;

    setSelectedItems((prev) => [
      ...prev,
      createItem(item.name, item.wholesalePrice, item.mrp, 5),
    ]);
    setBillGenerated(false);
  };

  const handleAddCustomItem = (e: FormEvent) => {
    e.preventDefault();

    const name = customItemName.trim();
    const wholesale = Number(customWholesale);
    const mrp = Number(customMRP);
    const discount = Number(customDiscount);

    if (
      !name ||
      customWholesale.trim() === '' ||
      customMRP.trim() === '' ||
      customDiscount.trim() === '' ||
      !Number.isFinite(wholesale) ||
      !Number.isFinite(mrp) ||
      !Number.isFinite(discount) ||
      wholesale < 0 ||
      mrp < 0 ||
      discount < 0 ||
      discount > 100
    ) {
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      createItem(name, wholesale, mrp, discount),
    ]);

    setCustomItemName('');
    setCustomWholesale('');
    setCustomMRP('');
    setBillGenerated(false);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
    setBillGenerated(false);
  };

  const totalWholesale = selectedItems.reduce(
    (total, item) => total + item.wholesalePrice,
    0
  );

  const totalMRP = selectedItems.reduce(
    (total, item) => total + item.mrp,
    0
  );

  const totalCustomerBill = selectedItems.reduce(
    (total, item) => total + item.finalPrice,
    0
  );

  const totalNetProfit = selectedItems.reduce(
    (total, item) => total + item.netProfit,
    0
  );

  const totalSavings = totalMRP - totalCustomerBill;

  const netMarginPercent =
    totalCustomerBill > 0
      ? Math.round((totalNetProfit / totalCustomerBill) * 100)
      : 0;

  const handleSendBillOnWhatsApp = (e?: FormEvent) => {
    e?.preventDefault();

    if (
      !storeName.trim() ||
      !customerName.trim() ||
      !/^\d{10}$/.test(customerPhone) ||
      selectedItems.length === 0
    ) {
      return;
    }

    if (usageCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const groceryDetailsText = selectedItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}\nMRP: ₹${formatMoney(item.mrp)} | Offer Price: ₹${formatMoney(item.finalPrice)} (${item.discount}% off)`
      )
      .join('\n\n');

    const message = [
      '🏪 *DIGITAL DISCOUNT BILL SLIP* 🏪',
      '',
      `*Store:* ${storeName.trim()}`,
      `*Date:* ${today}`,
      '--------------------------------',
      `*Customer Name:* ${customerName.trim()}`,
      '',
      '*Items Purchased:*',
      groceryDetailsText,
      '--------------------------------',
      `*Total Items MRP:* ₹${formatMoney(totalMRP)}`,
      `*🎉 YOUR TOTAL SAVINGS:* ₹${formatMoney(totalSavings)}`,
      `*💥 NET PAYABLE AMOUNT:* ₹${formatMoney(totalCustomerBill)}`,
      '',
      'Please confirm payment separately.',
      'Thank you for shopping with us! 🙏',
    ].join('\n');

    const whatsappUrl =
      `https://wa.me/91${customerPhone}?text=${encodeURIComponent(message)}`;

    const newCount = usageCount + 1;
    setUsageCount(newCount);

    try {
      localStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch {
      // Local storage may be unavailable.
    }

    setBillGenerated(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNewBill = () => {
    setCustomerName('');
    setCustomerPhone('');
    setSelectedItems([]);
    setCustomItemName('');
    setCustomWholesale('');
    setCustomMRP('');
    setCustomDiscount('5');
    setBillGenerated(false);
    setShowPaywall(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center font-sans">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT PANEL */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl shadow-md border border-gray-100 text-left">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800">
                Kirana Profit &amp; Discount Wizard
              </h2>
              <p className="text-xs text-gray-500">
                Calculate store margins and prepare instant WhatsApp bills
              </p>
            </div>
          </div>

          <form onSubmit={handleSendBillOnWhatsApp} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Store / Shop Name
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter your shop name"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none text-gray-800 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none text-gray-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(
                      e.target.value.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  placeholder="10-digit mobile"
                  className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 font-black"
                />
              </div>
            </div>

            {/* 27 POPULAR PRODUCTS */}
            <div className="bg-emerald-50/30 p-3 rounded-2xl border border-emerald-200">
              <h3 className="text-[11px] font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                27 Daily Essentials — Quick Add with 5% Off
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {POPULAR_GROCERY_ITEMS.map((item) => {
                  const exists = selectedItems.some(
                    (selected) => selected.name === item.name
                  );

                  return (
                    <button
                      key={item.name}
                      type="button"
                      disabled={exists}
                      onClick={() => handleAddPopularItem(item)}
                      className="text-left text-[11px] bg-white hover:bg-emerald-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-bold py-2.5 px-3 rounded-xl border border-gray-200 transition-all"
                    >
                      {exists ? '✓ ' : '📦 '}
                      {item.name}
                      <span className="block mt-1 text-emerald-700">
                        MRP ₹{item.mrp} · Cost ₹{item.wholesalePrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* CUSTOM ITEM FORM */}
          <form
            onSubmit={handleAddCustomItem}
            className="bg-gray-50 p-3 rounded-2xl border border-gray-200 mt-4"
          >
            <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-3">
              Add Custom Grocery Item
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Item name"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="sm:col-span-2 min-w-0 p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-800"
              />

              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Wholesale cost ₹"
                value={customWholesale}
                onChange={(e) => setCustomWholesale(e.target.value)}
                className="min-w-0 p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-800"
              />

              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="MRP ₹"
                value={customMRP}
                onChange={(e) => setCustomMRP(e.target.value)}
                className="min-w-0 p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-800"
              />

              <div className="flex gap-2 sm:col-span-2">
                <div className="relative flex-1">
                  <Percent className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="1"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    placeholder="Discount %"
                    className="w-full p-2.5 pl-8 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-800"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </div>
          </form>

          {/* SELECTED ITEMS */}
          <div className="mt-4">
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
              Selected Items ({selectedItems.length})
            </h3>

            <div className="max-h-52 overflow-y-auto space-y-2">
              {selectedItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-5 border border-dashed border-gray-200 rounded-xl">
                  No items added. Select a popular item or add your own.
                </p>
              ) : (
                selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 break-words">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Cost ₹{formatMoney(item.wholesalePrice)} · MRP ₹
                        {formatMoney(item.mrp)} · {item.discount}% off
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-emerald-700">
                        ₹{formatMoney(item.finalPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TOTALS */}
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">Total Wholesale Cost</span>
              <span className="font-bold text-gray-800">
                ₹{formatMoney(totalWholesale)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">Total MRP</span>
              <span className="font-bold text-gray-800">
                ₹{formatMoney(totalMRP)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">Customer Savings</span>
              <span className="font-bold text-emerald-700">
                ₹{formatMoney(totalSavings)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">Estimated Net Profit</span>
              <span
                className={`font-bold ${
                  totalNetProfit < 0 ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                ₹{formatMoney(totalNetProfit)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-bold text-gray-800">
                {netMarginPercent}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSendBillOnWhatsApp()}
            disabled={
              !storeName.trim() ||
              !customerName.trim() ||
              !/^\d{10}$/.test(customerPhone) ||
              selectedItems.length === 0
            }
            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm"
          >
            <Send className="w-4 h-4" />
            Generate &amp; Send WhatsApp Bill
          </button>

          <p className="text-center text-[10px] text-gray-400 mt-2">
            Free bills used: {usageCount}/{FREE_LIMIT}
          </p>
        </div>

        {/* RIGHT PANEL: BILL PREVIEW */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            id="grocery-bill"
            className="bg-white p-5 sm:p-7 rounded-3xl shadow-md border border-gray-100"
          >
            {!billGenerated ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-gray-700">
                  Digital Bill Preview
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mt-2">
                  Add items and customer details, then generate your bill to
                  preview it here.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-center pb-5 border-b-2 border-dashed border-emerald-200">
                  <div className="inline-flex p-3 bg-emerald-50 rounded-2xl mb-3">
                    <ShoppingBag className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-800 break-words">
                    {storeName}
                  </h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-bold mt-2">
                    Digital Discount Bill
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Date: {today}</p>
                </div>

                <div className="py-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Customer
                  </p>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {customerName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    WhatsApp: {customerPhone}
                  </p>
                </div>

                <div className="py-4">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                    Items Purchased
                  </h3>
                  <div className="space-y-3">
                    {selectedItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-700 break-words">
                            {index + 1}. {item.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            MRP ₹{formatMoney(item.mrp)} · {item.discount}% off
                          </p>
                        </div>
                        <span className="font-bold text-gray-800 shrink-0">
                          ₹{formatMoney(item.finalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total MRP</span>
                    <span className="font-bold text-gray-800">
                      ₹{formatMoney(totalMRP)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Savings</span>
                    <span className="font-bold text-emerald-700">
                      − ₹{formatMoney(totalSavings)}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-600 text-white rounded-2xl p-5 mt-4">
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
                    Net Payable Amount
                  </p>
                  <p className="text-3xl font-black mt-2">
                    ₹{formatMoney(totalCustomerBill)}
                  </p>
                  <div className="flex justify-between gap-3 items-center mt-4 pt-4 border-t border-emerald-400">
                    <span className="text-sm text-emerald-100">
                      Estimated Store Profit
                    </span>
                    <span className="font-extrabold">
                      ₹{formatMoney(totalNetProfit)}
                    </span>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-5">
                  Thank you for shopping with us! 🙏
                </p>
              </div>
            )}
          </div>

          {billGenerated && (
            <div className="grid grid-cols-2 gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-black text-white font-bold py-3 px-3 rounded-xl text-xs sm:text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Print / Save PDF
              </button>

              <button
                type="button"
                onClick={handleNewBill}
                className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3 px-3 rounded-xl text-xs sm:text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Bill
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #grocery-bill,
          #grocery-bill * {
            visibility: visible !important;
          }
          #grocery-bill {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
            margin: 0;
            border: none !important;
            box-shadow: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* FREE LIMIT PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-gray-800">
              Free Limit Reached
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              You have used all {FREE_LIMIT} free bill generations in this
              browser.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Premium payments are not connected. No payment has been taken.
            </p>

            <button
              type="button"
              onClick={() => setShowPaywall(false)}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
