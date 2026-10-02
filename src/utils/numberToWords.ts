/**
 * Converts a number to Indian Currency words (e.g. ₹1,500 -> "One Thousand Five Hundred Rupees Only")
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + ' ';
  }
  return str.trim();
}

export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Zero Rupees Only';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  if (rupees === 0 && paise === 0) {
    return 'Zero Rupees Only';
  }

  let words = '';

  const crore = Math.floor(rupees / 10000000);
  const remainderAfterCrore = rupees % 10000000;

  const lakh = Math.floor(remainderAfterCrore / 100000);
  const remainderAfterLakh = remainderAfterCrore % 100000;

  const thousand = Math.floor(remainderAfterLakh / 1000);
  const remainderAfterThousand = remainderAfterLakh % 1000;

  const hundreds = remainderAfterThousand;

  if (crore > 0) {
    words += convertBelowThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand) + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertBelowThousand(hundreds) + ' ';
  }

  words = words.trim();
  if (words.length > 0) {
    words += ' Rupees';
  }

  if (paise > 0) {
    const paiseWords = convertBelowThousand(paise);
    if (words.length > 0) {
      words += ' and ' + paiseWords + ' Paise';
    } else {
      words = paiseWords + ' Paise';
    }
  }

  words += ' Only';

  return (isNegative ? 'Minus ' : '') + words.replace(/\s+/g, ' ');
}
