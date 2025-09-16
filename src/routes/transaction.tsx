import Transaction from "@/modules/transaction/transaction";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transaction")({
  component: Transaction,
});
