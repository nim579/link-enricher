import { FetchOptions, getHead, getHtml, getJSON } from './fetch';
import { file, FileResult, html, oembedJSON, OEmbedResult, oembedXML, WebpageResult } from './parse';
import { userAgentHeader } from './utils';

export type LinkEnricherResult = {
  image?: FileResult;
  video?: FileResult;
  attachment?: FileResult;
  webpage?: WebpageResult;
  oembed?: OEmbedResult;
};

const enrichLink = async (link: string, userAgent?: string, reqOptions?: FetchOptions): Promise<LinkEnricherResult> => {
  const options = { ...userAgentHeader(userAgent), ...reqOptions };

  const head = await getHead(link, options);
  if (!head) return null;

  const contentType = head.headers['content-type'] || 'text/plain';
  const contentLength = head.headers['content-length'] || '';
  const contentDisposition = head.headers['content-disposition'];

  const result: LinkEnricherResult = {};

  if (contentType.startsWith('image/')) {
    result.image = file(link, contentType, contentDisposition, contentLength);
  } else if (contentType.startsWith('video/')) {
    result.video = file(link, contentType, contentDisposition, contentLength);
  } else if (contentType.startsWith('text/html')) {
    const body = await getHtml(link, options);
    const { webpage, oembed } = await html(link, body);

    if (webpage) {
      result.webpage = webpage;
    }

    if (oembed.json || oembed.xml) {
      const json = oembed.json
        ? oembedJSON(await getJSON(oembed.json, options))
        : null;

      const xml = oembed.xml
        ? oembedXML(await getHtml(oembed.xml, options))
        : null;

      result.oembed = {...xml, ...json};
    }
  }

  if (contentDisposition) {
    result.attachment = file(link, contentType, contentDisposition, contentLength);
  }

  return result;
};

export { enrichLink };
