/**
 * Tokenizes parameter assignments from string inputs like:
 * 'board = [["A","B"],["C","D"]], word = "ABCCED"'
 * Handles arbitrary nested brackets, quotes, and commas safely.
 */
const parseInputArguments = (inputRaw = '', paramNames = []) => {
  const result = {};
  if (!inputRaw || !inputRaw.trim()) return result;

  for (const name of paramNames) {
    const pattern = new RegExp(`(?:^|[,\\s])${name}\\s*=\\s*`);
    const match = pattern.exec(inputRaw);
    if (!match) continue;

    const startIdx = match.index + match[0].length;
    let endIdx = startIdx;
    let bracketDepth = 0;
    let braceDepth = 0;
    let inQuotes = false;
    let quoteChar = '';

    while (endIdx < inputRaw.length) {
      const char = inputRaw[endIdx];

      if (inQuotes) {
        if (char === quoteChar && inputRaw[endIdx - 1] !== '\\') {
          inQuotes = false;
        }
      } else {
        if (char === '"' || char === "'") {
          inQuotes = true;
          quoteChar = char;
        } else if (char === '[') {
          bracketDepth++;
        } else if (char === ']') {
          bracketDepth--;
        } else if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
        } else if (char === ',' && bracketDepth === 0 && braceDepth === 0) {
          break;
        }
      }
      endIdx++;
    }

    result[name] = inputRaw.slice(startIdx, endIdx).trim();
  }

  return result;
};

/**
 * Converts JSON-style brackets '[' and ']' to C++ initializer braces '{' and '}'
 */
const formatForCpp = (val = '', type = '') => {
  if (!val) {
    if (type.includes('vector')) return '{}';
    if (type === 'string') return '""';
    if (type === 'bool') return 'false';
    return '0';
  }

  if (type.includes('vector')) {
    return val.replace(/\[/g, '{').replace(/\]/g, '}');
  }

  return val;
};

/**
 * Dynamically generates C++, Python, and JavaScript execution drivers
 */
export const buildDynamicDriver = (signature, language, userCode, inputRaw, isSubmit = false) => {
  if (!signature || !signature.methodName) {
    return userCode;
  }

  const { methodName, returnType = 'void', params = [] } = signature;
  const delimiter = isSubmit ? '\n' : '\n___PREP_GENIUS_RETURN___\n';
  const paramNames = params.map((p) => p.name);
  const parsedArgs = parseInputArguments(inputRaw, paramNames);

  // 1. C++ DRIVER
  if (language === 'cpp') {
    const formattedArgs = params.map((p) => formatForCpp(parsedArgs[p.name], p.type));

    let printLogic = `cout << "${delimiter}" << ans << endl;`;
    if (returnType === 'bool') {
      printLogic = `cout << "${delimiter}" << (ans ? "true" : "false") << endl;`;
    } else if (returnType === 'vector<int>') {
      printLogic = `
    cout << "${delimiter}[";
    for (size_t i = 0; i < ans.size(); i++) {
        cout << ans[i] << (i + 1 < ans.size() ? "," : "");
    }
    cout << "]" << endl;
      `;
    } else if (returnType === 'vector<vector<int>>') {
      printLogic = `
    cout << "${delimiter}[";
    for (size_t i = 0; i < ans.size(); i++) {
        cout << "[";
        for (size_t j = 0; j < ans[i].size(); j++) {
            cout << ans[i][j] << (j + 1 < ans[i].size() ? "," : "");
        }
        cout << "]" << (i + 1 < ans.size() ? "," : "");
    }
    cout << "]" << endl;
      `;
    }

    return `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <stack>
#include <queue>
#include <algorithm>
using namespace std;

${userCode}

int main() {
    Solution sol;
    ${params.map((p, idx) => `${p.type} ${p.name} =${formattedArgs[idx]};`).join('\n    ')}
    auto ans = sol.${methodName}(${params.map((p) => p.name).join(', ')});
    ${printLogic}
    return 0;
}
`;
  }

  // 2. PYTHON DRIVER
  if (language === 'python') {
    const pyArgs = params
      .map((p) => {
        const val = parsedArgs[p.name];
        return `${p.name}=${val !== undefined && val !== '' ? val : 'None'}`;
      })
      .join(', ');

    return `
import json
from typing import List, Dict, Set, Optional

${userCode}

if __name__ == '__main__':
    sol = Solution()
    ans = sol.${methodName}(${pyArgs})
    print("${delimiter}")
    if isinstance(ans, bool):
        print("true" if ans else "false")
    else:
        print(json.dumps(ans).replace(" ", ""))
`;
  }

  // 3. JAVASCRIPT DRIVER
  if (language === 'javascript') {
    const jsArgs = params
      .map((p) => (parsedArgs[p.name] !== undefined && parsedArgs[p.name] !== '' ? parsedArgs[p.name] : 'undefined'))
      .join(', ');

    return `
${userCode}

const ans = ${methodName}(${jsArgs});
console.log("${delimiter}");
if (typeof ans === 'boolean') {
  console.log(ans ? 'true' : 'false');
} else {
  console.log(JSON.stringify(ans).replace(/\\s+/g, ''));
}
`;
  }

  return userCode;
};