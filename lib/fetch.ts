import got, { Response, OptionsOfJSONResponseBody, OptionsOfTextResponseBody, Options } from 'got';

export type FetchOptions = Pick<Options, 'agent' | 'headers' | 'hooks' | 'cookieJar'>;

export const getHead = (link: string, options?: FetchOptions): Promise<null|Response> => {
  return new Promise((resolve) => {
    const req = got.stream(link, options);

    req.on('response', (res: Response) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(res);
      } else {
        resolve(null);
      }
      req.destroy();
    });

    req.on('error', () => {
      resolve(null);
    });
  });
};

export const getHtml = async (link: string, reqOptions?: FetchOptions): Promise<string|null> => {
  const options: OptionsOfTextResponseBody = { ...reqOptions, retry: 0, responseType: 'text', isStream: false };

  try {
    const res = await got(link, options);
    return res.body;
  } catch (error) {
    return null;
  }
};

export const getJSON = async (link: string, reqOptions?: FetchOptions): Promise<any|null> => {
  const options: OptionsOfJSONResponseBody = { ...reqOptions, retry: 0, responseType: 'json', isStream: false };

  try {
    const res = await got(link, options);
    return res.body;
  } catch (error) {
    return null;
  }
};

