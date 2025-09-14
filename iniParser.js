/**
 * Parse INI file content into a JavaScript object
 * @param {string} content - The INI file content as a string
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed INI data
 */
export function ini(content, options = {}) {
  const opts = {
    // Whether to preserve key case (default: false, converts to lowercase)
    preserveCase: false,
    // Whether to allow duplicate keys (creates arrays)
    allowDuplicates: false,
    // Whether to parse values as their appropriate types
    parseValues: true,
    // Whether to include comments in the result
    includeComments: false,
    // Comment characters
    commentChars: [';', '#'],
    ...options
  };

  const result = {};
  const lines = content.split(/\r?\n/);
  let currentSection = null;
  let lineNumber = 0;

  for (let line of lines) {
    lineNumber++;

    // Trim whitespace
    line = line.trim();

    // Skip empty lines
    if (!line) continue;

    // Handle comments
    let commentIndex = -1;
    for (const commentChar of opts.commentChars) {
      const index = line.indexOf(commentChar);
      if (index !== -1 && (commentIndex === -1 || index < commentIndex)) {
        commentIndex = index;
      }
    }

    let comment = null;
    if (commentIndex !== -1) {
      comment = line.substring(commentIndex + 1).trim();
      line = line.substring(0, commentIndex).trim();
    }

    // Skip lines that are only comments
    if (!line && comment) {
      if (opts.includeComments) {
        if (!result._comments) result._comments = [];
        result._comments.push({ line: lineNumber, text: comment, section: currentSection });
      }
      continue;
    }

    // Handle sections [section_name]
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      if (!opts.preserveCase) {
        currentSection = currentSection.toLowerCase();
      }

      if (!result[currentSection]) {
        result[currentSection] = {};
      }

      if (opts.includeComments && comment) {
        if (!result[currentSection]._comments) result[currentSection]._comments = [];
        result[currentSection]._comments.push({ line: lineNumber, text: comment });
      }
      continue;
    }

    // Handle key-value pairs
    const kvMatch = line.match(/^([^=]+?)=(.*)$/);
    if (kvMatch) {
      let key = kvMatch[1].trim();
      let value = kvMatch[2].trim();

      if (!opts.preserveCase) {
        key = key.toLowerCase();
      }

      // Parse value types
      if (opts.parseValues) {
        value = parseValue(value);
      }

      // Determine target object (section or root)
      const target = currentSection ? result[currentSection] : result;

      // Handle duplicate keys
      if (opts.allowDuplicates && target.hasOwnProperty(key)) {
        if (!Array.isArray(target[key])) {
          target[key] = [target[key]];
        }
        target[key].push(value);
      } else {
        target[key] = value;
      }

      // Add inline comments
      if (opts.includeComments && comment) {
        const commentsKey = `_comments_${key}`;
        if (!target[commentsKey]) target[commentsKey] = [];
        target[commentsKey].push({ line: lineNumber, text: comment });
      }
    }
  }

  return result;
}

/**
 * Parse a value string into appropriate JavaScript type
 * @param {string} value - The value to parse
 * @returns {*} Parsed value
 */
function parseValue(value) {
  // Remove surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Boolean values
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Null/undefined
  if (value.toLowerCase() === 'null') return null;
  if (value.toLowerCase() === 'undefined') return undefined;

  // Numbers
  if (/^-?\d+$/.test(value)) {
    return parseInt(value, 10);
  }

  if (/^-?\d*\.\d+$/.test(value)) {
    return parseFloat(value);
  }

  // Return as string if no other type matches
  return value;
}

/**
 * Stringify an object back to INI format
 * @param {Object} obj - The object to stringify
 * @param {Object} options - Stringification options
 * @returns {string} INI formatted string
 */
export function toIni(obj) {
  const lines = [];

  // Handle root level properties first
  Object.keys(obj).forEach(key => {
    if (key.startsWith('_comments')) return; // Skip comment metadata

    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return; // Skip sections for now
    }

    lines.push(`${key}=${formatValue(value)}`);
  });

  // Handle sections
  Object.keys(obj).forEach(key => {
    if (key.startsWith('_comments')) return; // Skip comment metadata

    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      lines.push(''); // Empty line before section
      lines.push(`[${key}]`);

      Object.keys(value).forEach(subKey => {
        if (subKey.startsWith('_comments')) return;
        lines.push(`${subKey}=${formatValue(value[subKey])}`);
      });
    }
  });

  return lines.join('\n');
}

function formatValue(value) {
  if (typeof value === 'string' && (value.includes('=') || value.includes('\n'))) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return String(value);
}

