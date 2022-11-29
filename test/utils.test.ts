import assert from 'assert';
import _ from 'lodash';

import * as utils from '../lib/utils.js';

describe('Utils', () => {
  it('sortObjectKeys()', () => {
    const obj1 = { foo: 1, bar: 2, arr: [ 1, 2, 3 ], obj: { b: 1, a: 2 } };
    const result1 = '{"arr":[1,2,3],"bar":2,"foo":1,"obj":{"b":1,"a":2}}';

    assert.equal(JSON.stringify(utils.sortObjectKeys(obj1)), result1);

    const obj2 = { b: 1, a: 2, c: 3 };
    const result2 = '{"b":1,"a":2,"c":3}';

    assert.equal(JSON.stringify(obj2), result2);
  });

  it('sanitizeLink()', () => {
    assert.equal(utils.sanitizeLink('https://teletype.in'), 'https://teletype.in');
    assert.equal(utils.sanitizeLink('http://teletype.in'), 'http://teletype.in');
    assert.equal(utils.sanitizeLink('tg://teletype.in'), 'tg://teletype.in');
    assert.equal(utils.sanitizeLink('//teletype.in'), 'http://teletype.in');
    assert.equal(utils.sanitizeLink('/teletype.in'), '/teletype.in');
    assert.equal(utils.sanitizeLink('teletype.in'), 'teletype.in');
  });

  it('normalizeLink()', () => {
    assert.equal(utils.normalizeLink('https://teletype.in/?foo=bar&b&a&r=1&r=2#hash'), 'https://teletype.in/?a=&b=&foo=bar&r=2#hash');
    assert.equal(utils.normalizeLink('http://teletype.in/'), 'http://teletype.in/');
    assert.equal(utils.normalizeLink('ftp://teletype.in/'), 'ftp://teletype.in/');
    assert.equal(utils.normalizeLink('//teletype.in/?b=2&a=1'), 'http://teletype.in/?a=1&b=2');
    assert.throws(() => utils.normalizeLink('/teletype.in/?b=2&a=1'));
  });

  it('userAgentHeader()', () => {
    assert(_.isEmpty(utils.userAgentHeader()));
    assert.equal(JSON.stringify(utils.userAgentHeader('test')), '{"headers":{"user-agent":"test"}}');
  });

  it('parseSizes()', () => {
    assert.equal(utils.parseSizes(''), null);
    assert.deepEqual(utils.parseSizes('123x321'), { width: 123, height: 321 });
    assert.deepEqual(utils.parseSizes('s123x321'), { width: 123, height: 321 });
    assert.deepEqual(utils.parseSizes('123x32.1'), { width: 123, height: 32 });
    assert.deepEqual(utils.parseSizes('123X321'), { width: 123, height: 321 });
    assert.equal(utils.parseSizes('123х321'), null);
  });

  it('urlResolve()', () => {
    assert.equal(utils.urlResolve('/asd/dsa', 'https://teletype.in/foo/bar'), 'https://teletype.in/asd/dsa');
    assert.equal(utils.urlResolve('./asd/dsa', 'https://teletype.in/foo/bar'), 'https://teletype.in/foo/asd/dsa');
    assert.equal(utils.urlResolve('asd/dsa', 'https://teletype.in/foo/bar'), 'https://teletype.in/foo/asd/dsa');
    assert.equal(utils.urlResolve('asd/dsa?foo=bar', 'https://teletype.in/foo/bar'), 'https://teletype.in/foo/asd/dsa?foo=bar');
    assert.equal(utils.urlResolve('asd/dsa', 'https://teletype.in/foo/bar?asd=dsa'), 'https://teletype.in/foo/asd/dsa');
    assert.equal(utils.urlResolve('asd/dsa?foo=bar', 'https://teletype.in/foo/bar?asd=dsa'), 'https://teletype.in/foo/asd/dsa?foo=bar');
    assert.equal(utils.urlResolve('asd/dsa', 'foo/bar'), '/foo/asd/dsa');
    assert.equal(utils.urlResolve('https://mustapp.com/asd/dsa', 'https://teletype.in/foo/bar'), 'https://mustapp.com/asd/dsa');
  });

  it('getType()', () => {
    assert.equal(utils.getType('https://teletype.in/files/img1.jpg'), 'image/jpeg');
    assert.equal(utils.getType('https://teletype.in/files/img1.jpg?query#hash'), 'image/jpeg');
    assert.equal(utils.getType('https://teletype.in/files/img1'), null);
  });
});
