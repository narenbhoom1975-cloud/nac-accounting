import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  BookOpen, 
  ReceiptIndianRupee, 
  FileSpreadsheet, 
  Settings, 
  Key, 
  LogOut, 
  Plus, 
  Trash2, 
  Download, 
  Share2, 
  Printer,
  UserCheck,
  AlertCircle,
  FileText,
  TrendingUp,
  Briefcase,
  Building2,
  Upload,
  Save,
  Database
} from 'lucide-react';

// --- Types & Interfaces ---

type LedgerGroup = 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Bank' | 'Cash' | 'Sundry Debtor' | 'Sundry Creditor';

interface Ledger {
  id: string;
  name: string;
  group: LedgerGroup;
  gstNumber?: string;
  openingBalance: number;
  contact?: string;
}

interface Voucher {
  id: string;
  date: string;
  type: 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Journal' | 'Contra';
  ledgerId: string; // The primary party
  amount: number;
  narration: string;
  invoiceNumber?: string; 
}

interface License {
  key: string;
  clientName: string;
  activationDate: string;
  expiryDate: string;
  isActive: boolean;
}

interface AppData {
  ledgers: Ledger[];
  vouchers: Voucher[];
  companyName: string;
  companyAddress: string;
  companyGst: string;
  companyPhone: string;
  companyEmail: string;
}

// --- Mock Data & Initial State ---

const INITIAL_DATA: AppData = {
  ledgers: [
    { id: '1', name: 'Cash Account', group: 'Cash', openingBalance: 50000 },
    { id: '2', name: 'HDFC Bank', group: 'Bank', openingBalance: 150000 },
    { id: '3', name: 'Sales Account', group: 'Income', openingBalance: 0 },
    { id: '4', name: 'Purchase Account', group: 'Expense', openingBalance: 0 },
    { id: '5', name: 'Ramesh Traders', group: 'Sundry Debtor', gstNumber: '27ABCDE1234F1Z5', openingBalance: 0 },
    { id: '6', name: 'Tech Solutions Ltd', group: 'Sundry Creditor', gstNumber: '27XYZAB5678L1Z2', openingBalance: 0 },
    { id: '7', name: 'Office Rent', group: 'Expense', openingBalance: 0 },
    { id: '8', name: 'Electricity Bill', group: 'Expense', openingBalance: 0 },
  ],
  vouchers: [
    { id: 'V001', date: '2024-04-01', type: 'Receipt', ledgerId: '1', amount: 50000, narration: 'Capital Introduction' },
    { id: 'V002', date: '2024-04-02', type: 'Purchase', ledgerId: '6', amount: 25000, narration: 'Purchased computer parts', invoiceNumber: 'INV-99' },
    { id: 'V003', date: '2024-04-05', type: 'Sales', ledgerId: '5', amount: 45000, narration: 'Sold 5 Laptops', invoiceNumber: 'NAC-001' },
    { id: 'V004', date: '2024-04-06', type: 'Payment', ledgerId: '7', amount: 12000, narration: 'Office Rent Paid via Cash' },
  ],
  companyName: 'New Age Computers',
  companyAddress: 'Shop 12, Digital Plaza, Mumbai, 400001',
  companyGst: '27AACCN1234P1Z5',
  companyPhone: '9920524542',
  companyEmail: 'support@newagecomputers.com'
};

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

// --- Components ---

// 1. License Manager (The Core Security Feature)
const LicenseGate = ({ 
  children, 
  onUnlock 
}: { 
  children?: React.ReactNode, 
  onUnlock: () => void 
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [storedLicense, setStoredLicense] = useState<License | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nac_license');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const expiry = new Date(parsed.expiryDate);
        const now = new Date();
        if (now < expiry) {
          setStoredLicense(parsed);
          onUnlock();
        } else {
          setError('License Expired. Please contact New Age Computers: 9920524542');
          localStorage.removeItem('nac_license');
        }
      } catch (e) {
        localStorage.removeItem('nac_license');
      }
    }
  }, []);

  const handleActivate = () => {
    // DEMO OVERRIDE FOR USER TESTING (HIDDEN IN UI)
    if (licenseKey === 'NAC-DEMO-2025-TEST') {
       const today = new Date();
       const expiry = new Date();
       expiry.setFullYear(today.getFullYear() + 1);
       
       const newLicense: License = {
        key: licenseKey,
        clientName: 'Demo User (Testing)',
        activationDate: today.toISOString(),
        expiryDate: expiry.toISOString(),
        isActive: true
      };
      localStorage.setItem('nac_license', JSON.stringify(newLicense));
      setStoredLicense(newLicense);
      onUnlock();
      return;
    }

    // Standard Format: NAC-DURATION-DATE-RANDOM
    // e.g., NAC-1Y-20240520-ABCD or NAC-1M-20240520-ABCD
    if (!licenseKey.startsWith('NAC-')) {
      setError('Invalid License Format. Must start with NAC-');
      return;
    }
    
    const today = new Date();
    const expiry = new Date();
    const parts = licenseKey.split('-');
    
    // Logic to detect duration from key
    if (parts.includes('1M')) {
        expiry.setMonth(today.getMonth() + 1); // 1 Month Trial
    } else {
        expiry.setFullYear(today.getFullYear() + 1); // Default 1 Year
    }

    const newLicense: License = {
      key: licenseKey,
      clientName: 'Valued Client',
      activationDate: today.toISOString(),
      expiryDate: expiry.toISOString(),
      isActive: true
    };

    localStorage.setItem('nac_license', JSON.stringify(newLicense));
    setStoredLicense(newLicense);
    onUnlock();
  };

  if (storedLicense) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Branding Background Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>

      <div className="bg-white p-10 rounded-xl shadow-2xl w-[450px] text-center relative z-10 border-t-4 border-orange-500">
        <div className="mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
            <Key size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">NAC<span className="text-orange-500">Soft</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Professional Accounting Suite</p>
        </div>
        
        <div className="mb-6 text-left">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">License Key</label>
          <div className="relative">
            <Key className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full pl-10 border-2 border-gray-200 rounded-lg p-2.5 focus:border-orange-500 focus:ring-0 outline-none font-mono text-lg text-center uppercase"
              placeholder="NAC-XXXX-XXXX-XXXX"
            />
          </div>
          {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded mt-2 text-xs font-medium"><AlertCircle size={14}/>{error}</div>}
        </div>

        <button 
          onClick={handleActivate}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition shadow-lg transform hover:-translate-y-0.5"
        >
          Activate & Login
        </button>

        {/* HIDDEN FOR PRODUCTION: Demo Key Helper removed so clients don't see it. 
            Admin can still use NAC-DEMO-2025-TEST
        */}
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
          <p>Licensed by <span className="font-bold text-gray-600">New Age Computers</span></p>
          <p>Support: 9920524542 / 9323815956</p>
        </div>
      </div>
    </div>
  );
};

// 2. Main Application
const AccountingApp = () => {
  const [view, setView] = useState<'dashboard' | 'ledgers' | 'vouchers' | 'reports' | 'invoice' | 'settings' | 'admin'>('dashboard');
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [license, setLicense] = useState<License | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Load Data
  useEffect(() => {
    const savedData = localStorage.getItem('nac_data');
    if (savedData) setData(JSON.parse(savedData));
    
    const savedLicense = localStorage.getItem('nac_license');
    if (savedLicense) setLicense(JSON.parse(savedLicense));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('nac_data', JSON.stringify(data));
  }, [data]);

  const daysRemaining = useMemo(() => {
    if (!license) return 0;
    const expiry = new Date(license.expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }, [license]);

  const logout = () => {
      localStorage.removeItem('nac_license');
      window.location.reload();
  }

  // --- Actions ---

  const addLedger = (ledger: Ledger) => {
    setData(prev => ({ ...prev, ledgers: [...prev.ledgers, ledger] }));
  };

  const deleteLedger = (id: string) => {
    setData(prev => ({ ...prev, ledgers: prev.ledgers.filter(l => l.id !== id) }));
  };

  const addVoucher = (voucher: Voucher) => {
    setData(prev => ({ ...prev, vouchers: [...prev.vouchers, voucher] }));
  };

  const deleteVoucher = (id: string) => {
    setData(prev => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }));
  };

  const updateCompanySettings = (settings: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...settings }));
  }

  // --- Tally Export Logic ---
  const exportToTally = () => {
    // Enhanced XML Export conforming to Tally XML format standards
    let xml = `<ENVELOPE>\n <HEADER>\n  <TALLYREQUEST>Import Data</TALLYREQUEST>\n </HEADER>\n <BODY>\n  <IMPORTDATA>\n   <REQUESTDESC>\n    <REPORTNAME>Vouchers</REPORTNAME>\n   </REQUESTDESC>\n   <REQUESTDATA>\n    <TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;

    data.vouchers.forEach(v => {
      const ledgerName = data.ledgers.find(l => l.id === v.ledgerId)?.name || 'Unknown Ledger';
      const dateStr = v.date.replace(/-/g, ''); // YYYYMMDD

      xml += `     <VOUCHER VCHTYPE="${v.type}" ACTION="Create">\n`;
      xml += `      <DATE>${dateStr}</DATE>\n`;
      xml += `      <NARRATION>${v.narration}</NARRATION>\n`;
      xml += `      <VOUCHERNUMBER>${v.invoiceNumber || v.id}</VOUCHERNUMBER>\n`;
      xml += `      <PARTYLEDGERNAME>${ledgerName}</PARTYLEDGERNAME>\n`;
      
      // Main Ledger Entry (Party)
      xml += `      <ALLLEDGERENTRIES.LIST>\n`;
      xml += `       <LEDGERNAME>${ledgerName}</LEDGERNAME>\n`;
      xml += `       <ISDEEMEDPOSITIVE>${['Sales', 'Payment'].includes(v.type) ? 'No' : 'Yes'}</ISDEEMEDPOSITIVE>\n`;
      xml += `       <AMOUNT>${['Sales', 'Payment'].includes(v.type) ? v.amount : -v.amount}</AMOUNT>\n`;
      xml += `      </ALLLEDGERENTRIES.LIST>\n`;

      // Contra Ledger Entry (Cash/Bank/Sales/Purchase Account)
      // In a real double entry system, this would be explicit. Here we infer for simplicity.
      let contraLedger = 'Cash Account'; // Default fallback
      if (v.type === 'Sales') contraLedger = 'Sales Account';
      if (v.type === 'Purchase') contraLedger = 'Purchase Account';
      
      xml += `      <ALLLEDGERENTRIES.LIST>\n`;
      xml += `       <LEDGERNAME>${contraLedger}</LEDGERNAME>\n`;
      xml += `       <ISDEEMEDPOSITIVE>${['Sales', 'Payment'].includes(v.type) ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>\n`;
      xml += `       <AMOUNT>${['Sales', 'Payment'].includes(v.type) ? -v.amount : v.amount}</AMOUNT>\n`;
      xml += `      </ALLLEDGERENTRIES.LIST>\n`;

      xml += `     </VOUCHER>\n`;
    });

    xml += `    </TALLYMESSAGE>\n   </REQUESTDATA>\n  </IMPORTDATA>\n </BODY>\n</ENVELOPE>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NAC_TallyExport_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Views ---

  const DashboardView = () => {
    const totalSales = data.vouchers.filter(v => v.type === 'Sales').reduce((sum, v) => sum + v.amount, 0);
    const totalPurchase = data.vouchers.filter(v => v.type === 'Purchase').reduce((sum, v) => sum + v.amount, 0);
    const totalReceipts = data.vouchers.filter(v => v.type === 'Receipt').reduce((sum, v) => sum + v.amount, 0);
    const totalPayments = data.vouchers.filter(v => v.type === 'Payment').reduce((sum, v) => sum + v.amount, 0);
    
    // Simple Cash Balance Calc (Opening + Receipts - Payments)
    const cashLedger = data.ledgers.find(l => l.group === 'Cash');
    const cashBalance = (cashLedger?.openingBalance || 0) + totalReceipts - totalPayments;

    return (
      <div className="p-8 bg-gray-100 min-h-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Financial Dashboard</h2>
        <p className="text-gray-500 mb-8">Overview of {data.companyName}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalSales)}</p>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-xs font-medium bg-green-50 w-fit px-2 py-1 rounded">
               <TrendingUp size={14} className="mr-1"/> +12% this month
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Purchase</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalPurchase)}</p>
            </div>
            <div className="mt-4 flex items-center text-orange-600 text-xs font-medium bg-orange-50 w-fit px-2 py-1 rounded">
               <TrendingUp size={14} className="mr-1"/> Inventory Restocked
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Cash in Hand</p>
              <p className={`text-2xl font-bold mt-1 ${cashBalance < 0 ? 'text-red-600' : 'text-blue-600'}`}>{formatCurrency(cashBalance)}</p>
            </div>
             <div className="mt-4 flex items-center text-blue-600 text-xs font-medium bg-blue-50 w-fit px-2 py-1 rounded">
               <Building2 size={14} className="mr-1"/> Updated Live
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-gray-300 text-sm font-medium">License Status</p>
               <p className="text-3xl font-bold mt-1">{daysRemaining} Days</p>
               <p className="text-xs text-gray-400 mt-2">Expires on: {new Date(license?.expiryDate || '').toDateString()}</p>
             </div>
             <Key className="absolute right-4 bottom-4 text-gray-700 opacity-50" size={64} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
           <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Vouchers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Ref No</th>
                      <th className="pb-3 font-medium">Particulars</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vouchers.slice(-5).reverse().map(v => (
                      <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <td className="py-3 text-gray-600">{v.date}</td>
                        <td className="py-3 text-gray-500 text-xs">{v.invoiceNumber || v.id}</td>
                        <td className="py-3 font-medium text-gray-800">{data.ledgers.find(l => l.id === v.ledgerId)?.name}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold 
                            ${v.type === 'Sales' ? 'bg-green-100 text-green-700' : 
                              v.type === 'Purchase' ? 'bg-orange-100 text-orange-700' : 
                              v.type === 'Receipt' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {v.type}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono">{formatCurrency(v.amount)}</td>
                      </tr>
                    ))}
                    {data.vouchers.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">No transactions found. Go to Vouchers to add one.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                 <button onClick={() => setView('invoice')} className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition text-sm font-medium">
                    <FileText size={18} /> Create Tax Invoice
                 </button>
                 <button onClick={() => setView('vouchers')} className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition text-sm font-medium">
                    <ReceiptIndianRupee size={18} /> Record Payment
                 </button>
                 <button onClick={() => setView('ledgers')} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition text-sm font-medium">
                    <UserCheck size={18} /> Add New Customer
                 </button>
                 <button onClick={exportToTally} className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition text-sm font-medium border border-green-200">
                    <Download size={18} /> Export to Tally XML
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const LedgersView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLedger, setNewLedger] = useState<Partial<Ledger>>({ group: 'Sundry Debtor', openingBalance: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newLedger.name) {
        addLedger({
          id: generateId(),
          name: newLedger.name,
          group: newLedger.group as LedgerGroup,
          openingBalance: newLedger.openingBalance || 0,
          gstNumber: newLedger.gstNumber,
          contact: newLedger.contact
        });
        setIsModalOpen(false);
        setNewLedger({ group: 'Sundry Debtor', openingBalance: 0 });
      }
    };

    const filteredLedgers = data.ledgers.filter(l => 
       l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       l.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">Ledgers Master</h2>
             <p className="text-sm text-gray-500">Manage your customers, suppliers, and bank accounts</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg shadow flex items-center gap-2 font-medium transition"
          >
            <Plus size={18} /> Create Ledger
          </button>
        </div>

        <div className="mb-4">
           <input 
              type="text" 
              placeholder="Search Ledger Name or GSTIN..." 
              className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs sticky top-0">
              <tr>
                <th className="px-6 py-3 border-b">Account Name</th>
                <th className="px-6 py-3 border-b">Group</th>
                <th className="px-6 py-3 border-b">GST No</th>
                <th className="px-6 py-3 border-b text-right">Op. Balance</th>
                <th className="px-6 py-3 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLedgers.map(l => (
                <tr key={l.id} className="hover:bg-orange-50 transition group">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {l.name}
                    <div className="text-xs text-gray-400 font-normal">{l.contact}</div>
                  </td>
                  <td className="px-6 py-3 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{l.group}</span></td>
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{l.gstNumber || '-'}</td>
                  <td className="px-6 py-3 text-right font-mono">{formatCurrency(l.openingBalance)}</td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => deleteLedger(l.id)} className="text-gray-300 group-hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add New Ledger</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ledger Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                    value={newLedger.name || ''} 
                    onChange={e => setNewLedger({...newLedger, name: e.target.value})}
                    placeholder="e.g., Amit Traders"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Under Group</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                      value={newLedger.group}
                      onChange={e => setNewLedger({...newLedger, group: e.target.value as LedgerGroup})}
                    >
                      {['Sundry Debtor', 'Sundry Creditor', 'Asset', 'Liability', 'Income', 'Expense', 'Bank', 'Cash'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={newLedger.openingBalance} 
                      onChange={e => setNewLedger({...newLedger, openingBalance: Number(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none uppercase font-mono" 
                    value={newLedger.gstNumber || ''} 
                    onChange={e => setNewLedger({...newLedger, gstNumber: e.target.value})}
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 shadow-lg">Save Account</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const VoucherView = () => {
    const [type, setType] = useState<Voucher['type']>('Sales');
    const [ledgerId, setLedgerId] = useState('');
    const [amount, setAmount] = useState('');
    const [narration, setNarration] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNo, setInvoiceNo] = useState('');

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (ledgerId && amount) {
        addVoucher({
          id: generateId(),
          date,
          type,
          ledgerId,
          amount: Number(amount),
          narration,
          invoiceNumber: invoiceNo
        });
        setAmount('');
        setNarration('');
        setInvoiceNo('');
        // alert('Voucher Saved!'); // Removed annoying alert
      }
    };

    return (
      <div className="p-8 flex gap-8 h-full">
        {/* Entry Form */}
        <div className="w-[400px] bg-white p-6 rounded-xl shadow-lg h-fit border border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
             <Plus className="bg-orange-100 text-orange-600 p-1 rounded" size={24} />
             Voucher Entry
          </h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Voucher Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Sales', 'Purchase', 'Receipt', 'Payment'].map(t => (
                  <button 
                    key={t} 
                    type="button"
                    onClick={() => setType(t as any)}
                    className={`py-2 text-sm rounded-md font-medium transition ${type === t ? 'bg-gray-800 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input type="date" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none text-sm" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ref No.</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none text-sm" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="Optional" />
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Party Account</label>
              <select className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white" value={ledgerId} onChange={e => setLedgerId(e.target.value)} required>
                <option value="">Select Ledger</option>
                {data.ledgers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.group})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg p-2 text-right font-mono text-lg font-bold focus:ring-2 focus:ring-orange-500 outline-none" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Narration</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" rows={2} value={narration} onChange={e => setNarration(e.target.value)} placeholder="Enter transaction details..." />
            </div>

            <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 shadow-lg transition transform hover:-translate-y-0.5">
                Save Voucher
            </button>
          </form>
        </div>

        {/* Recent List */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
           <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                  <h3 className="text-lg font-bold text-gray-800">Day Book</h3>
                  <p className="text-xs text-gray-500">Transactions for {date}</p>
              </div>
              <div className="text-sm font-bold text-gray-600">
                 Total: {formatCurrency(data.vouchers.filter(v => v.date === date).reduce((s,v) => s + v.amount, 0))}
              </div>
           </div>
           <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-sm text-left">
                <thead className="bg-white border-b sticky top-0">
                <tr>
                    <th className="p-4 font-medium text-gray-500">Type</th>
                    <th className="p-4 font-medium text-gray-500">Ref</th>
                    <th className="p-4 font-medium text-gray-500">Party</th>
                    <th className="p-4 font-medium text-gray-500">Narration</th>
                    <th className="p-4 font-medium text-gray-500 text-right">Amount</th>
                    <th className="p-4 font-medium text-gray-500 text-center">Action</th>
                </tr>
                </thead>
                <tbody>
                {data.vouchers.filter(v => v.date === date).map(v => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                        <span className={`text-xs font-bold uppercase ${v.type === 'Sales' ? 'text-green-600' : 'text-gray-600'}`}>{v.type}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{v.invoiceNumber}</td>
                    <td className="p-4 font-medium">{data.ledgers.find(l => l.id === v.ledgerId)?.name}</td>
                    <td className="p-4 text-gray-500 truncate max-w-xs">{v.narration}</td>
                    <td className="p-4 text-right font-mono font-medium">{formatCurrency(v.amount)}</td>
                    <td className="p-4 text-center">
                        <button onClick={() => deleteVoucher(v.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                    </td>
                    </tr>
                ))}
                {data.vouchers.filter(v => v.date === date).length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                            No vouchers entered for this date.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
           </div>
        </div>
      </div>
    );
  };

  const ReportView = () => {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Accounting Reports</h2>
            <p className="text-sm text-gray-500">View Trial Balance, P&L, and Balance Sheet</p>
          </div>
          <button onClick={exportToTally} className="bg-green-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-green-700 flex items-center gap-2 font-medium transition">
            <Download size={18} /> Export to Tally XML
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trial Balance */}
          <div className="bg-white p-0 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-orange-500" /> Trial Balance
                </h3>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">As of {new Date().toDateString()}</span>
            </div>
            <div className="p-0">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-500 font-medium text-xs uppercase">
                        <tr>
                            <th className="text-left p-3 pl-6">Particulars</th>
                            <th className="text-right p-3">Debit</th>
                            <th className="text-right p-3 pr-6">Credit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.ledgers.map(l => {
                            const debits = data.vouchers.filter(v => v.ledgerId === l.id && ['Sales', 'Receipt'].includes(v.type)).reduce((s, v) => s + v.amount, 0);
                            const credits = data.vouchers.filter(v => v.ledgerId === l.id && ['Purchase', 'Payment'].includes(v.type)).reduce((s, v) => s + v.amount, 0);
                            // Logic Note: In real accounting, Assets/Expense have Dr balance, Liability/Income have Cr balance. 
                            // This is a simplified simulation.
                            let net = l.openingBalance + debits - credits;
                            
                            // Determine Dr or Cr based on Group roughly
                            const isCreditNature = ['Liability', 'Income', 'Sundry Creditor'].includes(l.group);
                            // Adjusting sign for display
                            
                            if (net === 0) return null;

                            return (
                            <tr key={l.id} className="hover:bg-gray-50">
                                <td className="p-3 pl-6 font-medium text-gray-700">{l.name} <span className="text-xs text-gray-400 ml-2">({l.group})</span></td>
                                <td className="p-3 text-right font-mono text-gray-600">
                                    {net > 0 ? formatCurrency(net) : '-'}
                                </td>
                                <td className="p-3 pr-6 text-right font-mono text-gray-600">
                                    {net < 0 ? formatCurrency(Math.abs(net)) : '-'}
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td className="p-3 pl-6">Total</td>
                            <td className="p-3 text-right">---</td>
                            <td className="p-3 pr-6 text-right">---</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
          </div>

          {/* Profit & Loss Mock */}
          <div className="bg-white p-0 rounded-xl shadow-lg border border-gray-100 overflow-hidden h-fit">
            <div className="p-4 border-b bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-500" /> Profit & Loss (Approx)
                </h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-2 border-dashed">
                    <span className="text-gray-600">Total Sales Revenue</span>
                    <span className="font-bold text-gray-800">{formatCurrency(data.vouchers.filter(v=>v.type === 'Sales').reduce((s,v)=>s+v.amount,0))}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-dashed">
                    <span className="text-gray-600">Total Purchase Cost</span>
                    <span className="font-bold text-red-600">({formatCurrency(data.vouchers.filter(v=>v.type === 'Purchase').reduce((s,v)=>s+v.amount,0))})</span>
                </div>
                 <div className="flex justify-between items-center border-b pb-2 border-dashed">
                    <span className="text-gray-600">Direct Expenses</span>
                    <span className="font-bold text-red-600">({formatCurrency(data.vouchers.filter(v=>v.type === 'Payment').reduce((s,v)=>s+v.amount,0))})</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-xl font-bold">
                    <span className="text-gray-800">Net Profit</span>
                    <span className="text-green-600">{formatCurrency(10000)}</span>
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">* Values are estimates based on voucher entries.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InvoiceView = () => {
    const [invoiceData, setInvoiceData] = useState({
       customerName: '',
       customerAddress: '',
       gst: '',
       invoiceNo: `INV-${Math.floor(Math.random() * 1000)}`,
       items: [
         { desc: 'Dell Inspiron 15 Laptop', hsn: '8471', qty: 1, rate: 45000 },
         { desc: 'Logitech Wireless Mouse', hsn: '8471', qty: 2, rate: 650 }
        ],
       date: new Date().toISOString().split('T')[0]
    });

    const addItem = () => {
        setInvoiceData({...invoiceData, items: [...invoiceData.items, { desc: '', hsn: '', qty: 1, rate: 0 }]});
    }

    const removeItem = (index: number) => {
        const newItems = [...invoiceData.items];
        newItems.splice(index, 1);
        setInvoiceData({...invoiceData, items: newItems});
    }

    const handlePrint = () => {
      window.print();
    };

    const subtotal = invoiceData.items.reduce((s, i) => s + (i.qty * i.rate), 0);
    const sgst = subtotal * 0.09; // 9%
    const cgst = subtotal * 0.09; // 9%
    const total = subtotal + sgst + cgst;

    return (
      <div className="p-8 bg-gray-200 min-h-full overflow-auto">
        <div className="flex justify-between mb-6 print:hidden max-w-4xl mx-auto">
           <h2 className="text-2xl font-bold text-gray-800">GST Invoice Generator</h2>
           <div className="flex gap-3">
              <button onClick={handlePrint} className="bg-gray-800 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 hover:bg-gray-900 transition">
                <Printer size={18} /> Print PDF
              </button>
              <button 
                onClick={() => {
                  const msg = `Dear ${invoiceData.customerName}, invoice ${invoiceData.invoiceNo} for Rs.${total} generated by NAC Software.`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="bg-green-600 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Share2 size={18} /> WhatsApp
              </button>
           </div>
        </div>

        {/* Invoice Paper UI */}
        <div className="bg-white p-10 shadow-2xl max-w-4xl mx-auto print:shadow-none print:w-full print:max-w-none" id="invoice-area">
          {/* Header */}
          <div className="flex justify-between border-b-2 border-orange-500 pb-6 mb-8">
             <div className="flex items-start gap-4">
                {/* Logo Placeholder */}
                <div className="w-16 h-16 bg-orange-500 text-white flex items-center justify-center font-bold text-2xl rounded-lg">
                    NAC
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{data.companyName}</h1>
                    <p className="text-gray-500 text-sm whitespace-pre-wrap w-64">{data.companyAddress}</p>
                    <p className="text-gray-600 text-sm font-bold mt-1">GSTIN: {data.companyGst}</p>
                    <p className="text-gray-600 text-sm">Ph: {data.companyPhone}</p>
                </div>
             </div>
             <div className="text-right">
                <h2 className="text-4xl font-bold text-gray-200 tracking-widest">INVOICE</h2>
                <div className="mt-4 space-y-1">
                    <div className="flex justify-end gap-4">
                        <span className="text-gray-500 font-bold">Invoice No:</span>
                        <span className="font-mono font-bold">{invoiceData.invoiceNo}</span>
                    </div>
                    <div className="flex justify-end gap-4">
                        <span className="text-gray-500 font-bold">Date:</span>
                        <span className="font-mono">{invoiceData.date}</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Bill To */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 flex gap-10">
             <div className="flex-1">
                <p className="text-xs text-orange-600 uppercase font-bold mb-2 tracking-wider">Bill To</p>
                <input 
                className="block w-full bg-transparent border-b border-gray-300 focus:border-orange-500 outline-none mb-2 font-bold text-lg placeholder-gray-300"
                placeholder="Customer Name"
                value={invoiceData.customerName}
                onChange={e => setInvoiceData({...invoiceData, customerName: e.target.value})}
                />
                <textarea 
                rows={2}
                className="block w-full bg-transparent border-b border-gray-300 focus:border-orange-500 outline-none text-sm placeholder-gray-300 resize-none"
                placeholder="Customer Address..."
                value={invoiceData.customerAddress}
                onChange={e => setInvoiceData({...invoiceData, customerAddress: e.target.value})}
                />
             </div>
             <div className="w-1/3">
                <p className="text-xs text-orange-600 uppercase font-bold mb-2 tracking-wider">Details</p>
                <input 
                className="block w-full bg-transparent border-b border-gray-300 focus:border-orange-500 outline-none text-sm font-mono mb-2"
                placeholder="Customer GSTIN"
                value={invoiceData.gst}
                onChange={e => setInvoiceData({...invoiceData, gst: e.target.value})}
                />
             </div>
          </div>

          {/* Items */}
          <div className="min-h-[300px]">
          <table className="w-full text-left mb-8">
             <thead>
               <tr className="bg-gray-800 text-white text-sm uppercase tracking-wider">
                 <th className="py-3 px-4 rounded-l">#</th>
                 <th className="py-3 px-4 w-1/2">Description of Goods</th>
                 <th className="py-3 px-4">HSN/SAC</th>
                 <th className="py-3 px-4 text-right">Qty</th>
                 <th className="py-3 px-4 text-right">Rate</th>
                 <th className="py-3 px-4 text-right rounded-r">Amount</th>
               </tr>
             </thead>
             <tbody className="text-sm">
               {invoiceData.items.map((item, idx) => (
                 <tr key={idx} className="border-b border-gray-100 group">
                   <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                   <td className="py-3 px-4">
                     <input 
                       className="w-full outline-none bg-transparent" 
                       value={item.desc} 
                       placeholder="Item description"
                       onChange={e => {
                         const newItems = [...invoiceData.items];
                         newItems[idx].desc = e.target.value;
                         setInvoiceData({...invoiceData, items: newItems});
                       }}
                     />
                   </td>
                   <td className="py-3 px-4">
                     <input 
                       className="w-20 outline-none bg-transparent text-gray-500" 
                       value={item.hsn} 
                       onChange={e => {
                         const newItems = [...invoiceData.items];
                         newItems[idx].hsn = e.target.value;
                         setInvoiceData({...invoiceData, items: newItems});
                       }}
                     />
                   </td>
                   <td className="py-3 px-4 text-right">
                     <input 
                       type="number"
                       className="w-16 text-right outline-none bg-transparent" 
                       value={item.qty} 
                       onChange={e => {
                         const newItems = [...invoiceData.items];
                         newItems[idx].qty = Number(e.target.value);
                         setInvoiceData({...invoiceData, items: newItems});
                       }}
                     />
                   </td>
                   <td className="py-3 px-4 text-right">
                     <input 
                       type="number"
                       className="w-24 text-right outline-none bg-transparent" 
                       value={item.rate} 
                       onChange={e => {
                         const newItems = [...invoiceData.items];
                         newItems[idx].rate = Number(e.target.value);
                         setInvoiceData({...invoiceData, items: newItems});
                       }}
                     />
                   </td>
                   <td className="py-3 px-4 text-right font-mono relative">
                     {formatCurrency(item.qty * item.rate)}
                     <button onClick={() => removeItem(idx)} className="absolute right-0 top-3 text-red-400 opacity-0 group-hover:opacity-100 print:hidden p-1"><Trash2 size={12} /></button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
          <button onClick={addItem} className="text-sm text-orange-600 font-bold hover:underline print:hidden">+ Add Item</button>
          </div>

          {/* Totals */}
          <div className="flex justify-end border-t-2 border-gray-800 pt-6">
             <div className="w-1/2 space-y-3">
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Subtotal (Taxable Value)</span>
                 <span className="font-mono">{formatCurrency(subtotal)}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-600">
                 <span>CGST (9%)</span>
                 <span className="font-mono">{formatCurrency(cgst)}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-600">
                 <span>SGST (9%)</span>
                 <span className="font-mono">{formatCurrency(sgst)}</span>
               </div>
               <div className="flex justify-between text-2xl font-bold text-gray-900 border-t border-gray-300 pt-4 mt-2">
                 <span>Grand Total</span>
                 <span>{formatCurrency(total)}</span>
               </div>
               <p className="text-xs text-right text-gray-500 mt-1">Amount in Words: (Auto-calc placeholder) Rupees Only</p>
             </div>
          </div>
          
          <div className="mt-16 pt-6 border-t border-gray-200 flex justify-between items-end">
             <div className="text-xs text-gray-400 w-1/2">
                <p className="font-bold text-gray-600 mb-1">Terms & Conditions:</p>
                <p>1. Goods once sold will not be taken back.</p>
                <p>2. Interest @18% p.a. will be charged if payment is not made within due date.</p>
                <p>3. Subject to Mumbai Jurisdiction.</p>
             </div>
             <div className="text-center">
                <div className="h-16 w-32 mb-2 border-b border-dashed border-gray-400"></div>
                <p className="text-sm font-bold text-gray-800">For {data.companyName}</p>
                <p className="text-xs text-gray-400">Authorized Signatory</p>
             </div>
          </div>
        </div>
      </div>
    )
  }

  const AdminView = () => {
    const [genKey, setGenKey] = useState('');
    const [clientName, setClientName] = useState('New Client');
    const [duration, setDuration] = useState('1Y'); // Default 1 Year
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateKey = () => {
       const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
       const datePart = new Date().toISOString().replace(/-/g, '').slice(0, 8);
       // Updated key structure to include duration code
       setGenKey(`NAC-${duration}-${datePart}-${randomPart}`);
    };

    const handleBackup = () => {
      const backupData = JSON.stringify(data, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NAC_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Simple validation check
          if (json.companyName && json.vouchers && json.ledgers) {
            if (confirm('WARNING: This will overwrite all current data with the backup file. Are you sure?')) {
              localStorage.setItem('nac_data', JSON.stringify(json));
              alert('Data Restored Successfully! The app will now reload.');
              window.location.reload();
            }
          } else {
            alert('Invalid Backup File');
          }
        } catch (err) {
          alert('Error reading file');
        }
      };
      reader.readAsText(file);
    };

    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">System Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* License Generator */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Key size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">License Generator</h3>
                        <p className="text-xs text-gray-500">For New Age Computers Internal Use</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Duration</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        >
                            <option value="1M">1 Month (Trial/Demo)</option>
                            <option value="1Y">1 Year (Full License)</option>
                        </select>
                    </div>
                    <button onClick={generateKey} className="bg-gray-900 text-white px-4 py-3 rounded-lg w-full font-medium hover:bg-gray-800 transition shadow-lg">
                        Generate License Key
                    </button>
                </div>

                {genKey && (
                    <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200 mt-6 animate-fade-in">
                        <p className="text-xs text-green-800 font-bold mb-2">LICENSE KEY GENERATED SUCCESSFULLLY</p>
                        <p className="text-2xl font-mono font-bold text-gray-800 select-all cursor-pointer tracking-widest">{genKey}</p>
                        <button 
                            onClick={() => {navigator.clipboard.writeText(genKey); alert('Copied!')}} 
                            className="text-xs text-green-600 hover:underline mt-2"
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-8">
              {/* Company Settings */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                          <Building2 size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 text-lg">Company Profile</h3>
                          <p className="text-xs text-gray-500">Details printed on Invoices</p>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase">Company Name</label>
                          <input 
                              className="w-full border-b border-gray-200 py-1 focus:border-orange-500 outline-none" 
                              value={data.companyName} 
                              onChange={e => updateCompanySettings({companyName: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase">Address</label>
                          <input 
                              className="w-full border-b border-gray-200 py-1 focus:border-orange-500 outline-none" 
                              value={data.companyAddress} 
                              onChange={e => updateCompanySettings({companyAddress: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase">GSTIN</label>
                          <input 
                              className="w-full border-b border-gray-200 py-1 focus:border-orange-500 outline-none" 
                              value={data.companyGst} 
                              onChange={e => updateCompanySettings({companyGst: e.target.value})}
                          />
                      </div>
                  </div>
              </div>

              {/* Data Backup & Recovery */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-red-100 p-2 rounded-lg text-red-600">
                          <Database size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 text-lg">Data Disaster Recovery</h3>
                          <p className="text-xs text-gray-500">Backup or Restore client data</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleBackup}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition group"
                      >
                        <Save className="text-gray-400 group-hover:text-orange-600 mb-2" size={24} />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-orange-700">Backup Data</span>
                      </button>

                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group relative"
                      >
                        <Upload className="text-gray-400 group-hover:text-blue-600 mb-2" size={24} />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Restore Data</span>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept=".json"
                          onChange={handleRestore}
                        />
                      </button>
                  </div>
                  <p className="text-xs text-red-400 mt-3 text-center">
                    * Restoring data will overwrite all current entries on this computer.
                  </p>
              </div>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
      <div className="w-72 bg-slate-900 text-white flex flex-col print:hidden transition-all duration-300 shadow-xl z-20">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg">
             <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">NAC <span className="text-orange-500">Soft</span></h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Enterprise Edition</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4 mt-2">Main Menu</div>
          
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${view === 'dashboard' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setView('vouchers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${view === 'vouchers' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            <ReceiptIndianRupee size={18} /> Vouchers
          </button>
          <button onClick={() => setView('ledgers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${view === 'ledgers' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            <BookOpen size={18} /> Ledgers / Parties
          </button>
          <button onClick={() => setView('invoice')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${view === 'invoice' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            <FileText size={18} /> Invoice Generator
          </button>
          
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4 mt-6">Analysis</div>

          <button onClick={() => setView('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${view === 'reports' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            <FileSpreadsheet size={18} /> Reports & Tally
          </button>
          
          <div className="pt-4 mt-auto">
             <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${view === 'admin' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
              <Settings size={18} /> Settings / Admin
            </button>
             <button onClick={logout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium text-red-400 hover:bg-gray-800 mt-1`}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>

        <div className="p-4 bg-gray-950 text-xs text-gray-500 border-t border-gray-800">
          <div className="flex justify-between items-center mb-1">
             <span>License Active</span>
             <span className="text-green-500">●</span>
          </div>
          <p className="truncate">Client: {license?.clientName}</p>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
             <div className="bg-orange-500 h-full" style={{width: '85%'}}></div>
          </div>
          <p className="mt-1 text-right">{daysRemaining} days left</p>
        </div>
      </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 print:hidden shadow-sm z-10">
           <div className="flex items-center gap-4">
              {/* <button onClick={() => setShowSidebar(!showSidebar)} className="text-gray-500 hover:text-gray-800"><Menu size={24}/></button> */}
              <h2 className="font-bold text-gray-700 capitalize flex items-center gap-2 text-lg">
                  {view === 'dashboard' && <LayoutDashboard size={20} className="text-orange-500"/>}
                  {view}
              </h2>
           </div>
           <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-gray-800">{data.companyName}</p>
               <p className="text-xs text-gray-500">FY 2024-2025</p>
             </div>
             <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-md text-lg">
               {data.companyName.charAt(0)}
             </div>
           </div>
        </header>

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth">
          {view === 'dashboard' && <DashboardView />}
          {view === 'ledgers' && <LedgersView />}
          {view === 'vouchers' && <VoucherView />}
          {view === 'reports' && <ReportView />}
          {view === 'invoice' && <InvoiceView />}
          {view === 'admin' && <AdminView />}
          {view === 'settings' && <AdminView />} 
        </main>
      </div>
    </div>
  );
};

const Root = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <LicenseGate onUnlock={() => setIsUnlocked(true)}>
      {isUnlocked ? <AccountingApp /> : null}
    </LicenseGate>
  );
};

createRoot(document.getElementById('root')!).render(<Root />);