import { Metadata } from "next";
import TripPlannerClient from "./_components/trip-planner-client";

export const metadata: Metadata = {
  title: "AI Dream Trip Generator | Explore Nepal",
  description: "Let AI create your perfect personalized Nepal itinerary with budget estimates, day-by-day plans, and safety tips.",
};

export default function TripPlannerPage() {
  return <TripPlannerClient />;
}
