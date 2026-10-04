/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { InvoiceData } from './types/invoice';
import {
  createBlankInvoice,
  defaultFreelancerInvoice,
  sampleRetailInvoice,
  sampleFreelanceWriterInvoice,
} from './utils/sampleData';
import { calculateInvoiceTotals, formatINR } from './utils/calculations';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import {
  Printer,
  RotateCcw,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Eye,
  Edit3,
  FileSpreadsheet,
} from 'lucide-react';

const STORAGE_KEY_BUSINESS = 'non_gst_business_profile_v1';
const STORAGE_KEY_INVOICE = 'non_gst_active_invoice_v1';

// Helper to check and purge stale demo data from previous sessions
const isStaleDemoData = (raw: string | null): boolean => {
  if (!raw) return false;
  return (
    raw.includes('Apex Creative Studio') ||
    raw.includes('Baru (Manish') ||
    raw.includes('Manish Kumar') ||
    raw.includes('rahul@apexcreatives') ||
    raw.includes('Manish@apexcreatives') ||
    raw.includes('manishkumar@okhdfcbank')
  );
};

export default function App() {
  // Load initial data from localStorage if available, otherwise initialize with clean blank template
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => {
    try {
      const rawInvoice = localStorage.getItem(STORAGE_KEY_INVOICE);
      const rawBusiness = localStorage.getItem(STORAGE_KEY_BUSINESS);

      // Purge stale cached demo strings if found
      if (isStaleDemoData(rawInvoice)) {
        localStorage.removeItem(STORAGE_KEY_INVOICE);
      }
      if (isStaleDemoData(rawBusiness)) {
        localStorage.removeItem(STORAGE_KEY_BUSINESS);
      }

      const savedInvoice = !isStaleDemoData(rawInvoice) ? rawInvoice : null;
      const savedBusiness = !isStaleDemoData(rawBusiness) ? rawBusiness : null;

      const blank = createBlankInvoice('INV-001');

      if (savedInvoice) {
        const parsed = JSON.parse(savedInvoice);
        return {
          ...blank,
          ...parsed,
          business: {
            ...blank.business,
            ...(savedBusiness ? JSON.parse(savedBusiness) : {}),
            ...parsed.business,
            contactNumber: (parsed.business?.contactNumber || '').replace(/\D/g, '').slice(0, 10),
            panNumber: parsed.business?.panNumber || '',
            udyamNumber: parsed.business?.udyamNumber || '',
            upiPayeeName: parsed.business?.upiPayeeName || parsed.business?.businessName || '',
          },
          meta: {
            ...blank.meta,
            ...parsed.meta,
            paymentMode: parsed.meta?.paymentMode || 'both',
            showPaymentDetails: parsed.meta?.showPaymentDetails ?? true,
          },
        };
      }

      if (savedBusiness) {
        const parsedBiz = JSON.parse(savedBusiness);
        return {
          ...blank,
          business: {
            ...blank.business,
            ...parsedBiz,
            contactNumber: (parsedBiz.contactNumber || '').replace(/\D/g, '').slice(0, 10),
            panNumber: parsedBiz.panNumber || '',
            udyamNumber: parsedBiz.udyamNumber || '',
            upiPayeeName: parsedBiz.upiPayeeName || parsedBiz.businessName || '',
          },
        };
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }

    return createBlankInvoice('INV-001');
  });

  // UI States
  const [zoomScale, setZoomScale] = useState<number>(0.78);
  const [activeTabMobile, setActiveTabMobile] = useState<'form' | 'preview'>('form');
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto-sync invoice state and business profile to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVOICE, JSON.stringify(invoiceData));
      // Immediately sync user's business profile so manual edits persist across refresh
      if (invoiceData.business) {
        localStorage.setItem(STORAGE_KEY_BUSINESS, JSON.stringify(invoiceData.business));
      }
    } catch (err) {
      console.error('Error saving active invoice:', err);
    }
  }, [invoiceData]);

  // Handle auto-fit zoom based on container width
  const handleAutoFit = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth - 48; // padding
      const a4WidthPx = 794;
      const calculatedScale = Math.min(1.1, Math.max(0.45, containerWidth / a4WidthPx));
      setZoomScale(Number(calculatedScale.toFixed(2)));
    }
  };

  useEffect(() => {
    handleAutoFit();
    window.addEventListener('resize', handleAutoFit);
    return () => window.removeEventListener('resize', handleAutoFit);
  }, []);

  // Save Business Profile to localStorage explicitly
  const handleSaveBusinessProfile = () => {
    try {
      localStorage.setItem(STORAGE_KEY_BUSINESS, JSON.stringify(invoiceData.business));
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    } catch (e) {
      console.error('Failed to save business profile:', e);
    }
  };

  // Reset Form for next customer
  const handleResetForNextCustomer = (fullReset: boolean = false) => {
    setShowResetModal(false);
    const today = new Date().toISOString().split('T')[0];

    // Compute next invoice number
    const currentNum = invoiceData.meta.invoiceNumber || 'INV-001';
    const match = currentNum.match(/^(.*?)(\d+)$/);
    let nextInvoiceNumber = 'INV-002';
    if (match) {
      const prefix = match[1];
      const digits = match[2];
      nextInvoiceNumber = `${prefix}${(parseInt(digits, 10) + 1).toString().padStart(digits.length, '0')}`;
    }

    if (fullReset) {
      // Full reset: completely blank fields, no demo names
      const blankInvoice = createBlankInvoice('INV-001');
      setInvoiceData(blankInvoice);
      localStorage.setItem(STORAGE_KEY_INVOICE, JSON.stringify(blankInvoice));
      localStorage.setItem(STORAGE_KEY_BUSINESS, JSON.stringify(blankInvoice.business));
      return;
    }

    // Keep user's current business profile intact; only wipe client information & items
    setInvoiceData((prev) => {
      const nextInv: InvoiceData = {
        ...prev,
        business: {
          ...prev.business, // Preserves the user's business profile!
        },
        client: {
          clientName: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
        },
        items: [
          {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            rate: 0,
            unit: 'pcs',
          },
        ],
        meta: {
          ...prev.meta,
          invoiceNumber: nextInvoiceNumber,
          invoiceDate: today,
          discountValue: 0,
          additionalChargesAmount: 0,
        },
      };

      localStorage.setItem(STORAGE_KEY_INVOICE, JSON.stringify(nextInv));
      localStorage.setItem(STORAGE_KEY_BUSINESS, JSON.stringify(prev.business));
      return nextInv;
    });
  };

  // Load Preset
  const handleLoadPreset = (preset: 'freelancer' | 'retail' | 'writer') => {
    if (preset === 'retail') {
      setInvoiceData(sampleRetailInvoice);
    } else if (preset === 'writer') {
      setInvoiceData(sampleFreelanceWriterInvoice);
    } else {
      // Freelance Tech clean template
      setInvoiceData(createBlankInvoice(invoiceData.meta.invoiceNumber || 'INV-001'));
    }
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Copy WhatsApp / Text Summary
  const handleCopySummary = () => {
    const totals = calculateInvoiceTotals(invoiceData);
    const paymentMode = invoiceData.meta.paymentMode || 'both';
    const isPaymentShown = invoiceData.meta.showPaymentDetails !== false && paymentMode !== 'cash';
    const cleanUpi = (invoiceData.business.upiId || '').trim();
    const showUpi = isPaymentShown && (paymentMode === 'both' || paymentMode === 'upi') && cleanUpi;
    const showBank = isPaymentShown && (paymentMode === 'both' || paymentMode === 'bank');

    let paymentInfoText = '';
    if (showUpi) {
      paymentInfoText += `\nPay via UPI: ${cleanUpi}`;
      if (invoiceData.business.upiPayeeName) {
        paymentInfoText += ` (${invoiceData.business.upiPayeeName})`;
      }
    }
    if (showBank && invoiceData.business.accountNumber) {
      paymentInfoText += `\nBank A/C: ${invoiceData.business.accountNumber} (IFSC: ${invoiceData.business.ifscCode}, ${invoiceData.business.bankName})`;
    }
    if (!isPaymentShown) {
      paymentInfoText += '\nPayment Mode: Cash / In-person settlement';
    }

    const text = `*Invoice / Bill: ${invoiceData.meta.invoiceNumber}*
From: ${invoiceData.business.businessName || 'Merchant'}
Billed To: ${invoiceData.client.clientName || 'Customer'}
Date: ${invoiceData.meta.invoiceDate}
Total Amount: ₹${formatINR(totals.grandTotal)}${paymentInfoText}

*Statutory Notice:* This is a Non-GST Bill / Invoice issued by an unregistered dealer / composition scheme dealer under GST rules. No tax is charged.
Thank you for your business!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  const totals = calculateInvoiceTotals(invoiceData);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  InvoiceGen
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                  Non-GST / Bill of Supply
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                For Small Businesses, Freelancers &amp; Unregistered Vendors
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="Clear or start invoice for next customer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Next Customer</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="Copy bill details for WhatsApp"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Copy Text</span>
                </>
              )}
            </button>

            {/* Single Prominent Print / Download PDF Action Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle Tabs (Only visible on small screens) */}
        <div className="lg:hidden border-t border-slate-200 flex text-xs font-semibold text-slate-600 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTabMobile('form')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTabMobile === 'form'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Invoice Form</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMobile('preview')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTabMobile === 'preview'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Live A4 Preview (₹{formatINR(totals.grandTotal)})</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          {/* LEFT SIDE: Invoice Input Form */}
          <div
            className={`lg:col-span-6 xl:col-span-5 ${
              activeTabMobile === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Invoice Builder
                </h1>
                <p className="text-xs text-slate-500">
                  Update details below; live A4 preview updates in real time.
                </p>
              </div>
            </div>

            <InvoiceForm
              data={invoiceData}
              onChange={setInvoiceData}
              onReset={() => setShowResetModal(true)}
              onSaveBusinessProfile={handleSaveBusinessProfile}
              onLoadPreset={handleLoadPreset}
              isSavedToast={isSavedToast}
            />
          </div>

          {/* RIGHT SIDE: Live A4 Invoice Preview */}
          <div
            className={`lg:col-span-6 xl:col-span-7 flex flex-col items-center ${
              activeTabMobile === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Sticky Preview Controls Bar */}
            <div className="w-full bg-white rounded-xl border border-slate-200 p-2.5 mb-4 shadow-xs flex items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live A4 Sheet Preview
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (210mm &times; 297mm)
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.max(0.4, Number((s - 0.05).toFixed(2))))}
                  className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-medium text-slate-700 w-12 text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.min(1.25, Number((s + 0.05).toFixed(2))))}
                  className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleAutoFit}
                  className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
                  title="Fit to Screen"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Fit Screen</span>
                </button>
              </div>
            </div>

            {/* A4 Paper Scaled Container */}
            <div
              ref={previewContainerRef}
              className="w-full flex justify-center overflow-x-auto pb-12 custom-scrollbar"
            >
              <InvoicePreview data={invoiceData} scale={zoomScale} />
            </div>
          </div>
        </div>
      </main>

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Invoice / Next Customer?
                </h3>
                <p className="text-xs text-slate-500">
                  Choose how you would like to prepare your next bill.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleResetForNextCustomer(false)}
                className="w-full text-left p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 transition-colors"
              >
                <p className="text-xs font-bold text-indigo-900">
                  Clear Client &amp; Items (Keep Business Profile)
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Increments invoice number, clears client details and item list. Your shop name, address, and bank details stay intact.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleResetForNextCustomer(true)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <p className="text-xs font-bold text-slate-800">
                  Full Reset (Clear Everything to Default)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Restores a completely blank template without any previous details.
                </p>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
