import test from 'node:test';
import assert from 'node:assert/strict';
import { findProduct, allProducts, findEdition } from './editions.js';

test('every style has a product page slug', () => {
  const products = allProducts();
  assert.ok(products.length >= 4);
  const slugs = new Set(products.map((product) => product.slug));
  assert.equal(slugs.size, products.length);
  assert.ok(findProduct('cute-mimi'));
  assert.equal(findProduct('missing-sticker'), null);
});

test('limited edition uses original design files only', () => {
  const limited = findEdition('limited');
  assert.equal(limited.styles.length, 4);
  const names = limited.styles.map((style) => style.name).join(' ');
  assert.doesNotMatch(names, /naruto|luffy|goku|sailor/i);
  for (const style of limited.styles) {
    assert.match(style.image, /^\/assets\/limited\//);
  }
});
