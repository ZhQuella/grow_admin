import mockJs from 'mockjs';
import type { MockMethod, MockRequestParams } from '#/types';

const Mock = mockJs as typeof mockJs & {
  XHR: typeof XMLHttpRequest & { prototype: XMLHttpRequest & { mock?: boolean } };
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
        headers: headers as MockRequestParams['headers'],
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
    const rawBody = init?.body;
    if (typeof rawBody === 'string') {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = { raw: rawBody };
      }
    }

    if (match.timeout) {
      await sleep(match.timeout);
    }

    const data = await invokeMock(match, {
      method,
      body,
      query: parseQuery(requestUrl),
      headers: init?.headers as MockRequestParams['headers'],
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
