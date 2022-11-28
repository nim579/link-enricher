# link-enricher

[![Tests](https://github.com/nim579/link-enricher/actions/workflows/test.yml/badge.svg)](https://github.com/nim579/link-enricher/actions/workflows/test.yml)

Fetch oEmbed, Opeh Graph, etc info for links

## Install

```sh
npm install link-enricher
```

## Use

```ts
enrichLink(url: string, userAgent?: string): Promise<LinkEnricherResult>
```

``` js
import enrichLink from 'link-enricher';

enrichLink('https://journal.teletype.in/donations').then(result => {
  console.log(result);
  /*
    {
      "webpage": {
        "type": "article",
        "url": "https://journal.teletype.in//donations",
        "name": "Teletype",
        "title": "Some title",
        "description": "Some description",
        "icons": [
          {
            "rel": "icon",
            "url": "https://journal.teletype.in/favicon.ico",
            "type": "image/x-icon"
          },
          {
            "rel": "icon",
            "url": "https://teletype.in/static/images/favicon.aa44a25d7abf771753ddc4882d74b1d3.svg",
            "type": "image/svg+xml"
          },
          {
            "rel": "apple-touch-icon",
            "url": "https://teletype.in/static/images/apple-touch-icon.bff1896956c63f4f4e03a61cd7730434.png",
            "type": "image/png"
          }
        ],
        "images": [
          {
            "url": "https://img1.teletype.in/files/42/a2/42a296b5-2e20-47c9-b55f-0925c6c5ca38.png",
            "type": "image/png"
          },
          {
            "url": "https://img1.teletype.in/files/42/a2/42a296b5-2e20-47c9-b55f-0925c6c5ca38.png",
            "type": "image/png",
            "width": 1200,
            "height": 630
          }
        ],
        "videos": [],
        "audios": []
      }
    }
  */
})
```

## Types

* **LinkEnricherResult**:
  * `image?: FileResult`
  * `video?: FileResult`
  * `attachment?: FileResult` — if `Content-Dispotition` header responds
  * `webpage?: WebpageResult`
  * `oembed?: OEmbedResult`
* **FileResult**
  * `name?: string`
  * `size?: number` — size in bytes
  * `type?: string` — mime type
  * `ext?: string` — extension in format `jpeg`
* **WebpageResult**:
  * `type?: string`
  * `url?: string`
  * `name?: string`
  * `title?: string`
  * `description?: string`
  * `icons: WebpageIcon[]`
  * `images: WebpageMedia[]`
  * `videos: WebpageMedia[]`
  * `audios: WebpageMedia[]`
* **WebpageIcon**:
  * `rel: 'icon'|'apple-touch-icon'|'manifest'`
  * `url: string`
  * `width?: number`
  * `height?: number`
  * `type?: string`
* **WebpageMedia**:
  * `url: string`
  * `type?: string`
  * `width?: number`
  * `height?: number`
* **OEmbedResult**:
  * `type: string`
  * `title?: string`
  * `thumbnail?: WebpageMedia`
  * `author?: OEmbedAuthor`
  * `provider?: OEmbedAuthor & { id: string }`
  * `width?: number`
  * `height?: number`
  * `href?: string`
  * `html?: string`
* **OEmbedAuthor**:
  * `name: string`
  * `url?: string`
