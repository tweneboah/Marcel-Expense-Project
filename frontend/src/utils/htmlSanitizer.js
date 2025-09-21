/**
 * Safely sanitizes HTML content by removing potentially dangerous elements
 * and converting HTML to safe text representation
 */

/**
 * Converts HTML instructions to safe text by removing HTML tags
 * and converting common HTML entities to readable text
 * @param {string} htmlString - The HTML string to sanitize
 * @returns {string} - Safe text representation
 */
export const sanitizeHtmlInstructions = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }

  // Create a temporary div to parse HTML safely
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  
  // Get text content which automatically strips HTML tags
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up common HTML entities and formatting
  textContent = textContent
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  return textContent;
};

/**
 * Extracts and formats direction instructions from Google Maps HTML
 * Specifically handles common Google Maps instruction patterns
 * @param {string} htmlString - The HTML instruction string
 * @returns {string} - Formatted safe instruction text
 */
export const formatDirectionInstruction = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }

  // First sanitize the HTML
  let instruction = sanitizeHtmlInstructions(htmlString);
  
  // Handle common Google Maps instruction patterns
  instruction = instruction
    .replace(/Head\s+/i, 'Head ')
    .replace(/Turn\s+/i, 'Turn ')
    .replace(/Continue\s+/i, 'Continue ')
    .replace(/Take\s+/i, 'Take ')
    .replace(/Merge\s+/i, 'Merge ')
    .replace(/Exit\s+/i, 'Exit ')
    .replace(/Keep\s+/i, 'Keep ')
    .replace(/Slight\s+/i, 'Slight ')
    .replace(/Sharp\s+/i, 'Sharp ');

  return instruction;
};

/**
 * Alternative approach using DOMParser for more robust HTML parsing
 * Use this if the above method doesn't work in all browsers
 * @param {string} htmlString - The HTML string to sanitize
 * @returns {string} - Safe text representation
 */
export const sanitizeHtmlInstructionsWithParser = (htmlString) => {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }

  try {
    // Use DOMParser for safer HTML parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Get text content from the parsed document
    const textContent = doc.body.textContent || doc.body.innerText || '';
    
    return textContent
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    // Fallback to simple regex-based cleaning
    return htmlString
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
};