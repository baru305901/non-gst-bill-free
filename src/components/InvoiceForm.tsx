import React, { useRef } from 'react';
import { InvoiceData, LineItem, PaymentMode } from '../types/invoice';
import { calculateInvoiceTotals, formatINR } from '../utils/calculations';
import {
  Building2,
  User,
  Plus,
  Trash2,
  Upload,
  Percent,
  CreditCard,
  FileText,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Palette,
  QrCode,
  Landmark,
  Banknote,
  Layers,
  EyeOff,
  Check,
} from 'lucide-react';
import { THEMES } from '../utils/theme';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onReset: () => void;
  onSaveBusinessProfile: () => void;
  onLoadPreset: (preset: 'freelancer' | 'retail' | 'writer') => void;
  isSavedToast: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  data,
  onChange,
  onReset,
  onSaveBusinessProfile,
  onLoadPreset,
  isSavedToast,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const totals = calculateInvoiceTotals(data);

  // Handlers for deep state updates
  const updateBusiness = (field: keyof typeof data.business, value: string) => {
    onChange({
      ...data,
      business: { ...data.business, [field]: value },
    });
  };

  const updateClient = (field: keyof typeof data.client, value: string) => {
    onChange({
      ...data,
      client: { ...data.client, [field]: value },
    });
  };

  const updateMeta = (field: keyof typeof data.meta, value: any) => {
    onChange({
      ...data,
      meta: { ...data.meta, [field]: value },
    });
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...data.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onChange({
      ...data,
      items: newItems,
    });
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      unit: 'pcs',
    };
    onChange({
      ...data,
      items: [...data.items, newItem],
    });
  };

  const removeItem = (index: number) => {
    if (data.items.length <= 1) {
      // Keep at least one empty item
      onChange({
        ...data,
        items: [{ id: Date.now().toString(), description: '', quantity: 1, rate: 0, unit: 'pcs' }],
      });
      return;
    }
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({
      ...data,
      items: newItems,
    });
  };

  // Payment Mode Logic & Master Switch
  const currentPaymentMode: PaymentMode = data.meta.paymentMode || 'both';
  const isMasterToggleOn = data.meta.showPaymentDetails !== false && currentPaymentMode !== 'cash';

  const handleToggleMasterSwitch = () => {
    if (isMasterToggleOn) {
      // Turn OFF
      onChange({
        ...data,
        meta: {
          ...data.meta,
          showPaymentDetails: false,
        },
      });
    } else {
      // Turn ON: restore previous mode or default to 'both'
      const restoredMode = currentPaymentMode === 'cash' ? 'both' : currentPaymentMode;
      onChange({
        ...data,
        meta: {
          ...data.meta,
          showPaymentDetails: true,
          paymentMode: restoredMode,
        },
      });
    }
  };

  const handleSelectPaymentMode = (mode: PaymentMode) => {
    if (mode === 'cash') {
      onChange({
        ...data,
        meta: {
          ...data.meta,
          paymentMode: 'cash',
          showPaymentDetails: false,
        },
      });
    } else {
      onChange({
        ...data,
        meta: {
          ...data.meta,
          paymentMode: mode,
          showPaymentDetails: true,
        },
      });
    }
  };

  // Handle Logo Upload (Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateBusiness('logoBase64', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Signature Upload (Base64)
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateBusiness('signatureBase64', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const incrementInvoiceNo = () => {
    const current = data.meta.invoiceNumber || 'INV-001';
    const match = current.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      const nextNum = (parseInt(numStr, 10) + 1).toString().padStart(numStr.length, '0');
      updateMeta('invoiceNumber', `${prefix}${nextNum}`);
    } else {
      updateMeta('invoiceNumber', `${current}-1`);
    }
  };

  return (
    <div className="space-y-6 pb-20 text-slate-800">
      {/* Quick Presets & Business Profile Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-700">Quick Templates:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onLoadPreset('freelancer')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-slate-700"
              >
                Freelance Tech
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset('retail')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-slate-700"
              >
                Retail & Spares
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset('writer')}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-slate-700"
              >
                Creative / Writer
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveBusinessProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors border border-indigo-200 shadow-2xs"
              title="Save Business details to LocalStorage so they reload automatically"
            >
              <Save className="w-3.5 h-3.5 text-indigo-600" />
              <span>Save Business Profile</span>
            </button>
            {isSavedToast && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: BUSINESS DETAILS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">1. Your Business / Shop Details</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Auto-saved to browser</span>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business / Enterprise Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.business.businessName}
                onChange={(e) => updateBusiness('businessName', e.target.value)}
                placeholder="e.g. Apex Creative Studio"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner / Proprietor Name
              </label>
              <input
                type="text"
                value={data.business.ownerName}
                onChange={(e) => updateBusiness('ownerName', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.business.contactNumber}
                onChange={(e) => updateBusiness('contactNumber', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={data.business.email}
                onChange={(e) => updateBusiness('email', e.target.value)}
                placeholder="hello@apexcreatives.in"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PAN or MSME/Udyam Reg (Optional)
              </label>
              <input
                type="text"
                value={data.business.panOrId || ''}
                onChange={(e) => updateBusiness('panOrId', e.target.value)}
                placeholder="e.g. PAN: ABCDE1234F"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shop / Office Address
            </label>
            <textarea
              rows={2}
              value={data.business.address}
              onChange={(e) => updateBusiness('address', e.target.value)}
              placeholder="Shop No., Street, City, State, PIN code"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
            />
          </div>

          {/* Logo and Signature Upload row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Logo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Logo (Image / PNG / JPG)
              </label>
              <div className="flex items-center gap-3">
                {data.business.logoBase64 ? (
                  <div className="relative group">
                    <img
                      src={data.business.logoBase64}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain rounded border border-slate-200 bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={() => updateBusiness('logoBase64', '')}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo</span>
                  </button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <span className="text-[11px] text-slate-400">Max 2MB (Square or horizontal)</span>
              </div>
            </div>

            {/* Signature */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Signature Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                {data.business.signatureBase64 ? (
                  <div className="relative group">
                    <img
                      src={data.business.signatureBase64}
                      alt="Signature preview"
                      className="h-10 max-w-[100px] object-contain rounded border border-slate-200 bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={() => updateBusiness('signatureBase64', '')}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600"
                      title="Remove Signature"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => sigInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Signature</span>
                  </button>
                )}
                <input
                  ref={sigInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <span className="text-[11px] text-slate-400">Transparent PNG recommended</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CLIENT & INVOICE META */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">2. Client & Invoice Info</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Invoice No & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Invoice / Bill No. <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={incrementInvoiceNo}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  title="Auto-increment invoice number"
                >
                  + Next No.
                </button>
              </div>
              <input
                type="text"
                value={data.meta.invoiceNumber}
                onChange={(e) => updateMeta('invoiceNumber', e.target.value)}
                placeholder="INV-001"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={data.meta.invoiceDate}
                onChange={(e) => updateMeta('invoiceDate', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={data.meta.dueDate}
                onChange={(e) => updateMeta('dueDate', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.client.clientName}
                onChange={(e) => updateClient('clientName', e.target.value)}
                placeholder="e.g. Acme Enterprises or Cash Customer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={data.client.contactPerson || ''}
                onChange={(e) => updateClient('contactPerson', e.target.value)}
                placeholder="e.g. Mr. Rajesh Kumar"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Phone / Mobile
              </label>
              <input
                type="text"
                value={data.client.phone}
                onChange={(e) => updateClient('phone', e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={data.client.email || ''}
                onChange={(e) => updateClient('email', e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Billing Address
            </label>
            <input
              type="text"
              value={data.client.address}
              onChange={(e) => updateClient('address', e.target.value)}
              placeholder="Address / City / State"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50/40"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: LINE ITEMS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">3. Items & Services (No GST)</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {data.items.length} {data.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-3">
            {data.items.map((item, index) => {
              const rowTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);

              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/60 rounded-lg border border-slate-200 space-y-2 relative transition-all hover:border-slate-300"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1.5">
                      {index + 1}
                    </span>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item name / service description"
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-2 pl-7">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-indigo-500 bg-white text-right"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Unit (e.g. pcs, hrs)
                      </label>
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        placeholder="pcs"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-indigo-500 bg-white text-right font-medium"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Amount (₹)
                      </label>
                      <div className="w-full px-2 py-1 text-xs rounded border border-slate-200 bg-slate-100 text-right font-semibold text-slate-800">
                        ₹{formatINR(rowTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="w-full py-2.5 px-4 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 border-dashed rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item / Service Row</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: DISCOUNT & CALCULATIONS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">4. Discounts & Adjustments</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Type & Value
              </label>
              <div className="flex gap-2">
                <select
                  value={data.meta.discountType}
                  onChange={(e) =>
                    updateMeta('discountType', e.target.value as 'flat' | 'percentage')
                  }
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={data.meta.discountValue}
                  onChange={(e) => updateMeta('discountValue', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/40 text-right font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Charge (Delivery/Setup)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.meta.additionalChargesLabel}
                  onChange={(e) => updateMeta('additionalChargesLabel', e.target.value)}
                  placeholder="e.g. Shipping / Delivery"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50/40"
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={data.meta.additionalChargesAmount}
                  onChange={(e) =>
                    updateMeta('additionalChargesAmount', parseFloat(e.target.value) || 0)
                  }
                  placeholder="₹ 0"
                  className="w-24 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50/40 text-right font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={data.meta.roundOff}
                onChange={(e) => updateMeta('roundOff', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>Round off Grand Total to nearest Rupee</span>
            </label>

            <div className="text-right">
              <span className="text-xs text-slate-500 mr-2">Grand Total:</span>
              <span className="text-base font-extrabold text-indigo-700">
                ₹{formatINR(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: PAYMENT DETAILS & DYNAMIC PAYMENT MODE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header with Master Toggle */}
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">5. Payment Details</h2>
            </div>
          </div>

          {/* Master Switch Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">
              Show on Invoice:
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isMasterToggleOn}
              onClick={handleToggleMasterSwitch}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                isMasterToggleOn ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isMasterToggleOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isMasterToggleOn
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isMasterToggleOn ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Payment Mode Selector: 4-Option Segmented Radio Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Option 1: UPI & Bank Transfer */}
              <button
                type="button"
                onClick={() => handleSelectPaymentMode('both')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  currentPaymentMode === 'both' && isMasterToggleOn
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      currentPaymentMode === 'both' && isMasterToggleOn
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  {currentPaymentMode === 'both' && isMasterToggleOn && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    UPI &amp; Bank
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    QR code + Full Bank A/C
                  </p>
                </div>
              </button>

              {/* Option 2: UPI Only */}
              <button
                type="button"
                onClick={() => handleSelectPaymentMode('upi')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  currentPaymentMode === 'upi' && isMasterToggleOn
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      currentPaymentMode === 'upi' && isMasterToggleOn
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                  </div>
                  {currentPaymentMode === 'upi' && isMasterToggleOn && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    UPI Only
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Scannable QR + UPI ID
                  </p>
                </div>
              </button>

              {/* Option 3: Bank Only */}
              <button
                type="button"
                onClick={() => handleSelectPaymentMode('bank')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  currentPaymentMode === 'bank' && isMasterToggleOn
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      currentPaymentMode === 'bank' && isMasterToggleOn
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                  </div>
                  {currentPaymentMode === 'bank' && isMasterToggleOn && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    Bank Only
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Account No &amp; IFSC
                  </p>
                </div>
              </button>

              {/* Option 4: Cash / None */}
              <button
                type="button"
                onClick={() => handleSelectPaymentMode('cash')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  currentPaymentMode === 'cash' || !isMasterToggleOn
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      currentPaymentMode === 'cash' || !isMasterToggleOn
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                  </div>
                  {(currentPaymentMode === 'cash' || !isMasterToggleOn) && (
                    <Check className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    Cash / None
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Hide bank &amp; UPI
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* DYNAMIC COLLAPSIBLE SECTIONS */}
          {!isMasterToggleOn ? (
            /* COLLAPSED / OFF STATE BANNER */
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 transition-all animate-fade-in">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Payment Details are Hidden from Invoice
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Bank account and UPI details are completely removed from the A4 bill. Ideal for counter billing, cash on delivery, or settled receipts.
                </p>
                <button
                  type="button"
                  onClick={handleToggleMasterSwitch}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 rounded-lg border border-indigo-200 shadow-2xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Show UPI / Bank Details on Bill</span>
                </button>
              </div>
            </div>
          ) : (
            /* EXPANDED STATE ACCORDING TO PAYMENT MODE */
            <div className="space-y-4 pt-1 transition-all animate-fade-in">
              {/* UPI Fields (Visible for 'both' or 'upi') */}
              {(currentPaymentMode === 'both' || currentPaymentMode === 'upi') && (
                <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-950">
                        UPI Payment Setup
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-xs text-indigo-900 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.meta.showUpiQr}
                        onChange={(e) => updateMeta('showUpiQr', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Generate Scannable QR</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      UPI ID (VPA) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.business.upiId}
                      onChange={(e) => updateBusiness('upiId', e.target.value)}
                      placeholder="e.g. rahulsharma@okhdfcbank or 9876543210@paytm"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Customers will scan this QR to pay directly into your account using PhonePe, Google Pay, or Paytm.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Fields (Visible for 'both' or 'bank') */}
              {(currentPaymentMode === 'both' || currentPaymentMode === 'bank') && (
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-bold text-slate-900">
                        Bank Account Details
                      </span>
                    </div>
                    {currentPaymentMode === 'both' && (
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.meta.showBankDetails}
                          onChange={(e) => updateMeta('showBankDetails', e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span>Show Bank Info Box</span>
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={data.business.bankName}
                        onChange={(e) => updateBusiness('bankName', e.target.value)}
                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Account Holder / Beneficiary Name
                      </label>
                      <input
                        type="text"
                        value={data.business.accountHolderName}
                        onChange={(e) => updateBusiness('accountHolderName', e.target.value)}
                        placeholder="e.g. Apex Creative Studio"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={data.business.accountNumber}
                        onChange={(e) => updateBusiness('accountNumber', e.target.value)}
                        placeholder="50200034892109"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={data.business.ifscCode}
                        onChange={(e) => updateBusiness('ifscCode', e.target.value.toUpperCase())}
                        placeholder="HDFC0001234"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bank Branch (Optional)
                    </label>
                    <input
                      type="text"
                      value={data.business.branchName || ''}
                      onChange={(e) => updateBusiness('branchName', e.target.value)}
                      placeholder="e.g. Koramangala 4th Block, Bengaluru"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 6: TERMS, NOTES & CUSTOMIZATION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">6. Notes, Terms & Styling</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Header Title
              </label>
              <input
                type="text"
                value={data.meta.customTitle}
                onChange={(e) => updateMeta('customTitle', e.target.value)}
                placeholder="INVOICE / BILL OF SUPPLY"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Accent Theme Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {Object.values(THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => updateMeta('colorTheme', theme.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      data.meta.colorTheme === theme.id
                        ? 'ring-2 ring-offset-2 ring-slate-800 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: theme.primary }}
                    title={theme.name}
                  >
                    {data.meta.colorTheme === theme.id && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client Note
            </label>
            <input
              type="text"
              value={data.meta.notes}
              onChange={(e) => updateMeta('notes', e.target.value)}
              placeholder="e.g. Thank you for your business! Please process payment by the due date."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Terms & Conditions (Editable)
            </label>
            <textarea
              rows={3}
              value={data.meta.terms}
              onChange={(e) => updateMeta('terms', e.target.value)}
              placeholder="1. Non-GST Bill of supply... 2. Payment due within 15 days..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40"
            />
          </div>
        </div>
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form / Next Customer</span>
        </button>

        <button
          type="button"
          onClick={onSaveBusinessProfile}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Business to Browser</span>
        </button>
      </div>
    </div>
  );
};
