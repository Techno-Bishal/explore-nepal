import { Metadata } from "next";
import NepalMapClient from "./_components/nepal-map-client";

export const metadata: Metadata = {
  title: "Interactive Map | Explore Nepal",
  description: "Explore Nepal's destinations on an interactive map. Filter by region, category, and discover trending spots.",
};

export default function MapPage() {
  return <NepalMapClient />;
}
