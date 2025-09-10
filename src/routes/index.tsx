import { DashboardPage } from "@/modules/dashboard/dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});
