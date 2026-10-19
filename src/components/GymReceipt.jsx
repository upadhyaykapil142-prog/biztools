import { useState, useEffect } from 'react';
import { Dumbbell, Download, Crown } from 'lucide-react';

export default function GymReceipt() {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [planType, setPlanType] = useState('Monthly');
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState(false);

  useEffect(() => {
    const savedCount = localStorage.getItem('biztools_gym_free_limit');
    if (savedCount) setUsageCount(parseInt(savedCount, 10));
  }, []);

  const handleCreateReceipt = (e) => {
    e.preventDefault();
    if (usageCount >= 5) {
      setShowPaywall(true);
      return;
    }
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('biztools_gym_free_limit', newCount.toString());
    setReceiptGenerated(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-left">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Dumbbell className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">फ्री जिम रसीद मेकर</h2>
            <p className="text-xs text-gray-500">महीने के 5 बिल बिल्कुल मुफ्त बनाएं</p>
          </div>
        </div>
        <form onSubmit={handleCreateReceipt} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">मैंबर का नाम</label>
            <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="उदा: राहुल शर्मा" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-800 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp मोबाइल नंबर</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="उदा: 9876543210" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-800 font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">फीस की रकम (₹)</label>
              <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-800 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">प्लान / वैलिडिटी</label>
              <select value={planType} onChange={(e) => setPlanType(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-700 font-medium">
                <option value="Monthly">1 महीना (Monthly)</option>
                <option value="Quarterly">3 महीना (Quarterly)</option>
                <option value="Yearly">1 साल (Yearly)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm mt-2 flex items-center justify-center gap-2">
            📥 रसीद जनरेट करें ({5 - usageCount} फ्री बचे)
          </button>
        </form>
      </div>

      {/* Preview Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between min-h-[350px]">
        {receiptGenerated ? (
          <>
            <div className="border-4 border-dashed border-gray-100 p-6 rounded-xl bg-amber-50/30 flex-1 flex flex-col justify-between text-left">
              <div className="text-center pb-4 border-b border-gray-200/60">
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">FITNESS CLUB RECEIPT</h3>
              </div>
              <div className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                <div className="flex justify-between"><span className="text-gray-400">नाम:</span> <span className="text-gray-800">{clientName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">मोबाइल:</span> <span className="text-gray-800">+91 {phone}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">प्लान:</span> <span className="text-gray-800">{planType} Membership</span></div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200/60 flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">कुल भुगतान</span>
                <span className="text-xl font-black text-emerald-600">₹{amount}</span>
              </div>
            </div>
            <button onClick={() => window.print()} className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
              <Download className="w-4 h-4" /> डाउनलोड / प्रिंट रसीद
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <Dumbbell className="w-12 h-12 mb-3 text-gray-300 animate-bounce" />
            <p className="text-sm font-semibold">फॉर्म भरें और लाइव रसीद देखें</p>
          </div>
        )}
      </div>

      {/* Paywall Popup */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center border border-gray-100 shadow-2xl relative overflow-hidden">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-full"><Crown className="w-8 h-8 fill-amber-400" /></div>
            </div>
            <h3 className="text-xl font-black text-gray-900">फ्री लिमिट समाप्त! 👑</h3>
            <p className="text-sm text-gray-500 mt-2">5 फ्री बिल पूरे हो चुके हैं। असीमित रसीदों और सीधे WhatsApp ऑटो-रिमाइंडर के लिए प्रीमियम में अपग्रेड करें।</p>
            <div className="my-5 p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">All-in-One Plan</span>
              <span className="text-xl font-black text-blue-600">₹399<span className="text-xs text-gray-400 font-medium">/महीना</span></span>
            </div>
            <button onClick={() => alert("पेमेंट गेटवे ओपनिंग... (Razorpay API)")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm">
              🚀 अभी एक्टिवेट करें (Start)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
