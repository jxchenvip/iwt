const iwt = require("../index");

test("test iwt", () => {
  const func = () => {};
  expect(iwt.getValue("array", "test")).toEqual([]);
  expect(iwt.array("array")).toEqual([]);
  expect(iwt.array("number", 1)).toEqual(1);
  expect(iwt.number(1)).toEqual(1);
  expect(iwt.function(1, func)).toBe(func);
  expect(iwt.formatNumber(0.1+0.2)).toBe(0.3);
  expect(iwt.formatNumber('a')).toBe(NaN);
  expect(iwt.formatNumber(Infinity)).toEqual(Infinity);
  expect(iwt.formatNumber(-Infinity)).toEqual(-Infinity);
  expect(iwt.formatNumber(.1)).toEqual(0.1);
  expect(iwt.formatNumber(.1*0.111111111111111111111111)).toEqual(0.011111111111111);
  expect(iwt.formatNumber(0.1+0.2, 2)).toBe('0.30')
  expect(iwt.formatNumber(0.1+0.2, 21)).toBe(0.3)
});
