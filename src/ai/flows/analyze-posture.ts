'use server';

/**
 * @fileOverview Analyzes user posture from a camera feed and provides personalized stretch recommendations.
 *
 * - analyzePosture - The function to analyze posture and return stretch recommendations.
 * - AnalyzePostureInput - The input type for the analyzePosture function.
 * - AnalyzePostureOutput - The output type for the analyzePosture function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePostureInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user's posture, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
type AnalyzePostureInput = z.infer<typeof AnalyzePostureInputSchema>;

const AnalyzePostureOutputSchema = z.object({
  postureAnalysis: z
    .string()
    .describe('Analysis of the user posture based on the provided image.'),
  stretchRecommendations: z
    .string()
    .describe('Personalized stretch recommendations based on the posture analysis.'),
});
type AnalyzePostureOutput = z.infer<typeof AnalyzePostureOutputSchema>;

export async function analyzePosture(input: AnalyzePostureInput): Promise<AnalyzePostureOutput> {
  return analyzePostureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePosturePrompt',
  input: {schema: AnalyzePostureInputSchema},
  output: {schema: AnalyzePostureOutputSchema},
  prompt: `You are an AI posture analysis assistant. Analyze the user's posture based on the provided image and provide personalized stretch recommendations.

  Photo: {{media url=photoDataUri}}
  Analysis and recommendations:`,
});

const analyzePostureFlow = ai.defineFlow(
  {
    name: 'analyzePostureFlow',
    inputSchema: AnalyzePostureInputSchema,
    outputSchema: AnalyzePostureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
