import { createFileRoute } from "@tanstack/react-router";
import { DataListPage } from "@/components/unibud/data-pages";

export const Route = createFileRoute("/_app/data-list")({ component: DataListPage });
