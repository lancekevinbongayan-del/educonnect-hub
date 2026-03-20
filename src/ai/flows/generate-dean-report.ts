'use server';
/**
 * @fileOverview A Genkit flow for generating a summary report for the dean based on visitor data.
 *
 * - generateDeanReport - A function that generates a dean's report.
 * - GenerateDeanReportInput - The input type for the generateDeanReport function.
 * - GenerateDeanReportOutput - The return type for the generateDeanReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisitDataSchema = z.object({
  timestamp: z.string().datetime().describe('The timestamp of the visit in ISO 8601 format.'),
  department: z.string().describe('The college department the visitor checked into.'),
  reasonForVisit: z.string().describe('The reason for the visitor\'s visit.'),
});

const GenerateDeanReportInputSchema = z.object({
  visitorData: z.array(VisitDataSchema).describe('An array of visitor check-in data.'),
});
export type GenerateDeanReportInput = z.infer<typeof GenerateDeanReportInputSchema>;

const GenerateDeanReportOutputSchema = z.string().describe('The summary report for the dean.');
export type GenerateDeanReportOutput = z.infer<typeof GenerateDeanReportOutputSchema>;

export async function generateDeanReport(input: GenerateDeanReportInput): Promise<GenerateDeanReportOutput> {
  return generateDeanReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDeanReportPrompt',
  input: {schema: GenerateDeanReportInputSchema},
  output: {schema: GenerateDeanReportOutputSchema},
  prompt: `You are an AI assistant tasked with generating a summary report for the dean based on provided visitor check-in data.
Your goal is to analyze the data and identify the busiest hours of the day and the most common reasons for visits.
Present these insights in a concise, professional, and easy-to-understand report suitable for a dean.

Here is the visitor check-in data:

{{#if visitorData}}
{{#each visitorData}}
- Timestamp: {{{timestamp}}}, Department: {{{department}}}, Reason for Visit: {{{reasonForVisit}}}
{{/each}}
{{else}}
No visitor data available.
{{/if}}

Please generate the report now.`
});

const generateDeanReportFlow = ai.defineFlow(
  {
    name: 'generateDeanReportFlow',
    inputSchema: GenerateDeanReportInputSchema,
    outputSchema: GenerateDeanReportOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
