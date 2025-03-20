import { useAppConfig } from "@renderer/providers/AppConfigProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

const useCustomerSupportUrl = () => {
  const { guestId } = useSessionProvider();
  const { externalUrl } = useAppConfig();
  try {
    const csUrl = new URL(externalUrl.cs);
    csUrl.searchParams.append("embedded_data", guestId);
    return { csUrl: csUrl.toString() };
  } catch (error) {
    return { csUrl: "" };
  }
};

export default useCustomerSupportUrl;
