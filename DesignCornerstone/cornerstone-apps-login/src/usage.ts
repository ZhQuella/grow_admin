import { AuthorizationModeEnum } from "@weiming-rock/constants";
import { LoginStateEnum } from "./constant";
import { Ref, computed, ref, unref } from "vue";
import { useI18n } from "@weiming-rock/locale";
import { useGlobConfig } from "@weiming-rock/hooks";

export const useAuthMode = () => {
  return useGlobConfig().authMode;
}
const currentState = ref();
export function useLoginState() {
  const { authMode, oauthAutoLogin } = useGlobConfig();
  if (currentState.value === undefined) {
    currentState.value = authMode === AuthorizationModeEnum.SELF_LOGIN
      ? LoginStateEnum.LOGIN
      : LoginStateEnum.OAUTH_CODE;
  }
  function setLoginState(state: LoginStateEnum) {
    currentState.value = state;
  }

  const getLoginState = computed(() => currentState.value);

  function handleBackLogin() {
    setLoginState(LoginStateEnum.LOGIN);
  }
  const isAutoLogin = ref(authMode === AuthorizationModeEnum.OAUTH2_CODE && oauthAutoLogin);
  return { setLoginState, getLoginState, handleBackLogin, mode: authMode, isAutoLogin };
}

function createRule(message: string): any[] {
  return [
    {
      required: true,
      message,
      trigger: 'change',
    },
  ];
}

export function useFormRules(formData?: Recordable<any>) {
  const { t } = useI18n();

  const getAccountFormRule = computed(() =>
    createRule(t('sys.login.accountPlaceholder'))
  );
  const getPasswordFormRule = computed(() =>
    createRule(t('sys.login.passwordPlaceholder'))
  );
  const getSmsFormRule = computed(() =>
    createRule(t('sys.login.smsPlaceholder'))
  );
  const getMobileFormRule = computed(() =>
    createRule(t('sys.login.mobilePlaceholder'))
  );

  const validatePolicy = async (_: any, value: boolean) => {
    return !value
      ? Promise.reject(t('sys.login.policyPlaceholder'))
      : Promise.resolve();
  };

  const validateConfirmPassword = (password: string) => {
    return async (_: any, value: string) => {
      if (!value) {
        return Promise.reject(t('sys.login.passwordPlaceholder'));
      }
      if (value !== password) {
        return Promise.reject(t('sys.login.diffPwd'));
      }
      return Promise.resolve();
    };
  };

  const getFormRules = computed((): { [k: string]: any | any[] } => {
    const accountFormRule = unref(getAccountFormRule);
    const passwordFormRule = unref(getPasswordFormRule);
    const smsFormRule = unref(getSmsFormRule);
    const mobileFormRule = unref(getMobileFormRule);

    const mobileRule = {
      sms: smsFormRule,
      mobile: mobileFormRule,
    };
    switch (unref(currentState)) {
      // register form rules
      case LoginStateEnum.REGISTER:
        return {
          account: accountFormRule,
          password: passwordFormRule,
          confirmPassword: [
            {
              validator: validateConfirmPassword(formData?.password),
              trigger: 'change',
            },
          ],
          policy: [{ validator: validatePolicy, trigger: 'change' }],
          ...mobileRule,
        };

      // reset password form rules
      case LoginStateEnum.RESET_PASSWORD:
        return {
          account: accountFormRule,
          ...mobileRule,
        };

      // mobile form rules
      case LoginStateEnum.MOBILE:
        return mobileRule;

      // login form rules
      default:
        return {
          account: accountFormRule,
          password: passwordFormRule,
        };
    }
  });
  return { getFormRules };
}

export function useFormValid<T extends Object = any>(formRef: Ref<any>) {
  async function validForm() {
    const form = unref(formRef);
    if (!form) return;
    const data = await form.validate();
    return data as T;
  }

  return { validForm };
}

export function useOAuth2Config() {
  const { authMode, oauthCodeRoute, oauthCodeServer } = useGlobConfig();
  if (authMode === AuthorizationModeEnum.OAUTH2_CODE) {
    const oauth2Config = ref({
      resourceServer: oauthCodeServer,
      codeHandlerRoute: oauthCodeRoute,
    });
    return oauth2Config;
  } else {
    return null;
  }
}