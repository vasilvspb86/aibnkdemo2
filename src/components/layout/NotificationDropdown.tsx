import { useState } from "react";
import { Bell, CheckCircle2, AlertCircle, CreditCard, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "success" | "alert" | "payment" | "card";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Payment Received",
    description: "AED 15,000 from Dubai Tech Solutions",
    time: "2 mins ago",
    read: false,
    type: "payment",
  },
  {
    id: "2",
    title: "KYB Application Update",
    description: "Your application is under review",
    time: "1 hour ago",
    read: false,
    type: "alert",
  },
  {
    id: "3",
    title: "Card Transaction",
    description: "AED 250 at Emirates Office Supplies",
    time: "3 hours ago",
    read: true,
    type: "card",
  },
  {
    id: "4",
    title: "Payment Completed",
    description: "AED 5,000 sent to Global Supplies LLC",
    time: "Yesterday",
    read: true,
    type: "success",
  },
];

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-accent" />;
    case "alert":
      return <AlertCircle className="h-4 w-4 text-warning" />;
    case "payment":
      return <ArrowDownLeft className="h-4 w-4 text-accent" />;
    case "card":
      return <CreditCard className="h-4 w-4 text-muted-foreground" />;
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !notification.read && "font-medium")}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
