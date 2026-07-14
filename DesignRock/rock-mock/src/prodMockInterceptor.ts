import mockJs from 'mockjs';
import type { MockMethod, MockRequestParams } from '#/types';

const Mock = mockJs as typeof mockJs & {
  XHR: typeof XMLHttpRequest & {
    prototype: XMLHttpRequest & {
      mock?: boolean;
      custom?: {
        requestHeaders?: Recordable<string>;
        options?: Recordable & { headers?: Recordable<string> };
      };
      proxy_send?: XMLHttpRequest['send'];
    };
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePath(url: string): string {
  try {
    if (/^https?:\/\//i.test(url)) {
      return new URL(url).pathname;
    }
  } catch {
    // ignore invalid URL
  }
  return url.split('?')[0] || url;
}

/** 将 HeadersInit / 普通对象统一成小写键 Record（与 Node 中间件一致） */
function toHeaderRecord(
  headers?: HeadersInit | Recordable<string> | null,
  request?: Request,
): Recordable<string> {
  const result: Recordable<string> = {};

  const assign = (key: string, value: string) => {
    result[key.toLowerCase()] = value;
  };

  if (request) {
    request.headers.forEach((value, key) => assign(key, value));
  }

  if (!headers) {
    return result;
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    headers.forEach((value, key) => assign(key, value));
    return result;
  }

  if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      assign(key, value);
    }
    return result;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (value != null) {
      assign(key, String(value));
    }
  }

  return result;
}

/**
 * Mock.js 只会把 { url, type, body } 传给 response，
 * Authorization 实际落在 custom.requestHeaders，需在 send 前注入。
 */
function patchMockXHRRequestHeaders() {
  const proto = Mock.XHR.prototype;
  if (proto.proxy_send) {
    return;
  }

  proto.proxy_send = proto.send;
  proto.send = function (this: typeof proto, body?: Document | XMLHttpRequestBodyInit | null) {
    if (this.custom?.requestHeaders) {
      this.custom.options = this.custom.options || {};
      this.custom.options.headers = toHeaderRecord(this.custom.requestHeaders);
    }
    return this.proxy_send!.call(this, body);
  };
}

function wrapHandler(handle: MockMethod['response']) {
  return function (options: MockRequestParams & { type?: string; url?: string }) {
    let result: unknown = null;

    if (typeof handle === 'function') {
      const { body, type, url, headers } = options;
      let parsedBody: Recordable = body as Recordable;
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = body as unknown as Recordable;
        }
      }

      result = handle({
        method: type || 'get',
        body: parsedBody,
        query: parseQuery(url || ''),
        headers: toHeaderRecord(headers),
      });
    } else {
      result = handle;
    }

    return Mock.mock(result);
  };
}

function parseQuery(url: string): Recordable {
  const search = url.split('?')[1];
  if (!search) {
    return {};
  }

  return JSON.parse(
    `{"${decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ')}"}`,
  );
}

function findMock(mocks: MockMethod[], method: string, url: string) {
  const path = normalizePath(url);
  const normalizedMethod = method.toLowerCase();

  return mocks.find((item) => {
    const itemMethod = (item.method || 'get').toLowerCase();
    if (itemMethod !== normalizedMethod) {
      return false;
    }

    const itemUrl = item.url;
    if (typeof itemUrl === 'string') {
      return normalizePath(itemUrl) === path;
    }

    if (itemUrl instanceof RegExp) {
      return itemUrl.test(path) || itemUrl.test(url);
    }

    return false;
  });
}

async function invokeMock(
  item: MockMethod,
  request: MockRequestParams & { url: string },
) {
  const handler = item.response;
  if (typeof handler === 'function') {
    return handler(request);
  }
  return handler;
}

function registerMockXHR(mocks: MockMethod[]) {
  patchMockXHRRequestHeaders();

  for (const { url, method, response, timeout } of mocks) {
    if (timeout) {
      Mock.setup({ timeout });
    }

    if (typeof url === 'string') {
      Mock.mock(url, method || 'get', wrapHandler(response));
      continue;
    }

    Mock.mock(url, method || 'get', wrapHandler(response));
  }

  window.XMLHttpRequest = Mock.XHR as unknown as typeof XMLHttpRequest;
}

function patchFetch(mocks: MockMethod[]) {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request =
      input instanceof Request ? input : undefined;
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    const method = (
      init?.method ||
      (input instanceof Request ? input.method : 'GET')
    ).toUpperCase();
    const match = findMock(mocks, method, requestUrl);

    if (!match) {
      return nativeFetch(input, init);
    }

    let body: Recordable = {};
    const bodySource =
      init?.body !== undefined
        ? init.body
        : request
          ? await request.clone().text()
          : undefined;
    if (typeof bodySource === 'string' && bodySource) {
      try {
        body = JSON.parse(bodySource);
      } catch {
        body = { raw: bodySource };
      }
    }

    if (match.timeout) {
      await sleep(match.timeout);
    }

    const data = await invokeMock(match, {
      method,
      body,
      query: parseQuery(requestUrl),
      headers: toHeaderRecord(init?.headers, request),
      url: requestUrl,
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

export function installProdMockInterceptor(mocks: MockMethod[]) {
  if (!mocks.length || typeof window === 'undefined') {
    return;
  }

  registerMockXHR(mocks);
  patchFetch(mocks);
}
