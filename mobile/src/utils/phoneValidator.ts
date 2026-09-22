/**
 * Centralized Bangladeshi Phone Number Validation & Utility Helper
 * Supports: Grameenphone, Banglalink, Robi, Airtel, Teletalk
 */

export interface PhoneValidationResult {
  isValid: boolean;
  cleanNumber: string;
  error?: string;
  operator?: {
    name: string;
    code: 'gp' | 'banglalink' | 'robi' | 'airtel' | 'teletalk';
    color: string;
    icon: string;
  };
}

/**
 * Normalizes input: removes spaces, hyphens, parentheses, and leading +88 / 88.
 * Example: "+8801712-345678" -> "01712345678"
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  // Remove non-digit characters
  let digits = raw.replace(/\D/g, '');

  // Strip leading international code (+88 or 88)
  if (digits.startsWith('8801')) {
    digits = digits.slice(2);
  }

  return digits;
}

/**
 * Detects Bangladeshi Telecom Operator from prefix
 */
export function getOperatorFromPrefix(number: string): PhoneValidationResult['operator'] | undefined {
  const clean = normalizePhoneNumber(number);
  if (clean.length < 3) return undefined;

  const prefix = clean.slice(0, 3);
  switch (prefix) {
    case '017':
    case '013':
      return { name: 'Grameenphone', code: 'gp', color: '#0284c7', icon: 'cellular' };
    case '019':
    case '014':
      return { name: 'Banglalink', code: 'banglalink', color: '#f97316', icon: 'flash' };
    case '018':
      return { name: 'Robi', code: 'robi', color: '#dc2626', icon: 'radio' };
    case '016':
      return { name: 'Airtel', code: 'airtel', color: '#e11d48', icon: 'wifi' };
    case '015':
      return { name: 'Teletalk', code: 'teletalk', color: '#16a34a', icon: 'globe' };
    default:
      return undefined;
  }
}

/**
 * Validates Bangladeshi Phone Number:
 * 1. Must not be empty.
 * 2. Must start with '01'.
 * 3. 3rd digit must be 3, 4, 5, 6, 7, 8, or 9 (013-019).
 * 4. Must be exactly 11 digits long.
 * 5. Rejects obvious dummy numbers like 01700000000, 01711111111.
 */
export function validateBangladeshiPhoneNumber(raw: string): PhoneValidationResult {
  const clean = normalizePhoneNumber(raw);

  if (!clean) {
    return {
      isValid: false,
      cleanNumber: '',
      error: 'মোবাইল নম্বর দেওয়া আবশ্যক (Mobile number is required)',
    };
  }

  // Check prefix: Must start with 01
  if (!clean.startsWith('01')) {
    return {
      isValid: false,
      cleanNumber: clean,
      error: 'বাংলাদেশি নম্বর অবশ্যই ০১ দিয়ে শুরু হতে হবে (যেমন: 017XXXXXXXX)',
    };
  }

  // Check 3rd digit: 013, 014, 015, 016, 017, 018, 019
  const operator = getOperatorFromPrefix(clean);
  if (clean.length >= 3 && !operator) {
    return {
      isValid: false,
      cleanNumber: clean,
      error: 'অকার্যকর অপারেটর কোড। শুধুমাত্র 013, 014, 015, 016, 017, 018, 019 গ্রহণযোগ্য।',
    };
  }

  // Check total length
  if (clean.length !== 11) {
    return {
      isValid: false,
      cleanNumber: clean,
      operator,
      error: `মোবাইল নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে (বর্তমানে ${clean.length} ডিজিট)`,
    };
  }

  // Check for dummy/spam numbers (e.g. 01700000000, 01711111111, 01888888888)
  const restOfDigits = clean.slice(3);
  const allSame = restOfDigits.split('').every((char) => char === restOfDigits[0]);
  if (allSame) {
    return {
      isValid: false,
      cleanNumber: clean,
      operator,
      error: 'অনুগ্রহ করে একটি সঠিক ও সক্রিয় মোবাইল নম্বর দিন',
    };
  }

  return {
    isValid: true,
    cleanNumber: clean,
    operator,
  };
}

/**
 * Formats a clean 11-digit number into readable format:
 * "01712345678" -> "01712-345678"
 */
export function formatPhoneNumberDisplay(raw: string): string {
  const clean = normalizePhoneNumber(raw);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5, 11)}`;
}
