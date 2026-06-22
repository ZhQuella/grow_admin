import type { ErrorMessageMode } from '@grow-admin-rock/types';
import { diK } from '@grow-admin-rock/ioc';
import types from '#/../beankeys';
import { useI18n } from '@grow-admin-rock/locale';

/**
 * 检查返回值状态
 * @param status 
 * @param msg 
 * @param errorMessageMode 
 * @param onError 
 * @returns 
 */
export function checkStatus(
  status: number,
  msg: string,
  errorMessageMode: ErrorMessageMode = 'message',
  onError?: (msg: string) => void
): void {
  const { t } = useI18n();
  let errMessage = '';
  const infrastructureOptions = diK(types.InfrastructureOptions)
  const infrastructureEvent = Symbol.for(`${status}`)
  switch (status) {
    case 400:
      errMessage = `${msg}`;
      break;
    // 401: Not logged in
    // Jump to the login page if not logged in, and carry the path of the current page
    // Return to the current page after successful login. This step needs to be operated on the login page.
    case 401:
      if (infrastructureOptions) {
        if (infrastructureOptions.onUnauthorized) {
          infrastructureOptions.onUnauthorized();
        } else {
          infrastructureOptions.onAll?.(infrastructureEvent);
        }
      }
      break;
    case 403:
      errMessage = t('sys.api.errMsg403');
      break;
    // 404请求不存在
    case 404:
      errMessage = t('sys.api.errMsg404');
      break;
    case 405:
      errMessage = t('sys.api.errMsg405');
      break;
    case 408:
      errMessage = t('sys.api.errMsg408');
      break;
    case 500:
      errMessage = t('sys.api.errMsg500');
      break;
    case 501:
      errMessage = t('sys.api.errMsg501');
      break;
    case 502:
      errMessage = t('sys.api.errMsg502');
      break;
    case 503:
      errMessage = t('sys.api.errMsg503');
      break;
    case 504:
      errMessage = t('sys.api.errMsg504');
      break;
    case 505:
      errMessage = t('sys.api.errMsg505');
      break;
    default:
  }

  if (errMessage) {
    if (onError) {
      onError(errMessage);
      return;
    } else if (infrastructureOptions) {
      infrastructureOptions.onAll?.(infrastructureEvent, errMessage);
      if (infrastructureOptions.promoter) {
        switch (errorMessageMode) {
          case 'modal':
            infrastructureOptions.promoter.modal?.(errMessage);
            break;
          case 'message':
            infrastructureOptions.promoter.message?.(errMessage);
            break;
          case 'none':
            break;
          default:
            infrastructureOptions.promoter.error?.(errMessage);
        }
      }
    }
  }
}
