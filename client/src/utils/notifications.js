import api from "@/lib/axios";

// Dynamically load OneSignal SDK
export const loadOneSignalSDK = () => {
  return new Promise((resolve) => {
    if (window.OneSignal) {
      resolve(window.OneSignal);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = () => {
      resolve(window.OneSignal);
    };
    document.head.appendChild(script);
  });
};

export const initOneSignal = async (userId) => {
  try {
    const OneSignal = await loadOneSignalSDK();
    window.OneSignal = window.OneSignal || [];

    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || "c57d77b8-6fb2-4bf1-a4b7-0d927a4d538e"; // Default fallback ID

    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false
      }
    });

    if (userId) {
      await OneSignal.login(String(userId));
    }

    return OneSignal;
  } catch (error) {
    console.warn("[OneSignal] Initialization error:", error.message);
    return null;
  }
};

export const registerSubscriptionWithBackend = async (subscriptionId) => {
  try {
    const ua = navigator.userAgent;
    let browser = "Other";
    if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";

    const platform = navigator.platform || "Web";

    await api.post("/notifications/subscription", {
      subscriptionId,
      provider: "onesignal",
      browser,
      platform
    });
    console.log("[OneSignal] Subscription synchronized with backend.");
  } catch (err) {
    console.error("[OneSignal] Failed to sync subscription with backend:", err);
  }
};
