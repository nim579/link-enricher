import got, { Response, OptionsOfJSONResponseBody, OptionsOfTextResponseBody } from 'got';

export const getHead = (link: string, options?: any): Promise<null|Response> => {
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

export const getHtml = async (link: string, reqOptions?: any): Promise<string|null> => {
  const options: OptionsOfTextResponseBody = { ...reqOptions, retry: 0, responseType: 'text', isStream: false };

  try {
    const res = await got(link, options);
    return res.body;
  } catch (error) {
    return null;
  }
};

export const getJSON = async (link: string, reqOptions?: any): Promise<any|null> => {
  const options: OptionsOfJSONResponseBody = { ...reqOptions, retry: 0, responseType: 'json', isStream: false };

  try {
    const res = await got(link, options);
    return res.body;
  } catch (error) {
    return null;
  }
};

