import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easeOutQuart, interpolateValue, formatAnimatedNumber } from '../animationUtils.ts';

test('easeOutQuart: boundary and curve values', () => {
  assert.equal(easeOutQuart(0), 0);
  assert.equal(easeOutQuart(1), 1);
  assert.equal(easeOutQuart(-0.5), 0);
  assert.equal(easeOutQuart(1.5), 1);
  // Quartic curve at 0.5 is 1 - (0.5)^4 = 0.9375
  assert.equal(easeOutQuart(0.5), 0.9375);
});

test('interpolateValue: smoothly transitions from start to end', () => {
  assert.equal(interpolateValue(10, 50, 0), 10);
  assert.equal(interpolateValue(10, 50, 1), 50);

  // Transitioning downward (e.g. 2.9 ha to 1.8 ha)
  const mid = interpolateValue(2.9, 1.8, 0.5);
  // 2.9 + (1.8 - 2.9) * 0.9375 = 2.9 - 1.03125 = 1.86875
  assert.ok(mid < 2.9 && mid > 1.8);
});

test('formatAnimatedNumber: handles decimals and integers properly', () => {
  assert.equal(formatAnimatedNumber(2.9, 1), '2.9');
  assert.equal(formatAnimatedNumber(2.94, 1), '2.9');
  assert.equal(formatAnimatedNumber(26.2, 0), '26');
  assert.equal(formatAnimatedNumber(26.8, 0), '27');
  assert.equal(formatAnimatedNumber(155, 0), '155');
});
