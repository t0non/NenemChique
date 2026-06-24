'use server';
/**
 * @fileOverview A GenAI tool for generating personalized baby layette kit recommendations.
 *
 * - personalizedLayetteKitRecommendation - A function that generates a personalized baby layette kit recommendation.
 * - PersonalizedLayetteKitRecommendationInput - The input type for the recommendation function.
 * - PersonalizedLayetteKitRecommendationOutput - The return type for the recommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedLayetteKitRecommendationInputSchema = z.object({
  babyAgeSize: z
    .string()
    .describe(
      'The age or size of the baby, e.g., "newborn", "0-3 months", "3-6 months", "6-9 months".'
    ),
  season: z
    .string()
    .describe(
      'The current season or the season for which the kit is needed, e.g., "summer", "winter", "spring", "fall".'
    ),
});
export type PersonalizedLayetteKitRecommendationInput = z.infer<
  typeof PersonalizedLayetteKitRecommendationInputSchema
>;

const PersonalizedLayetteKitRecommendationOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of personalized baby clothing and accessory recommendations.'),
  justifications: z
    .string()
    .describe('Detailed explanations for why each recommendation is suitable.'),
});
export type PersonalizedLayetteKitRecommendationOutput = z.infer<
  typeof PersonalizedLayetteKitRecommendationOutputSchema
>;

export async function personalizedLayetteKitRecommendation(
  input: PersonalizedLayetteKitRecommendationInput
): Promise<PersonalizedLayetteKitRecommendationOutput> {
  return personalizedLayetteKitRecommendationFlow(input);
}

const personalizedLayetteKitPrompt = ai.definePrompt({
  name: 'personalizedLayetteKitPrompt',
  input: { schema: PersonalizedLayetteKitRecommendationInputSchema },
  output: { schema: PersonalizedLayetteKitRecommendationOutputSchema },
  prompt: `You are an expert in baby clothing and layette kits, with extensive knowledge of what babies need at different ages/sizes and during various seasons.

Based on the following information, provide a personalized baby layette kit recommendation.

Baby Age/Size: {{{babyAgeSize}}}
Season: {{{season}}}

Carefully consider the baby's age/size and the season to suggest appropriate clothing items and accessories. Focus on practicality, comfort, and safety.

Provide a list of recommended items and a detailed justification for your suggestions, explaining why each item is suitable for the given baby age/size and season.`,
});

const personalizedLayetteKitRecommendationFlow = ai.defineFlow(
  {
    name: 'personalizedLayetteKitRecommendationFlow',
    inputSchema: PersonalizedLayetteKitRecommendationInputSchema,
    outputSchema: PersonalizedLayetteKitRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedLayetteKitPrompt(input);
    return output!;
  }
);
