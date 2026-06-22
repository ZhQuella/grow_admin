import { AuthorizationModeEnum } from "@grow-admin-rock/constants";
import { ref } from "vue";
import { useGlobConfig } from "@grow-admin-rock/hooks";

export const useAuthMode = () => {
  return useGlobConfig().authMode;
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
