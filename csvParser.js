/*
# Helper to parse CSV
## CSV JSON 
- Array of objects

## CSV Array
- Array of arrays.

## CSV Text
- Delimiter seperated values in \n seperated lines
*/


// From array to other formats
export function csvArrayToCsvJson(array, delimiter = ',') { return csvTextToCsvJson(csvArrayToCsvText(array, delimiter), delimiter) }
export function csvArrayToCsvText(array, delimiter = ',') {
  if (array.length === 0) {
    return "";
  }

  let dataAsArrayOfArrays;
  const firstElement = array[0];

  if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
    const headers = Object.keys(firstElement);
    const dataRows = array.map(obj => headers.map(header => obj[header]));
    dataAsArrayOfArrays = [headers, ...dataRows];
  } else {
    dataAsArrayOfArrays = array.map(item => Array.isArray(item) ? item : [item]);
  }

  return dataAsArrayOfArrays.map(row =>
    row.map(cell => {
      const str = (cell === null || cell === undefined) ? '' : String(cell);

      const needsQuotes = str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r');

      if (!needsQuotes) {
        return str;
      }

      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(delimiter)
  ).join('\n');
}

// From CSV string to other formats
export function csvTextToCsvArray(csvText, delimiter = ',') {
  const rows = csvText.trim().split(/\r?\n/);
  return rows.map(row => {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current);
    return cells;
  });
}

export function csvTextToCsvJson(csvText, delimiter = ',') {
  const rows = csvTextToCsvArray(csvText, delimiter)
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((key, i) => {
      obj[key] = row[i] ?? '';
    });
    return obj;
  });
}

// From JSON to other formats
export function csvJsonToCsvText(csvJson) { return csvArrayToCsvText(csvJsonToCsvArray(csvJson)) }
export function csvJsonToCsvArray(csvJson) {
  if (csvJson.length === 0) {
    return [];
  }

  const firstElement = csvJson[0];

  if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
    const headerSet = new Set();
    csvJson.forEach(obj => {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => headerSet.add(key));
      }
    });

    const headers = Array.from(headerSet).sort();

    const dataRows = csvJson.map(obj => {
      if (typeof obj !== 'object' || obj === null) {
        return new Array(headers.length).fill(undefined);
      }
      return headers.map(header => obj[header]);
    });

    return [headers, ...dataRows];
  }

  if (Array.isArray(firstElement)) {
    return csvJson;
  }

  return csvJson.map(item => [item]);
}

