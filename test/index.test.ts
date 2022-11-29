import assert from 'assert';
import { enrichLink } from '../lib/index';

import nock from 'nock';


describe('Main', () => {
  before(async () => {
    nock('https://teletype.in').get('/404').reply(404);
    nock('https://teletype.in').get('/text').reply(200, 'Hello');

    nock('https://teletype.in').get('/img.jpeg').reply(200, Buffer.alloc(100), {
      'content-type': 'image/jpeg',
      'content-length': '100500',
      'content-disposition': 'form-data; name="image"; filename="DS91834.jpg"'
    });

    nock('https://teletype.in').get('/vid.mp4').reply(200, Buffer.alloc(100), {
      'content-type': 'video/mp4',
      'content-length': '100500'
    });

    nock('https://teletype.in').get('/file.pdf').reply(200, Buffer.alloc(100), {
      'content-type': 'application/pdf',
      'content-length': '100500',
      'content-disposition': 'form-data; name="file"; filename="Document.pdf"'
    });

    nock('https://teletype.in').get('/oembed.xml').reply(200, `
      <?xml version="1.0" encoding="utf-8"?>
      <oembed>
        <version>1.0</version>
        <type>photo</type>
        <title>ZB8T0193</title>
        <url>http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg</url>
      </oembed>
    `, {
      'content-type': 'text/xml'
    });
    nock('https://teletype.in').get('/oembed.json').reply(200, JSON.stringify({
      'version': '1.0',
      'type': 'rich',
      'html': '<blockqoute>Twit</blockqoute>',
    }), {
      'content-type': 'application/json'
    });

    nock('https://teletype.in').get('/').times(10).reply(200, `
      <html>
        <head>
          <title>Teletype</title>
          <link rel="alternate" type="text/xml+oembed" href="/oembed.xml">
          <link rel="alternate" type="application/json+oembed" href="/oembed.json">
        </head>
      </html>
    `, {
      'content-type': 'text/html',
      'content-length': '100500'
    });
  });

  it('enrichLink()', async () => {
    assert.equal(await enrichLink('https://teletype.in/404'), null);

    assert.deepEqual(await enrichLink('https://teletype.in/img.jpeg'), {
      image: {
        type: 'image/jpeg',
        ext: 'jpeg',
        name: 'DS91834.jpg',
        size: 100500
      },
      attachment: {
        type: 'image/jpeg',
        ext: 'jpeg',
        name: 'DS91834.jpg',
        size: 100500
      }
    });

    assert.deepEqual(await enrichLink('https://teletype.in/text'), {});

    assert.deepEqual(await enrichLink('https://teletype.in/vid.mp4'), {
      video: {
        type: 'video/mp4',
        ext: 'mp4',
        name: 'vid.mp4',
        size: 100500
      }
    });

    assert.deepEqual(await enrichLink('https://teletype.in/file.pdf'), {
      attachment: {
        type: 'application/pdf',
        ext: 'pdf',
        name: 'Document.pdf',
        size: 100500
      }
    });

    assert.deepEqual(await enrichLink('https://teletype.in/'), {
      webpage: {
        type: 'website',
        url: 'https://teletype.in/',
        title: 'Teletype',
        name: null,
        description: null,
        icons: [], images: [], videos: [], audios: []
      },
      oembed: {
        author: null,
        height: null,
        href: null,
        html: '<blockqoute>Twit</blockqoute>',
        provider: null,
        thumbnail: null,
        title: null,
        type: 'rich',
        width: null,
      }
    });
  });
});
