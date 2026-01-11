"use client";

import type { UserSubscription } from "@/lib/stripe/subscriptions";
import { t } from "@/locales/fr";

interface SubscriptionListProps {
  subscriptions: UserSubscription[];
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-lg border border-[#e7e1d9] bg-white p-6">
        <p className="text-sm text-[#524b5a]">{t.account.subscriptions.noSubscriptions}</p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = t.account.subscriptions.status;
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
      case "trialing":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      case "past_due":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="rounded-lg border border-[#e7e1d9] bg-white p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                    subscription.status
                  )}`}
                >
                  {getStatusLabel(subscription.status)}
                </span>
                {subscription.cancel_at_period_end && (
                  <span className="text-xs text-[#524b5a]">
                    ({t.account.subscriptions.cancelsAt}{" "}
                    {formatDate(subscription.current_period_end)})
                  </span>
                )}
              </div>
              <p className="text-sm text-[#524b5a]">
                {subscription.current_period_end && !subscription.cancel_at_period_end
                  ? `${t.account.subscriptions.renewsAt} ${formatDate(subscription.current_period_end)}`
                  : subscription.status === "canceled"
                    ? t.account.subscriptions.canceled
                    : ""}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

