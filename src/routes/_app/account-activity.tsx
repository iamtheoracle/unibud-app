import { createFileRoute } from "@tanstack/react-router";
import { AccountActivityPage } from "@/components/unibud/data-pages";

export const Route = createFileRoute("/_app/account-activity")({ component: AccountActivityPage });
