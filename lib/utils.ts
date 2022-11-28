import _ from 'lodash';
import mime from 'mime';
import { URL } from 'node:url';

export const sortObjectKeys = (obj: Record<string, any>): Record<string, any> => {
  const sortedObj = {};

  _.forEach(_.sortBy(_.keys(obj)), key => {
    sortedObj[key] = obj[key];
  });

  return sortedObj;
};

export const sanitizeLink = (link: string): string => {
  return link.replace(/^\/\//, 'http://');
};

export const normalizeLink = (link: string): string => {
  const url = new URL(sanitizeLink(link));
  const params = sortObjectKeys(Object.fromEntries(url.searchParams.entries()));

  url.search = new URLSearchParams(params).toString();

  return url.toString();
};

export const userAgentHeader = (value?: string) => {
  return value
    ? { headers: { 'user-agent': value } }
    : {};
};

export const parseSizes = (value: string) => {
  const matched = (value || '').match(/(\d+)x(\d+)/i);

  return matched
    ? { width: parseInt(matched[1]), height: parseInt(matched[2]) }
    : null;
};

export const urlResolve = (to: string, from: string): string => {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.toString();
};

export const getType = (link: string) => {
  const url = new URL(sanitizeLink(link));
  return mime.getType(url.pathname);
};
