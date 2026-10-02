export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  unit?: string; // e.g. "pcs", "hrs", "nos", "services"
}

export interface BusinessDetails {
  businessName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  address: string;
  panOrId?: string; // Optional PAN or MSME/Udyam Reg for small businesses
  logoBase64?: string;
  signatureBase64?: string;
  // Payment info
  upiId: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface ClientDetails {
  clientName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address: string;
  cityPincode?: string;
}

export type PaymentMode = 'both' | 'upi' | 'bank' | 'cash';

export interface InvoiceMeta {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  terms: string;
  currencySymbol: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  additionalChargesLabel: string;
  additionalChargesAmount: number;
  roundOff: boolean;
  paymentMode: PaymentMode; // "both" (UPI & Bank Transfer), "upi" (UPI Only), "bank" (Bank Only), "cash" (Cash / None)
  showPaymentDetails: boolean; // Master switch ON/OFF
  showUpiQr: boolean;
  showBankDetails: boolean;
  showSignature: boolean;
  colorTheme: 'zoho-blue' | 'emerald' | 'navy' | 'charcoal' | 'violet';
  customTitle: string; // e.g. "INVOICE / BILL OF SUPPLY"
}

export interface InvoiceData {
  business: BusinessDetails;
  client: ClientDetails;
  items: LineItem[];
  meta: InvoiceMeta;
}
