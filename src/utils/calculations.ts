import { InvoiceData } from '../types/invoice';

export interface InvoiceCalculations {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  additionalCharges: number;
  roundOffDiff: number;
  grandTotal: number;
  totalQuantity: number;
}

export function calculateInvoiceTotals(data: InvoiceData): InvoiceCalculations {
  const subtotal = data.items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return sum + (qty * rate);
  }, 0);

  const totalQuantity = data.items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0);
  }, 0);

  const discountVal = Number(data.meta.discountValue) || 0;
  let discountAmount = 0;
  if (data.meta.discountType === 'percentage') {
    discountAmount = (subtotal * Math.min(100, Math.max(0, discountVal))) / 100;
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, discountVal));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const additionalCharges = Number(data.meta.additionalChargesAmount) || 0;
  const totalBeforeRound = taxableAmount + additionalCharges;

  let grandTotal = totalBeforeRound;
  let roundOffDiff = 0;

  if (data.meta.roundOff) {
    grandTotal = Math.round(totalBeforeRound);
    roundOffDiff = Number((grandTotal - totalBeforeRound).toFixed(2));
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    additionalCharges: Number(additionalCharges.toFixed(2)),
    roundOffDiff,
    grandTotal: Number(grandTotal.toFixed(2)),
    totalQuantity,
  };
}

export function formatINR(val: number): string {
  if (isNaN(val)) return '0.00';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function buildUpiPaymentLink(
  upiId: string,
  payeeName: string,
  amount: number,
  invoiceNo: string
): string {
  if (!upiId || !upiId.trim()) return '';
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent((payeeName || 'Merchant').trim());
  const formattedAmount = amount > 0 ? amount.toFixed(2) : '';
  const note = encodeURIComponent(`Bill ${invoiceNo || ''}`.trim());

  let link = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&cu=INR`;
  if (formattedAmount) {
    link += `&am=${formattedAmount}`;
  }
  if (note) {
    link += `&tn=${note}`;
  }
  return link;
}
