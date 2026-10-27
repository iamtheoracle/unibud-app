import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/unibud/data-pages";

export const Route = createFileRoute("/_app/dashboard")({ component: DashboardPage });
