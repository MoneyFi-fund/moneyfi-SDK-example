import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/modules/history/history";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});
