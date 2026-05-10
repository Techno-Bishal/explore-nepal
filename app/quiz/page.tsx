import { Metadata } from "next";
import QuizClient from "./_components/quiz-client";

export const metadata: Metadata = {
  title: "Travel Personality Quiz | Explore Nepal",
  description: "Discover your unique Nepal travel personality and get personalized destination recommendations.",
};

export default function QuizPage() {
  return <QuizClient />;
}
