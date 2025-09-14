/**
 * A simplified, pure JavaScript parser for the TOML format.
 * This function converts a TOML string into a JavaScript object.
 * It supports basic data types, tables, and arrays of tables.
 *
 * @param {string} content The TOML content as a string.
 * @returns {object} A JavaScript object representing the TOML data.
 */
export function toml(content) {
  const lines = content.split(/\r?\n/);
  const result = {};
  let currentTable = result;
  let currentPath = [];

  // Regex patterns for different TOML elements
  const commentRegex = /#.*$/;
  const tableRegex = /^\[([a-zA-Z0-9_.-]+)\]$/;
  const arrayOfTablesRegex = /^\[\[([a-zA-Z0-9_.-]+)\]\]$/;
  const keyValueRegex = /^([a-zA-Z0-9_.-]+)\s*=\s*(.*)$/;

  /**
   * Parses a TOML value string into its corresponding JavaScript type.
   * @param {string} valStr - The string representation of the value.
   * @returns {any} The parsed JavaScript value.
   */
  const parseValue = (valStr) => {
    valStr = valStr.trim();

    // Boolean
    if (valStr === 'true') return true;
    if (valStr === 'false') return false;

    // Number (Integer or Float)
    if (!isNaN(valStr) && valStr.trim() !== "") {
      return Number(valStr);
    }

    // String
    if (valStr.startsWith('"') && valStr.endsWith('"')) {
      return valStr.slice(1, -1).replace(/\\"/g, '"');
    }

    // Array
    if (valStr.startsWith('[') && valStr.endsWith(']')) {
      const arrayContent = valStr.slice(1, -1).trim();
      if (arrayContent === '') return [];
      // This is a simplified array parser; it splits by comma and recursively parses.
      // It doesn't handle nested arrays within strings, etc.
      return arrayContent.split(',').map(item => parseValue(item.trim()));
    }

    // Inline Table (simplified)
    if (valStr.startsWith('{') && valStr.endsWith('}')) {
      const tableContent = valStr.slice(1, -1).trim();
      const table = {};
      const pairs = tableContent.split(',');
      pairs.forEach(pair => {
        const [key, val] = pair.split('=').map(s => s.trim());
        if (key && val) {
          table[key] = parseValue(val);
        }
      });
      return table;
    }

    // Fallback for unquoted strings or other types not handled
    return valStr;
  };

  /**
   * Resolves a path (e.g., ['a', 'b', 'c']) within the result object,
   * creating nested objects as needed.
   * @param {string[]} path - The keys representing the path.
   * @returns {object} The object at the resolved path.
   */
  const resolvePath = (path) => {
    let current = result;
    for (const key of path) {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    return current;
  };


  for (const line of lines) {
    let trimmedLine = line.trim().replace(commentRegex, '').trim();
    if (!trimmedLine) continue;

    let match;

    // Match [tables]
    if ((match = trimmedLine.match(tableRegex))) {
      currentPath = match[1].split('.');
      currentTable = resolvePath(currentPath);
      continue;
    }

    // Match [[array of tables]]
    if ((match = trimmedLine.match(arrayOfTablesRegex))) {
      const path = match[1].split('.');
      const key = path.pop();
      const parentTable = resolvePath(path);

      if (!parentTable[key]) {
        parentTable[key] = [];
      }
      const newTable = {};
      parentTable[key].push(newTable);
      currentTable = newTable;
      currentPath = [...path, key, parentTable[key].length - 1]; // Update path to point inside the new table
      continue;
    }

    // Match key = value
    if ((match = trimmedLine.match(keyValueRegex))) {
      const key = match[1];
      const valueStr = match[2];
      const value = parseValue(valueStr);

      const keyParts = key.split('.');
      const finalKey = keyParts.pop();
      let target = currentTable;

      // Create nested structure for dotted keys like `a.b.c = value`
      for (const part of keyParts) {
        if (!target[part] || typeof target[part] !== 'object') {
          target[part] = {};
        }
        target = target[part];
      }
      target[finalKey] = value;
    }
  }

  return result;
}


/**
 * Converts a JavaScript object into a TOML-formatted string.
 * This function supports basic data types, tables, and arrays of tables.
 *
 * @param {object} tomlObj The JavaScript object to convert.
 * @returns {string} The resulting TOML string.
 */
export function toToml(tomlObj) {
  let tomlString = "";

  /**
   * Stringifies a JavaScript value into its TOML representation.
   * @param {any} value - The JavaScript value.
   * @returns {string} The TOML string representation.
   */
  const stringifyValue = (value) => {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return `[ ${value.map(stringifyValue).join(', ')} ]`;
    }
    if (typeof value === 'object' && value !== null) {
      // Inline tables (simplified)
      const pairs = Object.entries(value).map(([k, v]) => `${k} = ${stringifyValue(v)}`);
      return `{ ${pairs.join(', ')} }`;
    }
    return '""'; // Default for unsupported types like null/undefined
  };

  /**
   * Recursively traverses the object to build the TOML string.
   * @param {object} currentObj - The object currently being processed.
   * @param {string} currentPath - The dot-separated path to the current object.
   */
  const buildToml = (currentObj, currentPath) => {
    const simpleKeys = [];
    const tableKeys = [];
    const arrayOfTablesKeys = [];

    // Separate keys into simple values, tables, and arrays of tables
    for (const key in currentObj) {
      if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
        const value = currentObj[key];
        if (Array.isArray(value) && value.every(item => typeof item === 'object' && !Array.isArray(item))) {
          arrayOfTablesKeys.push(key);
        } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          tableKeys.push(key);
        } else {
          simpleKeys.push(key);
        }
      }
    }

    // Write simple key-value pairs
    let hasWrittenHeader = false;
    if (simpleKeys.length > 0) {
      if (currentPath) {
        tomlString += `[${currentPath}]\n`;
        hasWrittenHeader = true;
      }
      simpleKeys.forEach(key => {
        tomlString += `${key} = ${stringifyValue(currentObj[key])}\n`;
      });
      tomlString += '\n'; // Add a newline after a block of keys
    }

    // Write tables
    tableKeys.forEach(key => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      buildToml(currentObj[key], newPath);
    });

    // Write arrays of tables
    arrayOfTablesKeys.forEach(key => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      currentObj[key].forEach(table => {
        tomlString += `[[${newPath}]]\n`;
        // We pass the table object itself, but with an empty path since its header is already written
        buildToml(table, ''); // Pass empty path as header is explicit
        // Reset hasWrittenHeader since buildToml might add its own newline
        hasWrittenHeader = false;
      });
    });
  };

  buildToml(tomlObj, '');
  return tomlString.trim();
}

