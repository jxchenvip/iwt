function isNumber(x) {
  return typeof x === "number";
}

/**
 * Convert a number to a formatted string representation.
 *
 * Syntax:
 *
 *    format(value)
 *    format(value, precision)
 *
 * Where:
 *
 *    {number} value   The value to be formatted
 *    {Object} options An object with formatting options. Available options:
 *                     {string} notation
 *                         Number notation. Choose from:
 *                         'auto' (default) Regular number notation for numbers
 *                                          having an absolute value between
 *                                          `lowerExp` and `upperExp` bounds, and
 *                                          uses exponential notation elsewhere.
 *                                          Lower bound is included, upper bound
 *                                          is excluded.
 *                                          For example '123.4' and '1.4e7'.
 *                     {number} precision   A number between 0 and 16 to round
 *                                          the digits of the number.
 *                                          In case of notations 'exponential',
 *                                          'engineering', and 'auto',
 *                                          `precision` defines the total
 *                                          number of significant digits returned.
 *                                          In case of notation 'fixed',
 *                                          `precision` defines the number of
 *                                          significant digits after the decimal
 *                                          point.
 *                                          `precision` is undefined by default,
 *                                          not rounding any digits.
 *
 * Examples:
 *
 *    format(6.4)                                        // '6.4'
 *    format(1240000)                                    // '1.24e6'
 *    format(1/3)                                        // '0.3333333333333333'
 *    format(1/3, 3)                                     // '0.333'
 *    format(21385, 2)                                   // '21000'
 *
 * @param {number} value
 * @param {Object | Function | number} [options]
 * @return {string} str The formatted value
 */
function format(value, options) {
  // handle special cases
  if (value === Infinity) {
    return "Infinity";
  } else if (value === -Infinity) {
    return "-Infinity";
  } else if (isNaN(value)) {
    return "NaN";
  }
  let precision;
  if (options && isNumber(options)) {
    precision = options;
  }
  return toPrecision(value, precision).replace(
    /((\.\d*?)(0+))($|e)/,
    (a, b, c, d) => {
      const digits = b;
      const e = d;
      return digits !== "." ? digits + e : e;
    }
  );
}

/**
 * Split a number into sign, coefficients, and exponent
 * @param {number | string} value
 * @return {SplitValue}
 *              Returns an object containing sign, coefficients, and exponent
 */
function splitNumber(value) {
  // parse the input value
  const match = String(value)
    .toLowerCase()
    .match(/^0*?(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
  if (!match) {
    throw new SyntaxError(`Invalid number ${value}`);
  }

  const sign = match[1];
  const digits = match[2];
  let exponent = parseFloat(match[4] || "0");

  const dot = digits.indexOf(".");
  exponent += dot !== -1 ? dot - 1 : digits.length - 1;

  const coefficients = digits
    .replace(".", "") // remove the dot (must be removed before removing leading zeros)
    .replace(/^0*/, zeros1 => {
      // remove leading zeros, add their count to the exponent
      exponent -= zeros1.length;
      return "";
    })
    .replace(/0*$/, "") // remove trailing zeros
    .split("")
    .map(d => {
      return parseInt(d, 10);
    });

  if (coefficients.length === 0) {
    coefficients.push(0);
    exponent += 1;
  }

  return {
    sign,
    coefficients,
    exponent
  };
}

/**
 * Format a number with a certain precision
 * @param {number | string} value
 * @param {number} [precision=undefined] Optional number of digits.
 * @param {{lowerExp: number | undefined, upperExp: number | undefined}} [options]
 *                                       By default:
 *                                         lowerExp = -3 (incl)
 *                                         upper = +5 (excl)
 * @return {string}
 */
function toPrecision(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }

  const split = splitNumber(value);
  const rounded = precision ? roundDigits(split, precision) : split;
  let c = rounded.coefficients;
  const e = rounded.exponent;

  // append trailing zeros
  if (c.length < precision) {
    c = c.concat(zeros(precision - c.length));
  }

  // append trailing zeros
  // TODO: simplify the next statement
  c = c.concat(
    zeros(e - c.length + 1 + (c.length < precision ? precision - c.length : 0))
  );

  // prepend zeros
  c = zeros(-e).concat(c);

  const dot = e > 0 ? e : 0;
  if (dot < c.length - 1) {
    c.splice(dot + 1, 0, ".");
  }
  // console.log('rounded.sign + c.join("")', rounded.sign + c.join(""));
  return rounded.sign + c.join("");
}

/**
 * Round the number of digits of a number *
 * @param {SplitValue} split       A value split with .splitNumber(value)
 * @param {number} precision  A positive integer
 * @return {SplitValue}
 *              Returns an object containing sign, coefficients, and exponent
 *              with rounded digits
 */
function roundDigits(split, precision) {
  let newprecision = precision;
  // create a clone
  const rounded = {
    sign: split.sign,
    coefficients: split.coefficients,
    exponent: split.exponent
  };
  const c = rounded.coefficients;

  // prepend zeros if needed
  while (newprecision <= 0) {
    c.unshift(0);
    rounded.exponent += 1;
    newprecision += 1;
  }

  if (c.length > newprecision) {
    const removed = c.splice(newprecision, c.length - newprecision);

    if (removed[0] >= 5) {
      let i = newprecision - 1;
      c[i] += 1;
      while (c[i] === 10) {
        c.pop();
        if (i === 0) {
          c.unshift(0);
          rounded.exponent += 1;
          i += 1;
        }
        i -= 1;
        c[i] += 1;
      }
    }
  }

  return rounded;
}

/**
 * Create an array filled with zeros.
 * @param {number} length
 * @return {Array}
 */
function zeros(length) {
  const arr = [];
  for (let i = 0; i < length; i += 1) {
    arr.push(0);
  }
  return arr;
}

function isSpecialValue(val) {
  const maps = {
    Inifity: true,
    "-Inifity": true,
    NaN: true
  };
  return maps[val];
}

function formatNumber(value, dig) {
  const precision = 14;
  const val = Number(format(value, precision));
  const flag = isNumber(dig) && dig > -1 && dig < 21;
  return isSpecialValue(val) ? val : flag ? val.toFixed(dig) : val;
}

module.exports = {
  formatNumber
};
