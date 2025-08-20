'use server';
/**
 * @fileOverview A text-to-speech AI agent using Genkit.
 *
 * - textToSpeech - A function that converts text to speech.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated speech as a data URI. Expected format: 'data:audio/mp3;base64,<encoded_data>'."
    ),
});
type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('tts-1'),
      prompt: input.text,
      config: {
        responseModalities: ['AUDIO'],
      },
    });

    if (!media || !media.url) {
      throw new Error('No media returned from TTS model.');
    }
    
    // The model returns audio data that can be used directly.
    return {
      audioDataUri: media.url,
    };
  }
);
