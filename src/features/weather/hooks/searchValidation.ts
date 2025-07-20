export function validateSearchInput(input: string): {
  isValid: boolean;
  reason?: string;
} {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      reason: 'Search query cannot be empty',
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      reason: 'Search query must be at least 2 characters long',
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      reason: 'Search query too long (max 100 characters)',
    };
  }

  const meaninglessPatterns = [
    /^[0-9]+$/, // Only numbers
    /^[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]+$/, // Only special characters
    /^(.)\1{2,}$/, // Repeated characters (aaa, 111, etc.)
    /^[a-zA-Z]$/, // Single letter
    /^\s+$/, // Only whitespace
    /^[^a-zA-Z0-9\s]*$/, // No alphanumeric characters
  ];

  for (const pattern of meaninglessPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Invalid search pattern',
      };
    }
  }

  const spamPatterns = [
    /^(test|asdf|qwer|zxcv|hjkl|lorem|ipsum|dummy|sample|example)$/i,
    /^(abc|xyz|123|000|999|null|undefined|nan)$/i,
    /^(.)\1*$/, // Single character repeated
    /^\d{10,}$/, // Long number sequences
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Please enter a valid location name',
      };
    }
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'Search must contain at least one letter',
    };
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Invalid characters detected',
      };
    }
  }

  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"&]/g, '')
    .replace(/^[^\w\s]+|[^\w\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
