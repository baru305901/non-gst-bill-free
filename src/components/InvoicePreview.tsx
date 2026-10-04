import React, { useEffect, useState } from 'react';
import { InvoiceData } from '../types/invoice';
import { calculateInvoiceTotals, formatINR, buildUpiPaymentLink } from '../utils/calculations';
import { numberToIndianWords } from '../utils/numberToWords';
import { getTheme } from '../utils/theme';
import QRCode from 'qrcode';
import { Building2, Phone, Mail, QrCode as QrIcon, CheckCircle2 } from 'lucide-react';

interface InvoicePreviewProps {
  data: InvoiceData;
  scale?: number;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data, scale = 1 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const totals = calculateInvoiceTotals(data);
  const words = numberToIndianWords(totals.grandTotal);
  const theme = getTheme(data.meta.colorTheme);

  // Clean UPI ID and Payee Name
  const cleanUpiId = (data.business.upiId || '').trim();
  const payeeName = (
    data.business.upiPayeeName ||
    data.business.businessName ||
    data.business.ownerName ||
    'Merchant'
  ).trim();

  // Payment Visibility Logic
  const paymentMode = data.meta.paymentMode || 'both';
  const isPaymentEnabled = data.meta.showPaymentDetails !== false && paymentMode !== 'cash';
  const hasValidUpi = Boolean(cleanUpiId);
  const showUpi = isPaymentEnabled && (paymentMode === 'both' || paymentMode === 'upi') && (data.meta.showUpiQr ?? true) && hasValidUpi;
  const showBank = isPaymentEnabled && (paymentMode === 'both' || paymentMode === 'bank') && (data.meta.showBankDetails ?? true);

  // Format phone number with +91 prefix
  const formatPhone = (phoneStr: string) => {
    if (!phoneStr) return '';
    const clean = phoneStr.replace(/\D/g, '');
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return phoneStr.startsWith('+') ? phoneStr : `+91 ${phoneStr}`;
  };

  // Clean notes: remove QR code mention if QR code is not visible
  const getDisplayNotes = () => {
    let noteText = data.meta.notes || '';
    if (!showUpi) {
      // Remove sentences mentioning scanning UPI QR code
      noteText = noteText
        .replace(/For instant payment,?\s*you can scan the UPI QR code below\.?/gi, '')
        .replace(/Scan the UPI QR code below to pay\.?/gi, '')
        .replace(/You can scan the QR code below\.?/gi, '')
        .replace(/Scan the QR code below\.?/gi, '')
        .trim();
    }
    return noteText;
  };

  const displayNotes = getDisplayNotes();

  // Generate standard UPI QR Code: upi://pay?pa={UPI_ID}&pn={PAYEE_NAME}&am={TOTAL_AMOUNT}&cu=INR
  useEffect(() => {
    if (!showUpi || !cleanUpiId) {
      setQrCodeUrl('');
      return;
    }

    const upiLink = buildUpiPaymentLink(cleanUpiId, payeeName, totals.grandTotal);

    QRCode.toDataURL(upiLink, {
      width: 140,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => {
        console.error('QR code generation error:', err);
        setQrCodeUrl('');
      });
  }, [
    showUpi,
    cleanUpiId,
    payeeName,
    totals.grandTotal,
  ]);

  return (
    <div
      className="invoice-preview-wrapper transition-transform origin-top flex justify-center print:!transform-none print:!m-0"
      style={{
        transform: `scale(${scale})`,
      }}
    >
      <div
        id="invoice-paper"
        className="bg-white text-slate-900 shadow-2xl print:shadow-none print:border-none relative flex flex-col justify-between font-sans box-border"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '16mm 16mm 14mm 16mm',
          backgroundColor: '#ffffff',
          color: '#111827',
        }}
      >
        {/* Top Decorative Color Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2.5 print:h-2"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Content Container */}
        <div className="flex-1 flex flex-col">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-5 pt-1">
            {/* Left: Business Info & Logo */}
            <div className="flex items-start gap-4 max-w-[60%]">
              {data.business.logoBase64 ? (
                <img
                  src={data.business.logoBase64}
                  alt="Business Logo"
                  className="w-16 h-16 object-contain rounded border border-slate-300 p-1 bg-white shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-xs"
                  style={{ backgroundColor: theme.primary }}
                >
                  {(data.business.businessName || 'B').charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1
                  className="text-xl font-extrabold tracking-tight text-slate-950 leading-tight"
                  style={{ color: theme.primaryDark }}
                >
                  {data.business.businessName || 'Your Business Name'}
                </h1>
                {data.business.ownerName && (
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    Proprietor: {data.business.ownerName}
                  </p>
                )}
                {data.business.address && (
                  <p className="text-xs text-slate-800 font-medium whitespace-pre-line mt-1 leading-snug">
                    {data.business.address}
                  </p>
                )}

                {/* Contact phone & email with high print contrast */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-800 font-medium">
                  {data.business.contactNumber && (
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      <Phone className="w-3 h-3 text-slate-600" />
                      {formatPhone(data.business.contactNumber)}
                    </span>
                  )}
                  {data.business.email && (
                    <span className="inline-flex items-center gap-1 text-slate-800">
                      <Mail className="w-3 h-3 text-slate-600" />
                      {data.business.email}
                    </span>
                  )}
                </div>

                {/* Separate PAN and Udyam Registration Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {data.business.panNumber && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-slate-100 rounded border border-slate-300 text-slate-900 font-mono">
                      PAN: {data.business.panNumber}
                    </span>
                  )}
                  {data.business.udyamNumber && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-slate-100 rounded border border-slate-300 text-slate-900 font-mono">
                      Udyam: {data.business.udyamNumber}
                    </span>
                  )}
                  {!data.business.panNumber && !data.business.udyamNumber && data.business.panOrId && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-slate-100 rounded border border-slate-300 text-slate-900 font-mono">
                      {data.business.panOrId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Invoice Title & Meta */}
            <div className="text-right flex flex-col items-end">
              <div
                className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                  border: `1px solid ${theme.accentBorder}`,
                }}
              >
                {data.meta.customTitle || 'BILL OF SUPPLY / INVOICE'}
              </div>

              <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-slate-600 font-semibold">Invoice No:</span>
                  <span className="font-extrabold text-slate-950 tracking-wide font-mono">
                    {data.meta.invoiceNumber || 'INV-001'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-slate-600 font-semibold">Date:</span>
                  <span className="font-bold text-slate-900">
                    {data.meta.invoiceDate || '—'}
                  </span>
                </div>
                {data.meta.dueDate && (
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <span className="text-slate-600 font-semibold">Due Date:</span>
                    <span className="font-bold text-slate-900">
                      {data.meta.dueDate}
                    </span>
                  </div>
                )}
                <div className="pt-1 flex items-center justify-end gap-1.5">
                  <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                    NON-GST SUPPLY
                  </span>
                  {paymentMode === 'cash' && (
                    <span className="inline-block px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded border border-amber-300">
                      CASH
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BILL TO & INVOICE DETAILS */}
          <div className="grid grid-cols-2 gap-6 my-4 p-3.5 bg-slate-50 rounded-lg border border-slate-300">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Billed To (Customer Details)
              </p>
              <h2 className="text-sm font-bold text-slate-950 leading-snug">
                {data.client.clientName || 'Cash / Walk-in Customer'}
              </h2>
              {data.client.contactPerson && (
                <p className="text-xs text-slate-800 font-semibold mt-0.5">
                  Attn: {data.client.contactPerson}
                </p>
              )}
              {data.client.address && (
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line mt-1 leading-snug">
                  {data.client.address}
                </p>
              )}
              {data.client.cityPincode && (
                <p className="text-xs text-slate-800 font-medium">
                  {data.client.cityPincode}
                </p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-800 font-medium">
                {data.client.phone && <span>Phone: {formatPhone(data.client.phone)}</span>}
                {data.client.email && <span>Email: {data.client.email}</span>}
              </div>
            </div>

            {/* Invoice Overview: Removed confusing "Tax Type: Exempt / Non-GST" */}
            <div className="flex flex-col justify-between border-l border-slate-300 pl-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Invoice Overview
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Place of Supply:</span>
                    <span className="font-bold text-slate-900">State / Local</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-semibold">Payment Mode:</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {paymentMode === 'both'
                        ? 'UPI & Bank Transfer'
                        : paymentMode === 'upi'
                        ? 'UPI Only'
                        : paymentMode === 'bank'
                        ? 'Bank Transfer Only'
                        : 'Cash / None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-300 flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-700">Amount Due:</span>
                <span
                  className="text-lg font-extrabold tracking-tight"
                  style={{ color: theme.primary }}
                >
                  ₹{formatINR(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div className="mb-4">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr
                  className="text-xs font-bold uppercase tracking-wider text-slate-900"
                  style={{ backgroundColor: theme.summaryBg }}
                >
                  <th className="py-2.5 px-3 border border-slate-300 text-center w-12">
                    #
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300">
                    Item Description
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 text-right w-20">
                    Qty
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 text-right w-28">
                    Rate (₹)
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 text-right w-32">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-xs">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      No items added yet. Click &ldquo;Add Row&rdquo; on the left form.
                    </td>
                  </tr>
                ) : (
                  data.items.map((item, index) => {
                    const lineAmount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    return (
                      <tr
                        key={item.id}
                        className={index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                      >
                        <td className="py-2.5 px-3 border border-slate-300 text-center text-slate-700 font-bold">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 font-semibold text-slate-950">
                          <span className="whitespace-pre-line">{item.description || 'Untitled Item'}</span>
                          {item.unit && (
                            <span className="text-[11px] text-slate-600 ml-1.5 font-normal">
                              ({item.unit})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-right text-slate-900 font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-right text-slate-900 font-semibold">
                          {formatINR(Number(item.rate) || 0)}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-right font-extrabold text-slate-950">
                          {formatINR(lineAmount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALS & SUMMARY SECTION */}
          <div className="flex justify-between items-start gap-4 mb-4">
            {/* Left Column: Amount In Words & Notes */}
            <div className="w-[58%] flex flex-col justify-between">
              {/* Amount in words banner */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 mb-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                  Total Amount In Words
                </span>
                <p className="text-xs font-bold text-slate-900 italic leading-snug">
                  {words}
                </p>
              </div>

              {/* Notes (clean, no misleading QR note if QR is not visible) */}
              {displayNotes && (
                <div className="mb-2 text-xs text-slate-800 font-medium">
                  <span className="font-bold text-slate-900">Note: </span>
                  <span className="italic">{displayNotes}</span>
                </div>
              )}

              {data.meta.terms && (
                <div className="text-[11px] text-slate-700 leading-snug">
                  <span className="font-bold text-slate-900 block mb-0.5 uppercase tracking-wide">
                    Terms &amp; Conditions:
                  </span>
                  <p className="whitespace-pre-line text-slate-800 font-medium">{data.meta.terms}</p>
                </div>
              )}
            </div>

            {/* Right Column: Calculations Box */}
            <div className="w-[40%] bg-slate-50 rounded-lg border border-slate-300 p-3.5 space-y-2">
              <div className="flex justify-between text-xs text-slate-700 font-medium">
                <span className="font-semibold text-slate-700">Subtotal ({totals.totalQuantity} items):</span>
                <span className="font-bold text-slate-950">
                  ₹{formatINR(totals.subtotal)}
                </span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-800 font-semibold">
                  <span>
                    Discount{' '}
                    {data.meta.discountType === 'percentage'
                      ? `(${data.meta.discountValue}%)`
                      : '(Flat)'}:
                  </span>
                  <span>
                    -₹{formatINR(totals.discountAmount)}
                  </span>
                </div>
              )}

              {totals.additionalCharges > 0 && (
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span className="font-semibold text-slate-700">{data.meta.additionalChargesLabel || 'Extra Charges'}:</span>
                  <span className="font-bold text-slate-950">
                    +₹{formatINR(totals.additionalCharges)}
                  </span>
                </div>
              )}

              {data.meta.roundOff && totals.roundOffDiff !== 0 && (
                <div className="flex justify-between text-xs text-slate-600 italic">
                  <span>Round Off:</span>
                  <span className="font-semibold">
                    {totals.roundOffDiff > 0 ? '+' : ''}₹{formatINR(totals.roundOffDiff)}
                  </span>
                </div>
              )}

              <div
                className="pt-2 mt-2 border-t-2 flex justify-between items-center text-sm font-bold"
                style={{ borderColor: theme.primary }}
              >
                <span className="text-slate-950 font-extrabold">Grand Total:</span>
                <span
                  className="text-lg font-extrabold tracking-tight px-2.5 py-0.5 rounded"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.primaryDark,
                  }}
                >
                  ₹{formatINR(totals.grandTotal)}
                </span>
              </div>

              <div className="text-[11px] text-center font-semibold text-slate-700 pt-1.5 border-t border-slate-300">
                No tax is charged on this invoice.
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: PAYMENT INFO & SIGNATURE */}
        <div className="mt-4 pt-3 border-t-2 border-slate-300">
          <div className="flex items-end justify-between gap-6">
            {/* Payment Details Container */}
            {isPaymentEnabled && (showUpi || showBank) ? (
              <div className="flex-1 flex items-start gap-4">
                {/* Dynamic Scannable UPI QR Code Block */}
                {showUpi && qrCodeUrl && (
                  <div className="bg-white border border-slate-300 rounded-lg p-2 text-center shadow-xs shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="UPI Payment QR Code"
                      className="w-20 h-20 mx-auto object-contain"
                    />
                    <div className="flex items-center justify-center gap-1 mt-1 text-[10px] font-bold text-slate-900">
                      <QrIcon className="w-3 h-3 text-emerald-700" />
                      <span>Scan to Pay (UPI)</span>
                    </div>
                  </div>
                )}

                {/* Info Text Box (Bank details OR standalone UPI details) */}
                <div className="text-xs space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-300 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    {showBank ? (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-slate-700" />
                        {showUpi ? 'Bank & UPI Payment Details' : 'Bank Account Details'}
                      </>
                    ) : (
                      <>
                        <QrIcon className="w-3.5 h-3.5 text-emerald-700" />
                        Instant UPI Payment
                      </>
                    )}
                  </p>

                  {/* UPI ID & Payee Name display */}
                  {showUpi && cleanUpiId && (
                    <div className="space-y-0.5 text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-semibold">UPI ID:</span>
                        <span className="font-bold font-mono">{cleanUpiId}</span>
                      </div>
                      {payeeName && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-600 font-semibold">Payee Name:</span>
                          <span className="font-semibold text-slate-800">{payeeName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Details display */}
                  {showBank && (
                    <div className="space-y-0.5 text-slate-900">
                      {data.business.accountNumber && (
                        <div className="flex gap-2">
                          <span className="text-slate-600 font-semibold">A/C No:</span>
                          <span className="font-bold font-mono">{data.business.accountNumber}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                        {data.business.ifscCode && (
                          <div>
                            <span className="text-slate-600 font-semibold">IFSC: </span>
                            <span className="font-bold font-mono">{data.business.ifscCode}</span>
                          </div>
                        )}
                        {data.business.bankName && (
                          <div>
                            <span className="text-slate-600 font-semibold">Bank: </span>
                            <span className="font-semibold text-slate-800">{data.business.bankName}</span>
                          </div>
                        )}
                      </div>
                      {data.business.accountHolderName && (
                        <div className="text-[11px]">
                          <span className="text-slate-600 font-semibold">A/C Name: </span>
                          <span className="font-semibold text-slate-800">{data.business.accountHolderName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {showUpi && !showBank && (
                    <p className="text-[10px] text-slate-700 font-medium italic pt-0.5">
                      Accepts Google Pay, PhonePe, Paytm, BHIM, and any UPI application.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* When payment details are OFF or Cash/None: Clean balance container */
              <div className="flex-1 pr-4">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-300 text-xs text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">
                      Payment Mode: {paymentMode === 'cash' ? 'Cash / Counter Settlement' : 'Settled Directly'}
                    </span>
                    <p className="text-[11px] text-slate-700 font-medium">
                      Payment received or direct settlement. No electronic bank details required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Authorized Signatory Box */}
            <div className="text-right flex flex-col items-end justify-end shrink-0 min-w-[150px]">
              <p className="text-xs font-bold text-slate-800 mb-1">
                For {data.business.businessName || 'Business'}
              </p>

              {data.business.signatureBase64 ? (
                <img
                  src={data.business.signatureBase64}
                  alt="Authorized Signature"
                  className="h-12 max-w-[130px] object-contain my-1"
                />
              ) : (
                <div className="h-12 flex items-center justify-center">
                  <span className="text-xs italic font-serif text-slate-500">
                    {data.business.ownerName || 'Authorized Signatory'}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-slate-700 w-36 pt-1 text-center mt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Non-GST Declaration Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-800 font-semibold gap-1">
            <p className="text-slate-800">
              * This is a Non-GST Bill / Invoice issued by an unregistered dealer / composition scheme dealer under GST rules. No tax is charged.
            </p>
            <p className="text-slate-900 font-bold shrink-0">
              Original for Recipient
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
