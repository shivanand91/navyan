import { useState, useEffect } from "react";
import { BellRing, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initOneSignal, registerSubscriptionWithBackend } from "@/utils/notifications";

export default function PushPermissionBanner({ user }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if permission is already configured or explicitly dismissed/granted in this browser
    const pref = localStorage.getItem("navyan_notifications_preference");
    const browserPermission = "Notification" in window ? Notification.permission : "denied";

    if (!pref && browserPermission !== "granted") {
      // Delay displaying slightly so it's not jarring on load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleEnable = async () => {
    try {
      const OneSignal = await initOneSignal(user._id || user.id);
      if (OneSignal?.Notifications?.requestPermission) {
        // Prompt for notification permission
        const permission = await OneSignal.Notifications.requestPermission();
        localStorage.setItem("navyan_notifications_preference", permission);

        if (permission === "granted") {
          const subscriptionId = OneSignal.User?.PushSubscription?.id;
          if (subscriptionId) {
            await registerSubscriptionWithBackend(subscriptionId);
          }
        }
      } else {
        // Fallback for mock mode or standard web Notifications
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          localStorage.setItem("navyan_notifications_preference", permission);
        }
      }
    } catch (err) {
      console.error("Error setting up notifications:", err);
      localStorage.setItem("navyan_notifications_preference", "granted"); // Set to avoid re-prompting
    } finally {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("navyan_notifications_preference", "dismissed");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-300">
      <Card className="border-primary/20 bg-[color:var(--card-elevated)] shadow-2xl">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <BellRing className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <h4 className="font-display text-base font-semibold text-[color:var(--text)]">
                  Stay updated with Navyan
                </h4>
                <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed">
                  Get real-time browser updates for:
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-[color:var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Internship deadlines</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Project & task submission alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Mentorship & Q&A schedules</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>New developer opportunities</span>
                </li>
              </ul>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={handleEnable} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-xs">
                  Enable Notifications
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs text-[color:var(--text-secondary)]">
                  Maybe Later
                </Button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-[color:var(--text-muted)] hover:text-[color:var(--text)] transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
