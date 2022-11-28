import assert from 'assert';
import { load as Cheerio } from 'cheerio';

import * as parse from '../lib/parse.js';


describe('Parse', () => {
  it('file()', () => {
    assert.deepEqual(parse.file('https://teletype.in/file/img.jpg', 'image/png', 'form-data; name="image"; filename="cat.jpg"', '100500'), {
      name: 'cat.jpg', type: 'image/png', size: 100500, ext: 'png'
    });
    assert.deepEqual(parse.file('https://teletype.in/file/img.jpg', 'image/png', 'form-data; name="image"', '100500'), {
      name: 'img.jpg', type: 'image/png', size: 100500, ext: 'png'
    });
    assert.deepEqual(parse.file('https://teletype.in/file/img.jpg', 'image/png', null, '100500'), {
      name: 'img.jpg', type: 'image/png', size: 100500, ext: 'png'
    });
    assert.deepEqual(parse.file('https://teletype.in/file/img.jpg', 'image/png', null, null), {
      name: 'img.jpg', type: 'image/png', size: null, ext: 'png'
    });
    assert.deepEqual(parse.file('https://teletype.in/file/img.jpg', null, null, null), {
      name: 'img.jpg', type: 'image/jpeg', size: null, ext: 'jpeg'
    });
    assert.deepEqual(parse.file('https://teletype.in/file/img', null, null, null), {
      name: 'img', type: null, size: null, ext: null
    });
  });

  it('webpage()', () => {
    const page1 = Cheerio(`
      <html>
        <head>
          <link rel="icon" type="image/png" sizes="32x32" href="https://teletype.in/favicon.png" />
          <link rel="icon" sizes="any" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="https://teletype.in/apple-180.png" />
          <link rel="apple-touch-icon" sizes="256x256" href="https://teletype.in/apple-256.png" />
          <link rel="apple-touch-icon" type="image/jpeg" href="/apple-touch-icon.png" />
          <title>Teletype</title>
          <meta name="og:type" content="article">
          <meta name="og:url" content="https://teletype.in/cannon">
          <meta name="og:site_name" content="Teletype">
          <meta name="og:title" content="Title 1">
          <meta name="twitter:title" content="Title 2">
          <meta name="description" content="Descr 1">
          <meta name="og:description" content="Descr 2">
          <meta name="twitter:description" content="Descr 3">

          <meta property="og:image" content="http://teletype.in/og.png">
          <meta property="og:image:url" content="/og2.png">
          <meta property="og:image" content="http://teletype.in/og3.png">
          <meta property="og:image:secure_url" content="https://teletype.in/og3.png">
          <meta property="og:image:type" content="image/jpeg">
          <meta property="og:image:width" content="500">
          <meta property="og:image:height" content="500">
          <meta name="twitter:image" content="/twi.png">
          <meta name="twitter:image:src" content="/twi2.png">

          <meta property="og:video" content="http://teletype.in/og.mp4">
          <meta property="og:video:url" content="/og2.mp4">
          <meta property="og:video" content="http://teletype.in/og3.mp4">
          <meta property="og:video:secure_url" content="https://teletype.in/og3s.mp4">
          <meta property="og:video:type" content="video/webm">
          <meta property="og:video:width" content="500">
          <meta property="og:video:height" content="500">

          <meta property="og:audio" content="http://teletype.in/og.mp3">
          <meta property="og:audio:url" content="/og2.mp3">
          <meta property="og:audio" content="http://teletype.in/og3.mp3">
          <meta property="og:audio:secure_url" content="https://teletype.in/og3s.mp3">
          <meta property="og:audio:type" content="audio/ogg">
        </head>
      </html>
    `);

    assert.deepEqual(parse.webpage('https://teletype.in/', page1), {
      type: 'article',
      url: 'https://teletype.in/cannon',
      name: 'Teletype',
      title: 'Title 2',
      description: 'Descr 3',
      icons: [
        { rel: 'icon', url: 'https://teletype.in/favicon.png', type: 'image/png', width: 32, height: 32 },
        { rel: 'icon', url: 'https://teletype.in/favicon.ico', type: 'image/vnd.microsoft.icon' },
        { rel: 'apple-touch-icon', url: 'https://teletype.in/apple-180.png', type: 'image/png', width: 180, height: 180 },
        { rel: 'apple-touch-icon', url: 'https://teletype.in/apple-256.png', type: 'image/png', width: 256, height: 256 },
        { rel: 'apple-touch-icon', url: 'https://teletype.in/apple-touch-icon.png', type: 'image/jpeg' },
      ],
      images: [
        { url: 'http://teletype.in/og.png', type: 'image/png' },
        { url: 'https://teletype.in/og2.png', type: 'image/png' },
        { url: 'https://teletype.in/og3.png', type: 'image/jpeg', width: 500, height: 500 },
        { url: 'https://teletype.in/twi.png', type: 'image/png' },
        { url: 'https://teletype.in/twi2.png', type: 'image/png' },
      ],
      videos: [
        { url: 'http://teletype.in/og.mp4', type: 'video/mp4' },
        { url: 'https://teletype.in/og2.mp4', type: 'video/mp4' },
        { url: 'https://teletype.in/og3s.mp4', type: 'video/webm', width: 500, height: 500 },
      ],
      audios: [
        { url: 'http://teletype.in/og.mp3', type: 'audio/mpeg' },
        { url: 'https://teletype.in/og2.mp3', type: 'audio/mpeg' },
        { url: 'https://teletype.in/og3s.mp3', type: 'audio/ogg' },
      ]
    });

    const page2 = Cheerio(`
      <html>
        <head></head>
      </html>
    `);

    assert.deepEqual(parse.webpage('https://teletype.in/', page2), {
      type: 'website',
      url: 'https://teletype.in/',
      name: null,
      title: null,
      description: null,
      icons: [],
      images: [],
      videos: [],
      audios: []
    });
  });

  it('oembedJSON()', () => {
    assert.deepEqual(parse.oembedJSON({
      'version': '1.0',
      'type': 'photo',
      'width': 240,
      'height': 160,
      'title': 'ZB8T0193',
      'url': 'http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg',
      'thumbnail_url': 'http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_thumb.jpg',
      'thumbnail_width': 100,
      'thumbnail_height': 100,
      'author_name': 'Bees',
      'author_url': 'http://www.flickr.com/photos/bees/',
      'provider_name': 'Flickr',
      'provider_url': 'http://www.flickr.com/'
    }), {
      type: 'photo',
      title: 'ZB8T0193',
      author: { name: 'Bees', url: 'http://www.flickr.com/photos/bees/' },
      provider: { id: 'Flickr', name: 'Flickr', url: 'http://www.flickr.com/' },
      thumbnail: { url: 'http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_thumb.jpg', type: 'image/jpeg', width: 100, height: 100 },
      width: 240, height: 160,
      href: 'http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg',
      html: null,
    });

    assert.deepEqual(parse.oembedJSON({
      'version': '1.0',
      'type': 'video',
      'author_name': 'Bees',
      'provider_name': 'You Tube',
      'html': '<div class="video"><iframe src="//youtube.com/embed/21opdjwed"></iframe><script src="https://youtube.com/embed.js"></script></script></div>',
    }), {
      type: 'video',
      title: null,
      author: { name: 'Bees', url: null },
      provider: { id: 'YouTube', name: 'You Tube', url: null },
      thumbnail: null,
      width: null, height: null,
      href: 'http://youtube.com/embed/21opdjwed',
      html: '<iframe src="//youtube.com/embed/21opdjwed"></iframe>',
    });

    assert.deepEqual(parse.oembedJSON({
      'version': '1.0',
      'type': 'rich',
      'html': '<blockqoute>Twit</blockqoute>',
    }), {
      type: 'rich',
      title: null,
      author: null,
      provider: null,
      thumbnail: null,
      width: null, height: null,
      href: null,
      html: '<blockqoute>Twit</blockqoute>',
    });

    assert.equal(parse.oembedJSON({
      'version': '1.0',
      'type': 'foo',
      'html': '<blockqoute>Twit</blockqoute>',
    }), null);
  });

  it('oembedXML()', () => {
    assert.deepEqual(parse.oembedXML(`
      <?xml version="1.0" encoding="utf-8"?>
      <oembed>
        <version>1.0</version>
        <type>photo</type>
        <width>240</width>
        <height>160</height>
        <title>ZB8T0193</title>
        <url>http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg</url>
        <thumbnail_url>http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_thumb.jpg</thumbnail_url>
        <thumbnail_width>100</thumbnail_width>
        <thumbnail_height>100</thumbnail_height>
        <author_name>Bees</author_name>
        <author_url>http://www.flickr.com/photos/bees/</author_url>
        <provider_name>Flickr</provider_name>
        <provider_url>http://www.flickr.com/</provider_url>
      </oembed>
    `), {
      type: 'photo',
      title: 'ZB8T0193',
      author: { name: 'Bees', url: 'http://www.flickr.com/photos/bees/' },
      provider: { id: 'Flickr', name: 'Flickr', url: 'http://www.flickr.com/' },
      thumbnail: { url: 'http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_thumb.jpg', type: 'image/jpeg', width: 100, height: 100 },
      width: 240, height: 160,
      href: 'http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg',
      html: null,
    });

    assert.equal(parse.oembedXML(`
      <type>asd</type>
      <width>240</width>
      <height>160</height>
      <title>ZB8T0193</title>
      <url>http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_m.jpg</url>
      <thumbnail_url>http://farm4.static.flickr.com/3123/2341623661_7c99f48bbf_thumb.jpg</thumbnail_url>
      <thumbnail_width>100</thumbnail_width>
      <thumbnail_height>100</thumbnail_height>
      <author_name>Bees</author_name>
      <author_url>http://www.flickr.com/photos/bees/</author_url>
      <provider_name>Flickr</provider_name>
      <provider_url>http://www.flickr.com/</provider_url>
    `), null);
  });

  it('html()', () => {
    assert.deepEqual(parse.html('https://teletype.in/test', `
      <html>
        <head>
          <title>Teletype</title>
          <link rel="alternate" type="text/xml+oembed" href="https://mustapp.com/oembed.xml">
          <link rel="alternate" type="application/json+oembed" href="/oembed.json">
        </head>
      </html>
    `), {
      webpage: {
        type: 'website',
        url: 'https://teletype.in/test',
        title: 'Teletype',
        name: null,
        description: null,
        icons: [], images: [], videos: [], audios: []
      },
      oembed: {
        json: 'https://teletype.in/oembed.json',
        xml: 'https://mustapp.com/oembed.xml'
      }
    });

    assert.deepEqual(parse.html('https://teletype.in/test', `
      <html>
        <head>
          <title>Teletype</title>
          <link rel="alternate" type="text/html+oembed" href="https://mustapp.com/oembed.xml">
          <link rel="alternate" type="application/json" href="/oembed.json">
        </head>
      </html>
    `), {
      webpage: {
        type: 'website',
        url: 'https://teletype.in/test',
        title: 'Teletype',
        name: null,
        description: null,
        icons: [], images: [], videos: [], audios: []
      },
      oembed: {
        json: null,
        xml: null
      }
    });

    assert.deepEqual(parse.html('https://teletype.in/test', ''), {
      webpage: {
        type: 'website',
        url: 'https://teletype.in/test',
        title: null,
        name: null,
        description: null,
        icons: [], images: [], videos: [], audios: []
      },
      oembed: {
        json: null,
        xml: null
      }
    });
  });
});
