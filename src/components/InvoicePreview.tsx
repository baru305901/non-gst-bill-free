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

  // Payment Visibility Logic
  const paymentMode = data.meta.paymentMode || 'both';
  const isPaymentEnabled = data.meta.showPaymentDetails !== false && paymentMode !== 'cash';
  const showUpi = isPaymentEnabled && (paymentMode === 'both' || paymentMode === 'upi') && (data.meta.showUpiQr ?? true);
  const showBank = isPaymentEnabled && (paymentMode === 'both' || paymentMode === 'bank') && (data.meta.showBankDetails ?? true);

  // Generate UPI QR Code whenever UPI ID, Payee, Amount or Invoice # changes
  useEffect(() => {
    if (!showUpi || !data.business.upiId) {
      setQrCodeUrl('');
      return;
    }

    const payeeName = data.business.businessName || data.business.ownerName || 'Merchant';
    const upiLink = buildUpiPaymentLink(
      data.business.upiId,
      payeeName,
      totals.grandTotal,
      data.meta.invoiceNumber
    );

    QRCode.toDataURL(upiLink, {
      width: 140,
      margin: 1,
      color: {
        dark: '#1e293b',
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
    data.business.upiId,
    data.business.businessName,
    data.business.ownerName,
    totals.grandTotal,
    data.meta.invoiceNumber,
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
        className="bg-white text-slate-800 shadow-2xl print:shadow-none print:border-none relative flex flex-col justify-between font-sans box-border"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '16mm 16mm 14mm 16mm',
          backgroundColor: '#ffffff',
          color: '#1e293b',
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
          <div className="flex justify-between items-start border-b border-slate-200 pb-5 pt-1">
            {/* Left: Business Info & Logo */}
            <div className="flex items-start gap-4 max-w-[58%]">
              {data.business.logoBase64 ? (
                <img
                  src={data.business.logoBase64}
                  alt="Business Logo"
                  className="w-16 h-16 object-contain rounded border border-slate-200 p-1 bg-white shrink-0"
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
                  className="text-xl font-bold tracking-tight text-slate-900 leading-tight"
                  style={{ color: theme.primaryDark }}
                >
                  {data.business.businessName || 'Your Business Name'}
                </h1>
                {data.business.ownerName && (
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Proprietor: {data.business.ownerName}
                  </p>
                )}
                {data.business.address && (
                  <p className="text-[11px] text-slate-600 whitespace-pre-line mt-1 leading-snug">
                    {data.business.address}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-slate-600">
                  {data.business.contactNumber && (
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      {data.business.contactNumber}
                    </span>
                  )}
                  {data.business.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5 text-slate-400" />
                      {data.business.email}
                    </span>
                  )}
                  {data.business.panOrId && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-semibold bg-slate-100 rounded text-slate-700">
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
                  <span className="text-slate-500 font-medium">Invoice No:</span>
                  <span className="font-bold text-slate-900 tracking-wide">
                    {data.meta.invoiceNumber || 'INV-001'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium text-slate-800">
                    {data.meta.invoiceDate || '—'}
                  </span>
                </div>
                {data.meta.dueDate && (
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="font-semibold text-slate-800">
                      {data.meta.dueDate}
                    </span>
                  </div>
                )}
                <div className="pt-1 flex items-center justify-end gap-1.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                    NON-GST SUPPLY
                  </span>
                  {paymentMode === 'cash' && (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 rounded border border-amber-200">
                      CASH PAYMENT
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BILL TO & INVOICE DETAILS */}
          <div className="grid grid-cols-2 gap-6 my-4 p-3.5 bg-slate-50/70 rounded-lg border border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Billed To (Customer Details)
              </p>
              <h2 className="text-sm font-bold text-slate-900 leading-snug">
                {data.client.clientName || 'Cash / Walk-in Customer'}
              </h2>
              {data.client.contactPerson && (
                <p className="text-xs text-slate-600 font-medium">
                  Attn: {data.client.contactPerson}
                </p>
              )}
              {data.client.address && (
                <p className="text-[11px] text-slate-600 whitespace-pre-line mt-1 leading-snug">
                  {data.client.address}
                </p>
              )}
              {data.client.cityPincode && (
                <p className="text-[11px] text-slate-600">
                  {data.client.cityPincode}
                </p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-600">
                {data.client.phone && <span>Phone: {data.client.phone}</span>}
                {data.client.email && <span>Email: {data.client.email}</span>}
              </div>
            </div>

            <div className="flex flex-col justify-between border-l border-slate-200 pl-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Invoice Overview
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Place of Supply:</span>
                    <span className="font-medium text-slate-800">State / Local</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax Type:</span>
                    <span className="font-medium text-slate-700">Exempt / Non-GST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {paymentMode === 'both'
                        ? 'UPI & Bank'
                        : paymentMode === 'upi'
                        ? 'UPI'
                        : paymentMode === 'bank'
                        ? 'Bank Transfer'
                        : 'Cash / None'}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="mt-2 pt-2 border-t border-slate-200/80 flex items-baseline justify-between"
              >
                <span className="text-xs font-semibold text-slate-600">Amount Due:</span>
                <span
                  className="text-base font-extrabold tracking-tight"
                  style={{ color: theme.primary }}
                >
                  ₹{formatINR(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div className="mb-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-700"
                  style={{ backgroundColor: theme.summaryBg }}
                >
                  <th className="py-2.5 px-3 border border-slate-200 text-center w-12">
                    #
                  </th>
                  <th className="py-2.5 px-3 border border-slate-200">
                    Item Description
                  </th>
                  <th className="py-2.5 px-3 border border-slate-200 text-right w-20">
                    Qty
                  </th>
                  <th className="py-2.5 px-3 border border-slate-200 text-right w-28">
                    Rate (₹)
                  </th>
                  <th className="py-2.5 px-3 border border-slate-200 text-right w-32">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      No items added yet. Click &ldquo;Add Row&rdquo; on the left form.
                    </td>
                  </tr>
                ) : (
                  data.items.map((item, index) => {
                    const lineAmount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    return (
                      <tr
                        key={item.id}
                        className={index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}
                      >
                        <td className="py-2.5 px-3 border border-slate-200 text-center text-slate-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 font-medium text-slate-800">
                          <span className="whitespace-pre-line">{item.description || 'Untitled Item'}</span>
                          {item.unit && (
                            <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                              ({item.unit})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right text-slate-700 font-medium">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right text-slate-700">
                          {formatINR(Number(item.rate) || 0)}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 text-right font-semibold text-slate-900">
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
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Total Amount In Words
                </span>
                <p className="text-xs font-semibold text-slate-800 italic leading-snug">
                  {words}
                </p>
              </div>

              {/* Terms & Notes */}
              {data.meta.notes && (
                <div className="mb-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Note: </span>
                  <span className="italic">{data.meta.notes}</span>
                </div>
              )}

              {data.meta.terms && (
                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="font-bold text-slate-600 block mb-0.5 uppercase tracking-wide">
                    Terms & Conditions:
                  </span>
                  <p className="whitespace-pre-line text-slate-600">{data.meta.terms}</p>
                </div>
              )}
            </div>

            {/* Right Column: Calculations Box */}
            <div className="w-[40%] bg-slate-50 rounded-lg border border-slate-200 p-3.5 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal ({totals.totalQuantity} items):</span>
                <span className="font-semibold text-slate-800">
                  ₹{formatINR(totals.subtotal)}
                </span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>
                    Discount{' '}
                    {data.meta.discountType === 'percentage'
                      ? `(${data.meta.discountValue}%)`
                      : '(Flat)'}:
                  </span>
                  <span className="font-semibold">
                    -₹{formatINR(totals.discountAmount)}
                  </span>
                </div>
              )}

              {totals.additionalCharges > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{data.meta.additionalChargesLabel || 'Extra Charges'}:</span>
                  <span className="font-semibold text-slate-800">
                    +₹{formatINR(totals.additionalCharges)}
                  </span>
                </div>
              )}

              {data.meta.roundOff && totals.roundOffDiff !== 0 && (
                <div className="flex justify-between text-xs text-slate-500 italic">
                  <span>Round Off:</span>
                  <span>
                    {totals.roundOffDiff > 0 ? '+' : ''}₹{formatINR(totals.roundOffDiff)}
                  </span>
                </div>
              )}

              <div
                className="pt-2 mt-2 border-t-2 flex justify-between items-center text-sm font-bold"
                style={{ borderColor: theme.primary }}
              >
                <span className="text-slate-900">Grand Total:</span>
                <span
                  className="text-lg font-extrabold tracking-tight px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.primaryDark,
                  }}
                >
                  ₹{formatINR(totals.grandTotal)}
                </span>
              </div>

              <div className="text-[10px] text-center text-slate-500 pt-1 border-t border-slate-200">
                GST Not Applicable (Threshold Exemption / Composition)
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: PAYMENT INFO & SIGNATURE */}
        <div className="mt-4 pt-3 border-t-2 border-slate-200">
          <div className="flex items-end justify-between gap-6">
            {/* Payment Details Container */}
            {isPaymentEnabled && (showUpi || showBank) ? (
              <div className="flex-1 flex items-start gap-4">
                {/* UPI QR Code Block (Only shown when UPI is active) */}
                {showUpi && data.business.upiId && qrCodeUrl && (
                  <div className="bg-white border border-slate-200 rounded-lg p-2 text-center shadow-xs shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="UPI Payment QR Code"
                      className="w-20 h-20 mx-auto object-contain"
                    />
                    <div className="flex items-center justify-center gap-1 mt-1 text-[9px] font-bold text-slate-700">
                      <QrIcon className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Scan to Pay (UPI)</span>
                    </div>
                  </div>
                )}

                {/* Info Text Box (Bank details OR standalone UPI details) */}
                <div className="text-[11px] space-y-1 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    {showBank ? (
                      <>
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {showUpi ? 'Bank & UPI Payment Details' : 'Bank Account Details'}
                      </>
                    ) : (
                      <>
                        <QrIcon className="w-3 h-3 text-emerald-600" />
                        Instant UPI Payment
                      </>
                    )}
                  </p>

                  {/* UPI ID display */}
                  {showUpi && data.business.upiId && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">UPI ID:</span>
                      <span className="font-bold text-slate-800">{data.business.upiId}</span>
                    </div>
                  )}

                  {/* Bank Details display (Only shown when Bank is active) */}
                  {showBank && (
                    <>
                      {data.business.accountNumber && (
                        <div className="flex gap-2">
                          <span className="text-slate-500 font-medium">A/C No:</span>
                          <span className="font-bold text-slate-800">{data.business.accountNumber}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                        {data.business.ifscCode && (
                          <div>
                            <span className="text-slate-500 font-medium">IFSC: </span>
                            <span className="font-semibold text-slate-800">{data.business.ifscCode}</span>
                          </div>
                        )}
                        {data.business.bankName && (
                          <div>
                            <span className="text-slate-500 font-medium">Bank: </span>
                            <span className="text-slate-700">{data.business.bankName}</span>
                          </div>
                        )}
                      </div>
                      {data.business.accountHolderName && (
                        <div>
                          <span className="text-slate-500 font-medium">A/C Name: </span>
                          <span className="text-slate-700">{data.business.accountHolderName}</span>
                        </div>
                      )}
                    </>
                  )}

                  {showUpi && !showBank && (
                    <p className="text-[10px] text-slate-500 italic pt-0.5">
                      Accepts Google Pay, PhonePe, Paytm, BHIM, and any UPI application.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* When payment details are OFF or Cash/None: Clean balance container */
              <div className="flex-1 pr-4">
                <div className="p-2.5 bg-slate-50/60 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">
                      Payment Mode: {paymentMode === 'cash' ? 'Cash / Counter Settlement' : 'Settled Directly'}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Payment received or direct settlement. No electronic bank details required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Authorized Signatory Box */}
            <div className="text-right flex flex-col items-end justify-end shrink-0 min-w-[150px]">
              <p className="text-[11px] font-semibold text-slate-700 mb-1">
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
                  <span className="text-[11px] italic font-serif text-slate-400">
                    {data.business.ownerName || 'Authorized Signatory'}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-400 w-36 pt-1 text-center mt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>

          {/* Clean Non-GST Declaration Footer */}
          <div className="mt-3 pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-500">
            <p>
              * This is a computer-generated invoice and does not require a physical signature.
            </p>
            <p className="font-semibold text-slate-600">
              Composition / Non-GST Bill of Supply &bull; Original for Recipient
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
