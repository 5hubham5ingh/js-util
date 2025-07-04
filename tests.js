import "./main.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function describe(name, fn) {
  console.log(`\n--- ${name} ---`);
  fn();
}

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    testResults.push(`  ✓ ${name}`);
  } catch (error) {
    failedTests++;
    testResults.push(`  ✗ ${name}`);
    testResults.push(`      Error: ${error.message}`);
  }
}

function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(message);
  }
}

assert.deepEqual = function(actual, expected, message) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(message || `Failed: Expected ${expectedJson}, but got ${actualJson}`);
  }
};

assert.throws = function(fn, message) {
  let caught = false;
  try { fn(); } catch (e) { caught = true; }
  if (!caught) { throw new Error(message || `Expected function to throw, but it did not.`); }
}

function runTests() {
  console.log("\n--- Test Summary ---");
  testResults.forEach(line => console.log(line));
  console.log("\n--------------------");
  console.log(`Total: ${totalTests}, Passed: ${passedTests}, Failed: ${failedTests}`);
  if (failedTests > 0) { std.exit(1); }
}


describe("Global Properties", () => {
  it("should define global aliases for std, os, and JSON functions", () => {
    assert(globalThis.std === std, "globalThis.std should be defined");
    assert(globalThis.os === os, "globalThis.os should be defined");
    assert(globalThis.parse === JSON.parse, "globalThis.parse should be an alias for JSON.parse");
  });

  it("should define aliases for exec functions", () => {
    assert(typeof globalThis.exec === 'function', "globalThis.exec (execSync) should be a function");
  });

  it("should define aliases for execAsync functions", () => {
    assert(typeof globalThis.execAsync === 'function', "globalThis.execAsync should be a function");
  })

  it("should return and cache 'pwd'", () => {
    const firstPwd = globalThis.pwd;
    const secondPwd = globalThis.pwd;
    assert(typeof firstPwd === 'string' && firstPwd.length > 0, "pwd should return a non-empty string");
    assert.deepEqual(firstPwd, secondPwd, "Subsequent calls to pwd should return the cached value");
  });

  it("should return and cache 'hd' (HOME directory)", () => {
    const firstHd = globalThis.hd;
    const secondHd = globalThis.hd;
    assert(typeof firstHd === 'string' && firstHd.length > 0, "hd should return a non-empty string");
    assert.deepEqual(firstHd, secondHd, "Subsequent calls to hd should return the cached value");
  });
});


describe("Object.prototype Modifications", () => {
  it(".stringify() should format an object to a JSON string with default spacing", () => {
    const obj = { a: 1, b: "test" };
    const expected = '{\n  "a": 1,\n  "b": "test"\n}';
    assert.deepEqual(obj.stringify(), expected);
  });

  it(".pipe(callBack) should call the callBack with 'this' as argument and return it", () => {
    const obj = { name: "test", count: 3 }
    const expected = 3
    assert.deepEqual(obj.pipe(v => v.count), expected)
  })
});


describe("Array.prototype Modifications", () => {
  it(".for() should iterate over each element and be chainable", () => {
    const arr = [1, 2, 3];
    let sum = 0;
    const result = arr.for(e => sum += e).map(e => e * 2);
    assert.deepEqual(sum, 6, "Sum should be 6 after iteration");
    assert.deepEqual(result, [2, 4, 6], "Should be able to chain .map() after .for()");
  });

  it(".remove() should remove the first occurrence of specified items", () => {
    const arr = [1, 2, 3, 2, 4, 5];
    arr.remove(2, 4);
    assert.deepEqual(arr, [1, 3, 2, 5]);
  });

  it(".removeAll() should remove all occurrences of an item", () => {
    const arr = [1, 2, 3, 2, 4, 2];
    arr.removeAll(2);
    assert.deepEqual(arr, [1, 3, 4]);
  });

  it(".toCsvString() should convert an array of arrays to a CSV string", () => {
    const arr = [['name', 'age'], ['John', 30], ['Jane, "The Boss"', 25]];
    const expected = 'name,age\nJohn,30\n"Jane, ""The Boss""",25';
    assert.deepEqual(arr.toCsvString(), expected);
  });

  it(".toCsvArray() should convert a JSON object into an array of arrays of csv format", () => {
    const arr = [
      { head1: "val1", head2: "val2" },
      { head1: "val3", head2: "val4" }
    ]
    const expected = [
      ["head1", "head2"],
      ["val1", "val2"],
      ["val3", "val4"]
    ]

    assert.deepEqual(arr.toCsvArray(), expected)
  })

  it(".toCsvJson() should convert an array of arrays to JSON objects", () => {
    const arr = [['name', 'age'], ['John', '30'], ['Jane', '25']];
    const expected = [{ name: 'John', age: '30' }, { name: 'Jane', age: '25' }];
    assert.deepEqual(arr.toCsvJson(), expected);
  });

  it(".pipe(callBack) should call the callback with 'this' as argument and return it.", () => {
    const arr = [1, 23, 43]
    const expected = 23
    assert.deepEqual(arr.pipe(v => v[1]), expected)
  })

  it(".exec() should execute the array as shell command.", () => {
    const arr = ["echo", "test"]
    const expected = "test"
    assert.deepEqual(arr.exec(), expected)
  })

  it(".execAsync() should execute the array as command asynchronously and return a promise.", () => {
    const arr = ['echo', 'test']
    const expected = "test"
    assert(arr.execAsync().then(v => v), expected)
  })
});

describe("Number.prototype Modifications", () => {

  it(".pipe(callBack) should call the callback with 'this' as argument and return it.", () => {
    const num = 5
    const expected = 25
    assert.deepEqual(num.pipe(n => n * n), expected)
  })
})

describe("String.prototype Modifications", () => {
  const multiLineString = "line 1\nline 2: a b c\nline 3\nline 4\nline 5";

  it(".body(start, end) should extract a slice of lines", () => {
    assert.deepEqual(multiLineString.body(1, 4), "line 2: a b c\nline 3\nline 4");
  });

  it(".body(start, end, line) should extract a specific line from a slice", () => {
    assert.deepEqual(multiLineString.body(0, 5, 1), "line 2: a b c");
  });

  it(".body(start, end, line, word) should extract a specific word from a line", () => {
    assert.deepEqual(multiLineString.body(0, 5, 1, 2), "a", 'Word at index 2 should be "a"');
    assert.deepEqual(multiLineString.body(0, 5, 1, 3), "b", 'Word at index 3 should be "b"');
  });

  it(".body() should handle out of bounds gracefully", () => {
    assert.deepEqual(multiLineString.body(10, 20), "");
    assert.deepEqual(multiLineString.body(0, 5, 10), "");
    assert.deepEqual(multiLineString.body(0, 5, 1, 10), "");
  });

  it(".write() should write string content to a file", () => {
    const testFile = "test_write_output.tmp";
    const content = "Hello, file system!";
    try {
      content.write(testFile);
      const writtenContent = std.loadFile(testFile);
      assert.deepEqual(writtenContent, content, "File content should match the string written");
    } finally {
      os.remove(testFile);
    }
  });

  it(".parseJson() should parse a valid JSON string", () => {
    assert.deepEqual('{"a": 1}'.parseJson(), { a: 1 });
    assert.throws(() => '{"a": 1,'.parseJson(), "Should throw for invalid JSON");
  });

  it(".toCsvArray() should parse a CSV string with quoted fields", () => {
    const csv = 'a,"b,c",d\n1,"2""3",4';
    const expected = [['a', 'b,c', 'd'], ['1', '2"3', '4']];
    assert.deepEqual(csv.toCsvArray(), expected);
  });

  it(".toCsvJson() should convert a CSV string to an array of JSON objects", () => {
    const csv = 'name,age,city\nAlice,30,"New York"';
    const expected = [{ name: "Alice", age: "30", city: "New York" }];
    assert.deepEqual(csv.toCsvJson(), expected);
  });

  it(".pipe(callBack) should call the callBack with 'this' as argument and return it.", () => {
    const name = "test string prototype.pipe"
    const expected = "string"
    assert.deepEqual(name.pipe(s => s.slice(5, 11)), expected)
  })

  it(".exec() should execute the string as command and return result.", () => {
    const str = 'echo test'
    const expected = 'test'
    assert(str.exec(), expected)
  })

  it(".execAsync() should execute the string as command and return a promise.", () => {
    const str = 'echo test'
    const expected = 'test'
    assert(str.execAsync().then(v => v), expected)
  })

  it(".lines() should return number of lines in the string", () => {
    const str = "line1 \n line2 \n line3 \n";
    const lines = str.lines()
    const expected = lines.length;
    assert(str.lines, expected)
  })

  it(".words() should return number of words in a stirng.", () => {
    const str = "word1 word2 \n word3 word4 \n word5 \n";
    const words = str.words()
    const expected = words.length
    assert(str.words, expected)
  })
});

runTests();
