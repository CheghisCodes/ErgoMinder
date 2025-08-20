"use server";
import {
  analyzePosture as analyzePostureFlow,
} from "@/ai/flows/analyze-posture";
import {
  textToSpeech as textToSpeechFlow,
} from "@/ai/flows/text-to-speech";

// Define types locally since they are not exported from the 'use server' files
type AnalyzePostureInput = {
  photoDataUri: string;
};
type TextToSpeechInput = string;


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

export async function textToSpeechAction(input: TextToSpeechInput) {
  try {
    const result = await textToSpeechFlow(input);
    return result;
  } catch (error) {
    console.error("Error in textToSpeechAction:", error);
    throw new Error("Failed to generate speech. Please try again.");
  }
}
