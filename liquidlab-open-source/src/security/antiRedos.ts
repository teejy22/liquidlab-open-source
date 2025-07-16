// Safe content scanning without ReDoS vulnerabilities

export function scanSuspiciousContent(content: string): string[] {
  // Limit input size to prevent ReDoS attacks
  if (content.length > 10000) {
    return ['Content exceeds maximum allowed size'];
  }

  const flaggedPatterns: string[] = [];
  const lowerContent = content.toLowerCase();

  // Use simple string checks instead of complex regex to avoid ReDoS
  const suspiciousKeywords = [
    'liquidlab.com', // Old domain
    'phishing',
    'scam',
    'hack',
    '100% guaranteed',
    'guaranteed returns',
    'investment opportunity',
    'crypto mining'
  ];

  // Check simple keywords
  for (const keyword of suspiciousKeywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      flaggedPatterns.push(keyword);
    }
  }

  // Safe regex patterns with bounded complexity
  const safePatterns = [
    { pattern: /javascript:/i, label: 'JavaScript URL' },
    { pattern: /<script\b/i, label: 'Script tag' },
    { pattern: /on(?:click|load|error|mouseover)\s*=/i, label: 'Event handler' },
  ];

  // Check safe regex patterns
  for (const { pattern, label } of safePatterns) {
    if (pattern.test(content)) {
      flaggedPatterns.push(label);
    }
  }

  // Check for fake verification codes more safely
  if (lowerContent.includes('verify') && lowerContent.includes('code') && /[A-Z0-9]{8}/.test(content)) {
    flaggedPatterns.push('Potential fake verification code');
  }

  // Check for wallet connection urgency
  if (lowerContent.includes('connect') && lowerContent.includes('wallet') && lowerContent.includes('now')) {
    flaggedPatterns.push('Urgent wallet connection request');
  }

  return flaggedPatterns;
}