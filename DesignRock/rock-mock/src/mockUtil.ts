import type { MockRequestParams } from '#/types';

export type { MockRequestParams };

export const resultSuccess = <T = Recordable<any>>(
  result: T,
  { message = 'ok' } = {},
) => ({
  code: '1',
  data: result,
  message,
  type: 'success',
});

export const resultPageSuccess = <T = any>(
  page: number,
  pageSize: number,
  list: T[],
  { message = 'ok' } = {},
) => {
  const pageData = pagination(page, pageSize, list);

  return {
    ...resultSuccess({
      items: pageData,
      total: list.length,
    }),
    message,
  };
};

export const resultError = (
  message = 'Request failed.',
  { code = '600', result = null } = {},
) => ({
  code,
  result,
  message,
  type: 'error',
});

export const pagination = <T = any>(
  pageNo: number,
  pageSize: number,
  array: T[],
): T[] => {
  const offset = (pageNo - 1) * Number(pageSize);
  return offset + Number(pageSize) >= array.length
    ? array.slice(offset, array.length)
    : array.slice(offset, offset + Number(pageSize));
};

export const getRequestToken = ({
  headers,
}: MockRequestParams): string | undefined => headers?.authorization;
