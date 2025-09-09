import { createToaster } from "@chakra-ui/react";

// Create a global toaster instance
const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
  overlap: true,
  offsets: "20px",
  max: 3,
});

// Toast utility functions
export const showSuccess = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "success",
    duration: 4000,
  });
};

export const showError = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "error",
    duration: 6000,
  });
};

export const showWarning = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "warning",
    duration: 5000,
  });
};

export const showInfo = (title: string, description?: string) => {
  toaster.create({
    title,
    description,
    type: "info",
    duration: 4000,
  });
};

// Export the toaster instance for advanced usage
export { toaster };