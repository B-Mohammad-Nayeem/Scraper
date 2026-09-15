export interface NormalizedPhoneResult {
  raw_phone: string;
  normalized_phone: string;
  country_code: string;
  phone_type: 'Primary' | 'Emergency' | 'Reception' | 'Customer Care';
  is_valid: boolean;
}

export function normalizePhoneNumber(
  rawPhone: string | undefined | null,
  context?: { isHospital?: boolean; label?: string }
): NormalizedPhoneResult {
  if (!rawPhone || typeof rawPhone !== 'string' || rawPhone.trim() === '' || rawPhone.toLowerCase().includes('not available')) {
    return {
      raw_phone: 'Not available',
      normalized_phone: 'Not available',
      country_code: '',
      phone_type: 'Primary',
      is_valid: false
    };
  }

  const cleaned = rawPhone.trim();

  // Check if explicitly emergency phone
  const lower = cleaned.toLowerCase();
  const isEmergency =
    lower.includes('emergency') ||
    cleaned === '108' ||
    cleaned === '102' ||
    (context?.label && context.label.toLowerCase().includes('emergency'));

  // Strip non-digit characters except leading plus
  const digitsOnly = cleaned.replace(/[^\d+]/g, '');

  let countryCode = '+91'; // default Indian context
  let nationalNumber = '';

  if (digitsOnly.startsWith('+91')) {
    nationalNumber = digitsOnly.slice(3);
  } else if (digitsOnly.startsWith('0091')) {
    nationalNumber = digitsOnly.slice(4);
  } else if (digitsOnly.startsWith('+')) {
    // Other international code
    return {
      raw_phone: cleaned,
      normalized_phone: cleaned,
      country_code: digitsOnly.slice(0, 3),
      phone_type: isEmergency ? 'Emergency' : 'Primary',
      is_valid: digitsOnly.length >= 8
    };
  } else if (digitsOnly.startsWith('0') && digitsOnly.length >= 11) {
    // 0 followed by 10 digits mobile or std code
    nationalNumber = digitsOnly.slice(1);
  } else {
    nationalNumber = digitsOnly;
  }

  // Format valid 10-digit mobile or landline
  let formatted = cleaned;
  let isValid = false;

  if (nationalNumber.length === 10) {
    // Format: +91 XXXXX XXXXX
    formatted = `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;
    isValid = true;
  } else if (nationalNumber.length >= 8 && nationalNumber.length <= 11) {
    // Landline or short code (e.g. 040 2311 0000 or 108)
    formatted = `+91 ${nationalNumber}`;
    isValid = true;
  } else if (digitsOnly === '108' || digitsOnly === '102') {
    formatted = digitsOnly;
    isValid = true;
  }

  let phoneType: 'Primary' | 'Emergency' | 'Reception' | 'Customer Care' = 'Primary';
  if (isEmergency) {
    phoneType = 'Emergency';
  } else if (lower.includes('reception') || lower.includes('desk')) {
    phoneType = 'Reception';
  } else if (lower.includes('toll') || lower.includes('care') || lower.includes('support')) {
    phoneType = 'Customer Care';
  }

  return {
    raw_phone: cleaned,
    normalized_phone: isValid ? formatted : cleaned,
    country_code: countryCode,
    phone_type: phoneType,
    is_valid: isValid
  };
}
