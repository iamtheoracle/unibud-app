import { createFileRoute } from "@tanstack/react-router";
import { DataPreferencesPage } from "@/components/unibud/data-pages";

export const Route = createFileRoute("/_app/data-preferences")({ component: DataPreferencesPage });
