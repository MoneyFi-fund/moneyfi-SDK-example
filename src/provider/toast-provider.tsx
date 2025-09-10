import { toaster } from "@/utils/toast";
import { Toaster } from "@chakra-ui/react";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          <div
            style={{
              background:
                toast.type === "success"
                  ? "#22c55e"
                  : toast.type === "error"
                  ? "#ef4444"
                  : toast.type === "warning"
                  ? "#f59e0b"
                  : "#3b82f6",
              color: "white",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {toast.title}
            </div>
            {toast.description && (
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                {toast.description}
              </div>
            )}
          </div>
        )}
      </Toaster>
    </>
  );
};
