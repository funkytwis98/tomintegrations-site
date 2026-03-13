"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface Notification {
  id: string;
  client_id: string;
  call_id: string | null;
  type: string;
  channel: string | null;
  message: string;
  status: string;
  created_at: string;
}

export default function NotificationsPage() {
  const { id } = useParams<{ id: string }>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [id]);

  async function loadNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("client_id", id)
      .eq("channel", "dashboard")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load notifications");
    } else {
      setNotifications(data ?? []);
    }
    setLoading(false);
  }

  async function markAsRead(notifId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("id", notifId);
    if (error) {
      toast.error("Failed to mark as read");
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, status: "read" } : n))
      );
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => n.status === "sent").map((n) => n.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .in("id", unreadIds);
    if (error) {
      toast.error("Failed to mark all as read");
    } else {
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, status: "read" } : n))
      );
      toast.success("All marked as read");
    }
  }

  if (loading) return <Spinner />;

  const kbOpportunities = notifications.filter((n) => n.type === "knowledge_base_opportunity");
  const otherNotifications = notifications.filter((n) => n.type !== "knowledge_base_opportunity");
  const unreadCount = notifications.filter((n) => n.status === "sent").length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {kbOpportunities.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-amber-400">Knowledge Base Opportunities</h2>
              <p className="text-sm text-neutral-500">
                Sarah couldn&apos;t answer these questions. Teach her so she handles them next time.
              </p>
              <div className="space-y-2">
                {kbOpportunities.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    clientId={id}
                    onMarkRead={markAsRead}
                    showTeachButton
                  />
                ))}
              </div>
            </section>
          )}

          {otherNotifications.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-neutral-300">Other Notifications</h2>
              <div className="space-y-2">
                {otherNotifications.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    clientId={id}
                    onMarkRead={markAsRead}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function NotificationCard({
  notif,
  clientId,
  onMarkRead,
  showTeachButton,
}: {
  notif: Notification;
  clientId: string;
  onMarkRead: (id: string) => void;
  showTeachButton?: boolean;
}) {
  const isUnread = notif.status === "sent";

  // Extract the question from the message
  const questionMatch = notif.message.match(/: "(.+)"$/);
  const question = questionMatch ? questionMatch[1] : null;

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isUnread
          ? "border-amber-400/30 bg-amber-400/5"
          : "border-neutral-800 bg-neutral-900/50"
      }`}
      onClick={() => isUnread && onMarkRead(notif.id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isUnread && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            )}
            <p className={`text-sm ${isUnread ? "font-medium text-neutral-100" : "text-neutral-400"}`}>
              {question
                ? <>Sarah couldn&apos;t answer: <span className="text-amber-300">&quot;{question}&quot;</span></>
                : notif.message
              }
            </p>
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            {new Date(notif.created_at).toLocaleString()}
          </p>
        </div>

        {showTeachButton && (
          <Link
            href={`/clients/${clientId}/learn`}
            className="shrink-0 rounded-md bg-amber-400/10 px-3 py-1.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400/20"
          >
            Teach Sarah &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-700 p-12 text-center">
      <p className="text-lg text-neutral-400">No notifications yet</p>
      <p className="mt-1 text-sm text-neutral-600">
        Notifications will appear here when Sarah encounters questions she can&apos;t answer.
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-amber-400" />
    </div>
  );
}
