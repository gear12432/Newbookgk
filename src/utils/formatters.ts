/**
 * Format currency amount with Indian Numbering System for INR or standard formatting for others.
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber = '';

  if (symbol === '₹' || symbol === 'INR') {
    // Indian Numbering System: e.g. 1,00,000.00
    const parts = absAmount.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherNumbers = parts[0].substring(0, parts[0].length - 3);
    
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    
    // Omit decimals if zero
    if (parts[1] === '00') {
      formattedNumber = intPart;
    } else {
      formattedNumber = `${intPart}.${parts[1]}`;
    }
  } else {
    // Standard Intl format
    formattedNumber = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  const prefix = isNegative ? '-' : '';
  const finalSymbol = symbol === 'INR' ? '₹' : symbol;
  
  return `${prefix}${finalSymbol}${formattedNumber}`;
}

/**
 * Format date string (YYYY-MM-DD) into display string (DD/MM/YYYY)
 */
export function formatDateDDMMYYYY(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

/**
 * Format timestamp or ISO string to readable string e.g. "Today, 10 Mar 2026"
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateString === todayStr) {
    return 'Today';
  } else if (dateString === yesterdayStr) {
    return 'Yesterday';
  } else {
    return formatDateDDMMYYYY(dateString);
  }
}

/**
 * Format timestamp to time e.g. "10:30 AM"
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format raw number with commas e.g. 15,000 or 1,200
 */
export function formatNumberWithCommas(amount: number): string {
  if (amount === undefined || amount === null) return '0';
  const parts = Math.abs(amount).toFixed(2).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  if (parts[1] === '00') {
    return intPart;
  }
  return `${intPart}.${parts[1]}`;
}

/**
 * Format date and time for Cash Book table rows: e.g. "27 Feb 2021 07:46.pm"
 */
export function formatCashBookDate(dateString: string, timestamp?: number): string {
  if (!dateString) return '';
  const dateObj = new Date(dateString);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  let timeStr = '09:00.am';
  if (timestamp) {
    const t = new Date(timestamp);
    let hours = t.getHours();
    const minutes = String(t.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '.pm' : '.am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    timeStr = `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
  }

  return `${day} ${month} ${year} ${timeStr}`;
}

/**
 * Get Today's date string in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
