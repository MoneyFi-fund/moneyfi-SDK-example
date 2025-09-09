import { useEffect, useRef } from "react";
import { Toaster, createToaster } from "@chakra-ui/react";
import { useNotifications } from "@/hooks/useNotifications";

const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
  overlap: true,
  offsets: "20px",
  max: 3
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { notifications } = useNotifications();
  const displayedNotifications = useRef(new Set<string>());

  useEffect(() => {
    // Handle new notifications
    notifications.forEach((notification) => {
      // Check if this notification has already been displayed
      if (!displayedNotifications.current.has(notification.id)) {
        toaster.create({
          id: notification.id,
          title: notification.title,
          description: notification.description,
          type: notification.type,
          duration: notification.duration || 5000,
        });
        
        // Mark this notification as displayed
        displayedNotifications.current.add(notification.id);
      }
    });
  }, [notifications]);

  return (
    <>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          <div
            style={{
              background: toast.type === 'success' ? '#22c55e' : 
                         toast.type === 'error' ? '#ef4444' : 
                         toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {toast.title}
            </div>
            {toast.description && (
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {toast.description}
              </div>
            )}
          </div>
        )}
      </Toaster>
    </>
  );
};