import { Metadata } from "next";
import CompareClient from "./_components/compare-client";

export const metadata: Metadata = {
  title: "Compare Destinations | Explore Nepal",
  description: "Compare Nepal destinations side by side - budget, difficulty, weather, altitude, and more.",
};

export default function ComparePage() {
  return <CompareClient />;
}
