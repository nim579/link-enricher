import _ from 'lodash';
import mime from 'mime';
import { parse as urlParse } from 'node:url';
import { parse as parseDisposition } from 'content-disposition';
import { CheerioAPI, load as Cheerio } from 'cheerio';
import { parseSizes, urlResolve, getType, normalizeLink } from './utils';

export type FileResult = {
  name?: string;
  size?: number;
  type?: string;
  ext?: string;
}

type WebpageIcon = {
  rel: 'icon'|'apple-touch-icon'|'manifest'
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

type WebpageMedia = {
  url: string;
  type?: string;
  width?: number;
  height?: number;
}

export type WebpageResult = {
  type?: string;
  url?: string;
  name?: string;
  title?: string;
  description?: string;
  icons: WebpageIcon[];
  images: WebpageMedia[];
  videos: WebpageMedia[];
  audios: WebpageMedia[];
}

type OEmbedAuthor = {
  name: string;
  url?: string;
}

type OEmbedJSON = {
  type: string;
  version: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: string | number;
  thumbnail_url?: string;
  thumbnail_width?: string | number;
  thumbnail_height?: string | number;
  url?: string;
  html?: string;
  width?: string | number;
  height?: string | number;
}

export type OEmbedResult = {
  type: string;
  title?: string;
  thumbnail?: WebpageMedia;
  author?: OEmbedAuthor;
  provider?: OEmbedAuthor & { id: string };
  width?: number;
  height?: number;
  href?: string;
  html?: string;
}

export const file = (link: string, contentType: string, rawDisposition?: string, rawLength?: string): FileResult => {
  const disposition = rawDisposition
    ? parseDisposition(rawDisposition)
    : null;

  const { pathname } = urlParse(link);

  const size = rawLength && !isNaN(parseInt(rawLength))
    ? parseInt(rawLength)
    : null;

  const type = contentType || getType(link) || null;

  const ext = type ? mime.getExtension(type) : null;

  const name = _.get(disposition, 'parameters.filename', _.last(pathname.split('/'))) || null;

  return {
    name, type, size, ext
  };
};

export const webpage = (link: string, $: CheerioAPI): WebpageResult => {
  const pageTitle = $('title').text().trim() || null;

  let type: string = null;
  let url: string = null;
  let siteName: string = null;
  let title: string = null;
  let description: string = null;
  let icons: WebpageIcon[] = [];
  let images: WebpageMedia[] = [];
  let videos: WebpageMedia[] = [];
  let audios: WebpageMedia[] = [];

  $('link[rel="icon"]').each((i, el) => {
    const href = $(el).attr('href');
    const type = $(el).attr('type');
    const sizes = $(el).attr('sizes');

    if (href)
      icons.push({
        rel: 'icon',
        url: urlResolve(href, link),
        type: type || getType(urlResolve(href, link)) || null,
        ...(sizes ? parseSizes(sizes) || {} : {})
      });
  });
  $('link[rel="apple-touch-icon"]').each((i, el) => {
    const href = $(el).attr('href');
    const type = $(el).attr('type');
    const sizes = $(el).attr('sizes');

    if (href)
      icons.push({
        rel: 'apple-touch-icon',
        url: urlResolve(href, link),
        type: type || getType(urlResolve(href, link)) || null,
        ...(sizes ? parseSizes(sizes) || {} : {})
      });
  });

  $('meta').each((i, el) => {
    const attrs = $(el).attr();
    const name = attrs.name || attrs.property;
    const value = attrs.content;

    switch (name) {
    case 'og:type':
      type = value;
      break;
    case 'og:url':
      url = value;
      break;
    case 'og:site_name':
      siteName = value;
      break;
    case 'title':
    case 'og:title':
    case 'twitter:title':
      title = value || title;
      break;
    case 'description':
    case 'og:description':
    case 'twitter:description':
      description = value || description;
      break;
    case 'og:image':
    case 'og:image:url':
    case 'twitter:image':
    case 'twitter:image:src':
      images.push({
        url: urlResolve(value, link),
      });
      break;
    case 'og:image:secure_url': {
      const image = _.last(images);
      if (image) image.url = urlResolve(value, link);
      break;
    }
    case 'og:image:type': {
      const image = _.last(images);
      if (image && !image.type) image.type = value;
      break;
    }
    case 'og:image:width':
    case 'twitter:image:width': {
      const image = _.last(images);
      const width = parseInt(value);
      if (image && !image.width && !isNaN(width)) image.width = width;
      break;
    }
    case 'og:image:height':
    case 'twitter:image:height': {
      const image = _.last(images);
      const height = parseInt(value);
      if (image && !image.height && !isNaN(height)) image.height = height;
      break;
    }
    case 'og:video':
    case 'og:video:url':
    case 'twitter:player:stream':
      videos.push({
        url: urlResolve(value, link),
      });
      break;
    case 'twitter:player':
      videos.push({
        url: urlResolve(value, link),
        type: 'text/html',
      });
      break;
    case 'og:video:secure_url': {
      const video = _.last(videos);
      if (video) video.url = urlResolve(value, link);
      break;
    }
    case 'og:video:type':
    case 'twitter:player:stream:content_type': {
      const video = _.last(videos);
      if (video && !video.type) video.type = value;
      break;
    }
    case 'og:video:width':
    case 'twitter:player:width': {
      const video = _.last(videos);
      const width = parseInt(value);
      if (video && !video.width && !isNaN(width)) video.width = width;
      break;
    }
    case 'og:video:height':
    case 'twitter:player:height': {
      const video = _.last(videos);
      const height = parseInt(value);
      if (video && !video.height && !isNaN(height)) video.height = height;
      break;
    }
    case 'og:audio':
    case 'og:audio:url':
      audios.push({
        url: urlResolve(value, link),
      });
      break;
    case 'og:audio:secure_url': {
      const audio = _.last(audios);
      if (audio) audio.url = urlResolve(value, link);
      break;
    }
    case 'og:audio:type': {
      const audio = _.last(audios);
      if (audio && !audio.type) audio.type = value;
      break;
    }
    }
  });

  const normalizeMedia = item => {
    item.type = item.type || getType(item.url);
    return item;
  };

  images = images.map(normalizeMedia);
  videos = videos.map(normalizeMedia);
  audios = audios.map(normalizeMedia);

  const webpage: WebpageResult = {
    type: type || 'website',
    url: url || link,
    name: siteName || null,
    title: title || pageTitle || null,
    description: description || null,
    icons, images, videos, audios,
  };

  return webpage;
};

export const oembedJSON = (body: OEmbedJSON): OEmbedResult | null => {
  if (!body || !body.type) return null;
  if (!['photo', 'video', 'rich', 'link'].includes(body.type)) return null;

  let html = null;
  let href = null;

  if (body.html) {
    const $embed = Cheerio(body.html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1'));
    html = $embed('iframe').wrap('<div></div>').parent().html();

    if (html) {
      const $iframe = Cheerio(html);
      href = $iframe('iframe').attr('src');
    }
  }

  const width = body.width ? parseInt(body.width + '') : null;
  const height = body.height ? parseInt(body.height + '') : null;

  const thumbnail_width = body.thumbnail_width ? parseInt(body.thumbnail_width + '') : null;
  const thumbnail_height = body.thumbnail_height ? parseInt(body.thumbnail_height + '') : null;

  return {
    type: body.type,
    title: body.title || null,
    author: body.author_name
      ? { name: body.author_name, url: body.author_url || null }
      : null,
    thumbnail: body.thumbnail_url
      ? {
        url: body.thumbnail_url,
        type: getType(body.thumbnail_url) || null,
        width: thumbnail_width && !isNaN(thumbnail_width) ? thumbnail_width : null,
        height: thumbnail_height && !isNaN(thumbnail_height) ? thumbnail_height : null,
      }
      : null,
    provider: body.provider_name
      ? {
        name: body.provider_name,
        url: body.provider_url || null,
        id: _.upperFirst(_.camelCase(body.provider_name))
      }
      : null,
    width: width && !isNaN(width) ? width : null,
    height: height && !isNaN(height) ? height : null,
    href: href || body.url ? normalizeLink(href || body.url)  : null,
    html: html || body.html || null,
  };
};

export const oembedXML = (xml: string): OEmbedResult | null => {
  const $ = Cheerio(xml, { xmlMode: true });
  const type = $('type').text();

  if (!['photo', 'video', 'rich', 'link'].includes(type)) return null;

  const body: OEmbedJSON = {
    type: type,
    version: $('version').text() || null,
    title: $('title').text() || null,
    author_name: $('author_name').text() || null,
    author_url: $('author_url').text() || null,
    provider_name: $('provider_name').text() || null,
    provider_url: $('provider_url').text() || null,
    cache_age: $('cache_age').text() || null,
    thumbnail_url: $('thumbnail_url').text() || null,
    thumbnail_width: $('thumbnail_width').text() || null,
    thumbnail_height: $('thumbnail_height').text() || null,
    url: $('url').text() || null,
    html: $('html').text() || null,
    width: $('width').text() || null,
    height: $('height').text() || null,
  };

  return oembedJSON(body);
};

export const html = (link: string, body: string): { 'webpage'?: WebpageResult, 'oembed': { json?: string, xml?: string } } => {
  const $ = Cheerio(body);

  let oembedJSON: string = null;
  let oembedXML: string = null;

  $('link[rel="alternate"]').each((i, el) => {
    const type = $(el).attr('type') || '';
    const href = $(el).attr('href');

    if (href && type.includes('+oembed')) {
      if (type.startsWith('application/json')) {
        oembedJSON = urlResolve(href, link);
      } else if (type.startsWith('application/xml') || type.startsWith('text/xml')) {
        oembedXML = urlResolve(href, link);
      }
    }
  });

  return {
    webpage: webpage(link, $),
    oembed: {
      json: oembedJSON,
      xml: oembedXML
    }
  };
};
