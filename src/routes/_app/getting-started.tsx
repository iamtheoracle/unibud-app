import { createFileRoute } from "@tanstack/react-router";
import { GettingStartedPage } from "@/components/unibud/data-pages";

export const Route = createFileRoute("/_app/getting-started")({ component: GettingStartedPage });
