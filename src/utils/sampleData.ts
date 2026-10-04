import { BusinessDetails, ClientDetails, InvoiceData } from '../types/invoice';

const today = new Date();
const formattedToday = today.toISOString().split('T')[0];
const due = new Date();
due.setDate(today.getDate() + 15);
const formattedDue = due.toISOString().split('T')[0];

export const emptyBusinessDetails: BusinessDetails = {
  businessName: '',
  ownerName: '',
  contactNumber: '',
  email: '',
  address: '',
  panNumber: '',
  udyamNumber: '',
  logoBase64: '',
  signatureBase64: '',
  upiId: '',
  upiPayeeName: '',
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
};

export const emptyClientDetails: ClientDetails = {
  clientName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
};

export const createBlankInvoice = (invoiceNo = 'INV-001'): InvoiceData => {
  const t = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(new Date().getDate() + 15);

  return {
    business: { ...emptyBusinessDetails },
    client: { ...emptyClientDetails },
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        rate: 0,
        unit: 'pcs',
      },
    ],
    meta: {
      invoiceNumber: invoiceNo,
      invoiceDate: t,
      dueDate: d.toISOString().split('T')[0],
      notes: 'Thank you for your business! Please process payment by the due date.',
      terms: '1. This is a Non-GST Bill / Invoice issued by an unregistered dealer / composition scheme dealer under GST rules. No tax is charged.\n2. Payment is due within 15 days of invoice date.',
      currencySymbol: '₹',
      discountType: 'flat',
      discountValue: 0,
      additionalChargesLabel: '',
      additionalChargesAmount: 0,
      roundOff: true,
      paymentMode: 'both',
      showPaymentDetails: true,
      showUpiQr: true,
      showBankDetails: true,
      showSignature: true,
      colorTheme: 'zoho-blue',
      customTitle: 'INVOICE / BILL OF SUPPLY',
    },
  };
};

// Default template is completely clean without hardcoded demo business names
export const defaultFreelancerInvoice: InvoiceData = createBlankInvoice('INV-001');

// Optional template presets for users who click "Quick Templates"
export const sampleRetailInvoice: InvoiceData = {
  business: {
    businessName: 'Shree Krishna Electronics & Spares',
    ownerName: 'Manoj Kumar Gupta',
    contactNumber: '9415098765',
    email: 'shreekrishna.spares@gmail.com',
    address: 'Shop No. 14, Main Market, Clock Tower Road, Dehradun, Uttarakhand - 248001',
    panNumber: 'BKRPM9812G',
    udyamNumber: 'UDYAM-UK-05-0012984',
    upiId: 'shreekrishna@paytm',
    upiPayeeName: 'Shree Krishna Electronics',
    bankName: 'State Bank of India',
    accountHolderName: 'Shree Krishna Electronics',
    accountNumber: '32984501928',
    ifscCode: 'SBIN0000630',
    branchName: 'Main Branch, Dehradun',
  },
  client: {
    clientName: 'Modern Hardware & Sanitary Store',
    contactPerson: 'Suresh Verma',
    phone: '9760044556',
    address: 'Plot 88, Industrial Area, Patel Nagar, Dehradun, UK',
  },
  items: [
    {
      id: '1',
      description: 'Heavy Duty Copper Cable Wire 2.5 sq mm (90m Roll)',
      quantity: 4,
      rate: 1850,
      unit: 'rolls',
    },
    {
      id: '2',
      description: 'Modular Switch 6A White Polycarbonate (Pack of 20)',
      quantity: 6,
      rate: 420,
      unit: 'box',
    },
    {
      id: '3',
      description: 'LED Panel Downlight 15W Cool Daylight',
      quantity: 12,
      rate: 290,
      unit: 'pcs',
    },
    {
      id: '4',
      description: 'MCB Double Pole 32A C-Curve',
      quantity: 3,
      rate: 540,
      unit: 'pcs',
    },
  ],
  meta: {
    invoiceNumber: 'BILL-1042',
    invoiceDate: formattedToday,
    dueDate: formattedToday,
    notes: 'Goods once sold cannot be returned without original packaging. Warranty as per manufacturer terms.',
    terms: '1. Non-GST retail supply bill issued under composition/unregistered dealer rules. No tax is charged.\n2. Subject to local jurisdiction.\n3. Goods received in good condition.',
    currencySymbol: '₹',
    discountType: 'percentage',
    discountValue: 5,
    additionalChargesLabel: 'Local Delivery Charge',
    additionalChargesAmount: 250,
    roundOff: true,
    paymentMode: 'upi',
    showPaymentDetails: true,
    showUpiQr: true,
    showBankDetails: false,
    showSignature: true,
    colorTheme: 'emerald',
    customTitle: 'CASH MEMO / BILL OF SUPPLY',
  },
};

export const sampleFreelanceWriterInvoice: InvoiceData = {
  business: {
    businessName: 'ContentCraft Studio',
    ownerName: 'Ananya Mukherjee',
    contactNumber: '9903177665',
    email: 'ananya.writes@gmail.com',
    address: 'Lake Gardens, South Kolkata, West Bengal - 700045',
    panNumber: 'AMKPM4421E',
    udyamNumber: '',
    upiId: 'ananya@icici',
    upiPayeeName: 'Ananya Mukherjee',
    bankName: 'ICICI Bank',
    accountHolderName: 'Ananya Mukherjee',
    accountNumber: '003501589123',
    ifscCode: 'ICIC0000035',
    branchName: 'Golpark Branch, Kolkata',
  },
  client: {
    clientName: 'SaaSGrowth Digital Media',
    contactPerson: 'David Chen',
    phone: '8010099887',
    email: 'billing@saasgrowth.io',
    address: 'HSR Layout Sector 2, Bengaluru, Karnataka',
  },
  items: [
    {
      id: '1',
      description: 'Long-form Pillar Blog Posts (2,500 words each with research)',
      quantity: 3,
      rate: 6500,
      unit: 'articles',
    },
    {
      id: '2',
      description: 'LinkedIn Thought Leadership Content Bundle (10 posts)',
      quantity: 1,
      rate: 12000,
      unit: 'bundle',
    },
    {
      id: '3',
      description: 'Whitepaper Editing & Formatting (16 pages)',
      quantity: 1,
      rate: 8500,
      unit: 'doc',
    },
  ],
  meta: {
    invoiceNumber: 'INV-CW-042',
    invoiceDate: formattedToday,
    dueDate: formattedDue,
    notes: 'Thank you for your collaboration! Full copyright transfers upon payment receipt.',
    terms: '1. This is a Non-GST Bill / Invoice issued by an unregistered dealer / composition scheme dealer under GST rules. No tax is charged.\n2. Payment terms: 15 days.\n3. Bank wire or UPI accepted.',
    currencySymbol: '₹',
    discountType: 'flat',
    discountValue: 2000,
    additionalChargesLabel: '',
    additionalChargesAmount: 0,
    roundOff: true,
    paymentMode: 'bank',
    showPaymentDetails: true,
    showUpiQr: false,
    showBankDetails: true,
    showSignature: true,
    colorTheme: 'navy',
    customTitle: 'BILL OF SUPPLY',
  },
};
