// Blocklist of known IP terms, trademarks, and copyrighted characters
const IP_BLOCKLIST = [
  // Disney
  'disney', 'mickey mouse', 'minnie mouse', 'donald duck', 'goofy', 'winnie the pooh',
  'frozen', 'elsa', 'anna', 'moana', 'mulan', 'aladdin', 'ariel', 'belle', 'cinderella',
  'pixar', 'toy story', 'buzz lightyear', 'woody', 'finding nemo', 'monsters inc',
  'marvel', 'spiderman', 'iron man', 'captain america', 'thor', 'hulk', 'avengers',
  'star wars', 'darth vader', 'yoda', 'luke skywalker',
  
  // Other IP
  'pokemon', 'pikachu', 'nintendo', 'super mario', 'sonic the hedgehog',
  'harry potter', 'hogwarts', 'wizard', 'wizarding world',
  'batman', 'superman', 'wonder woman', 'dc comics',
  'peppa pig', 'paw patrol', 'bluey', 'cocomelon',
  'minecraft', 'fortnite', 'roblox',
  
  // Trademarks
  'nike', 'adidas', 'apple logo', 'mcdonalds', 'coca cola', 'pepsi',
  'starbucks', 'target', 'walmart',
  
  // Celebrities (sample)
  'taylor swift', 'beyonce', 'justin bieber', 'harry styles',
];

// Regex patterns for additional checks
const TRADEMARK_PATTERNS = [
  /\b(nike|adidas|apple|mcdonalds|starbucks)\b/gi,
  /\b(logo|trademark|copyright)\b/gi,
];

/**
 * Sanitize and validate user input before job creation
 */
export interface SanitizationResult {
  isValid: boolean;
  reason?: string;
  sanitized?: string;
}

export function sanitizeInput(input: string): SanitizationResult {
  const lowerInput = input.toLowerCase().trim();

  if (!lowerInput || lowerInput.length === 0) {
    return { isValid: false, reason: 'Input cannot be empty' };
  }

  // Check blocklist
  for (const blocked of IP_BLOCKLIST) {
    if (lowerInput.includes(blocked.toLowerCase())) {
      return {
        isValid: false,
        reason: `This request may contain copyrighted characters or trademarks (${blocked}). Please revise your description.`,
      };
    }
  }

  // Check trademark patterns
  for (const pattern of TRADEMARK_PATTERNS) {
    if (pattern.test(lowerInput)) {
      return {
        isValid: false,
        reason: 'This request may contain trademarked terms. Please revise your description.',
      };
    }
  }

  // Basic length check
  if (lowerInput.length > 500) {
    return { isValid: false, reason: 'Input is too long (max 500 characters)' };
  }

  return { isValid: true, sanitized: input.trim() };
}
