"use server";
import {
  analyzePosture as analyzePostureFlow,
  type AnalyzePostureInput,
} from "@/ai/flows/analyze-posture";

export async function analyzePostureAction(input: AnalyzePostureInput) {
  // Add a delay to simulate network latency and show loading states.
  await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const result = await analyzePostureFlow(input);
    return result;
  } catch (error) {
    console.error("Error in analyzePostureAction:", error);
    // Propagate a serializable error object.
    throw new Error("Failed to analyze posture. Please try again.");
  }
}
