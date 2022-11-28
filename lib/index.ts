import { getHead, getHtml, getJSON } from './fetch';
import { file, FileResult, html, oembedJSON, OEmbedResult, oembedXML, WebpageResult } from './parse';
import { userAgentHeader } from './utils';


export type Result = {
  image?: FileResult;
  video?: FileResult;
  attachment?: FileResult;
  webpage?: WebpageResult;
  oembed?: OEmbedResult;
};

const enrichLink = async (link: string, userAgent?: string): Promise<Result> => {
  const head = await getHead(link, userAgentHeader(userAgent));
  if (!head) return null;

  const contentType = head.headers['content-type'] || 'text/plain';
  const contentLength = head.headers['content-length'] || '';
  const contentDisposition = head.headers['content-disposition'];

  const result: Result = {};

  if (contentType.startsWith('image/')) {
    result.image = file(link, contentType, contentDisposition, contentLength);
  } else if (contentType.startsWith('video/')) {
    result.video = file(link, contentType, contentDisposition, contentLength);
  } else if (contentType.startsWith('text/html')) {
    const body = await getHtml(link, userAgentHeader(userAgent));
    const { webpage, oembed } = await html(link, body);

    if (webpage) {
      result.webpage = webpage;
    }

    if (oembed.json || oembed.xml) {
      const json = oembed.json
        ? oembedJSON(await getJSON(oembed.json, userAgentHeader(userAgent)))
        : null;

      const xml = oembed.xml
        ? oembedXML(await getHtml(oembed.xml, userAgentHeader(userAgent)))
        : null;

      result.oembed = {...xml, ...json};
    }
  }

  if (contentDisposition) {
    result.attachment = file(link, contentType, contentDisposition, contentLength);
  }

  return result;
};

export default enrichLink;
