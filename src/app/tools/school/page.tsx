'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Download, Crown, Award, Send } from 'lucide-react';

const FREE_LIMIT = 5;
const STORAGE_KEY = 'biztools_coaching_free_limit';

// 6 subjects (har ek out of 100). Naam badalna ho to yahin badlein.
const SUBJECTS = [
  { key: 'maths', label: 'Maths', fullName: 'Mathematics', waName: 'Mathematics' },
  { key: 'science', label: 'Science', fullName: 'Science & Analytics', waName: 'Science & Tech' },
  { key: 'english', label: 'English', fullName: 'English Communication', waName: 'English Lit' },
  { key: 'sanskrit', label: 'Sanskrit', fullName: 'Sanskrit', waName: 'Sanskrit Language' },
  { key: 'social', label: 'Social Science', fullName: 'Social Science', waName: 'Social Science' },
  { key: 'marathi', label: 'Marathi', fullName: 'Marathi', waName: 'Marathi Language' },
] as const;

type SubjectKey = (typeof SUBJECTS)[number]['key'];

const FEE_STATUS_OPTIONS = ['Pending', 'Paid', 'Partially Paid'] as const;
type FeeStatus = (typeof FEE_STATUS_OPTIONS)[number];

export default function CoachingReportWizard() {
  // Personal Details State (Coaching Format)
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState(''); // parents ka WhatsApp number
  const [batchNo, setBatchNo] = useState('');
  const [coachingName, setCoachingName] = useState('');

  // Test Marks (6 subjects)
  const [marks, setMarks] = useState<Record<SubjectKey, string>>({
    maths: '',
    science: '',
    english: '',
    sanskrit: '',
    social: '',
    marathi: '',
  });

  // Fee Details
  const [annualFee, setAnnualFee] = useState('');
  const [feeStatus, setFeeStatus] = useState<FeeStatus>('Pending');

  // Business & Paywall States
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [today, setToday] = useState('');

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

  const handleMarkChange = (key: SubjectKey, value: string) => {
    setMarks((prev) => ({ ...prev, [key]: value }));
  };

  // Live Auto Analytics (6 subjects = max 600)
  const maxTotal = SUBJECTS.length * 100;
  const totalMarks = SUBJECTS.reduce((sum, s) => sum + (Number(marks[s.key]) || 0), 0);
  const percentage = Math.round((totalMarks / maxTotal) * 100) || 0;

  let performanceStatus = 'NEEDS IMPROVEMENT ✍️';
  let statusColor = 'text-rose-600 bg-rose-50 border-rose-200';

  if (percentage >= 85) {
    performanceStatus = 'EXCELLENT / TOPPER 👑';
    statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (percentage >= 70) {
    performanceStatus = 'VERY GOOD 👍';
    statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (percentage >= 50) {
    performanceStatus = 'GOOD PROGRESS ✨';
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  // Fee status badge colour
  let feeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  if (feeStatus === 'Paid') feeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  else if (feeStatus === 'Partially Paid') feeColor = 'text-amber-700 bg-amber-50 border-amber-200';

  const feeText =
    feeStatus === 'Pending'
      ? '🔴 PENDING (Please clear soon)'
      : feeStatus === 'Partially Paid'
        ? '🟡 PARTIALLY PAID (Balance pending)'
        : '🟢 PAID (Thank you)';

  const freeLeft = Math.max(FREE_LIMIT - usageCount, 0);

  // WhatsApp link (wa.me, message properly encoded)
  const buildWhatsappUrl = () => {
    const lines: string[] = [];
    lines.push('📚 *STUDENT PROGRESS REPORT CARD* 📚');
    lines.push('');
    if (coachingName.trim()) lines.push(`*Institute:* ${coachingName.trim()}`);
    lines.push(`*Date:* ${today}`);
    lines.push('-----------------------------------');
    lines.push(`*Student Name:* ${studentName}`);
    lines.push(`*Batch/Class:* ${batchNo}`);
    lines.push('-----------------------------------');
    lines.push('*MONTHLY TEST SCORES:*');
    SUBJECTS.forEach((s) => {
      lines.push(`- ${s.waName}: ${marks[s.key] || 0}/100`);
    });
    lines.push('-----------------------------------');
    lines.push(`*TOTAL OBTAINED:* *${totalMarks} / ${maxTotal}*`);
    lines.push(`*NET PERCENTAGE:* *${percentage}%*`);
    lines.push(`*TEACHER REMARK:* ${performanceStatus}`);
    lines.push('-----------------------------------');
    if (annualFee) {
      lines.push(`*Annual Fee:* ₹${Number(annualFee).toLocaleString('en-IN')}`);
    }
    lines.push(`*Fee Status:* ${feeText}`);
    lines.push('');
    lines.push('_Powered by BizTools.in_');

    // Indian numbers ke liye '91' prefix
    const formattedPhone =
      parentPhone.startsWith('91') && parentPhone.length > 10 ? parentPhone : `91${parentPhone}`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // Parents ke WhatsApp par seedha progress report card bhejna
  const handleSendResultOnWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || parentPhone.length !== 10) return;

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

    setReportGenerated(true);
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-sans">
      {/* Print styles: sirf result slip print hogi */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #report-slip, #report-slip * { visibility: visible !important; }
          #report-slip { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* ========================================================== */}
        {/* LEFT SIDE: COACHING INPUT FORM                             */}
        {/* ========================================================== */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Coaching Report Builder</h2>
              <p className="text-xs text-gray-500">
                Generate monthly test ranks & direct WhatsApp result slips
              </p>
            </div>
          </div>

          <form onSubmit={handleSendResultOnWhatsApp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Coaching / Tutorials Name (Optional)
              </label>
              <input
                type="text"
                value={coachingName}
                onChange={(e) => setCoachingName(e.target.value)}
                placeholder="e.g. Shukla Tutorials Andheri"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Amit Kumar"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
                />
              </div>
              {/* Parents ka WhatsApp number */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Parent WhatsApp No.
                </label>
                <input
                  type="tel"
                  required
                  minLength={10}
                  maxLength={10}
                  inputMode="numeric"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-Digit Mobile"
                  className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 font-black"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Batch / Class ID
                </label>
                <input
                  type="text"
                  required
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  placeholder="e.g. 10th Standard (IIT)"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Monthly Test Scores (Max 100)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SUBJECTS.map((s) => (
                  <div key={s.key}>
                    <input
                      type="number"
                      max="100"
                      min="0"
                      required
                      placeholder={s.label}
                      value={marks[s.key]}
                      onChange={(e) => handleMarkChange(s.key, e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
                    />
                    <span className="text-[10px] text-gray-400 font-bold block text-center mt-1">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Annual Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={annualFee}
                  onChange={(e) => setAnnualFee(e.target.value)}
                  placeholder="e.g. 24000"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Fee Status
                </label>
                <select
                  value={feeStatus}
                  onChange={(e) => setFeeStatus(e.target.value as FeeStatus)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
                >
                  {FEE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm mt-2 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Report on WhatsApp ({freeLeft} free left)
            </button>
          </form>
        </div>

        {/* ========================================================== */}
        {/* RIGHT SIDE: RESULT SLIP PREVIEW                            */}
        {/* ========================================================== */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between min-h-[380px]">
          {reportGenerated ? (
            <>
              <div
                id="report-slip"
                className="border-4 border-double border-blue-900/20 p-5 rounded-xl bg-slate-50/50 flex-1 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="text-center pb-3 border-b-2 border-gray-200/80">
                    {coachingName.trim() && (
                      <h3 className="text-base font-black text-blue-900 tracking-wider uppercase flex items-center justify-center gap-1.5">
                        <Award className="w-5 h-5 text-blue-600" /> {coachingName.trim()}
                      </h3>
                    )}
                    <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mt-0.5">
                      Monthly Performance Slip
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-y-1.5 text-xs font-semibold text-gray-600 border-b border-gray-100 pb-3">
                    <div>
                      Student: <span className="text-gray-900 font-black">{studentName}</span>
                    </div>
                    <div className="text-right">
                      Batch: <span className="text-gray-900 font-black">{batchNo}</span>
                    </div>
                    <div>
                      Date: <span className="text-gray-900 font-black">{today}</span>
                    </div>
                    <div className="text-right">
                      Term: <span className="text-gray-900 font-black">Monthly Test</span>
                    </div>
                  </div>

                  {/* Marks table */}
                  <div className="mt-3 space-y-2 text-xs font-medium text-gray-700">
                    {SUBJECTS.map((s) => (
                      <div key={s.key} className="flex justify-between border-b border-gray-100 pb-1">
                        <span>{s.fullName}</span>
                        <span className="font-black text-gray-900">
                          {marks[s.key] || 0} / 100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance badge, total row & fee */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div
                    className={`w-full py-1.5 rounded-lg text-center text-[10px] font-black tracking-wider border uppercase mb-3 ${statusColor}`}
                  >
                    Remark: {performanceStatus}
                  </div>

                  <div className="grid grid-cols-2 text-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm items-center">
                    <div className="border-r border-gray-100">
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">
                        Total Obtained
                      </span>
                      <span className="text-sm font-black text-gray-800">
                        {totalMarks} / {maxTotal}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">
                        Net Percentage
                      </span>
                      <span className="text-sm font-black text-blue-600">{percentage}%</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">
                        Annual Fee
                      </span>
                      <span className="text-sm font-black text-gray-800">
                        {annualFee ? `₹${Number(annualFee).toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider border uppercase ${feeColor}`}
                    >
                      Fee: {feeStatus}
                    </span>
                  </div>
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
                  <Download className="w-4 h-4" /> Download / Print Slip (PDF)
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                  Print dialog mein &quot;Save as PDF&quot; select karein
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10">
              <Award className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">Result slip yahan dikhegi</p>
              <p className="text-xs mt-1">
                Form bharkar &quot;Send Report on WhatsApp&quot; dabayein
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
              Aap {FREE_LIMIT} free result slips bana chuke hain. Unlimited slips ke liye Pro plan le
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
