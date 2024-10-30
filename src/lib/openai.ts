import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openaiInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

export async function generateSummary(text: string): Promise<string> {
  if (!openaiInstance) {
    throw new Error('OpenAI API key not set');
  }

  try {
    const response = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries of documents."
        },
        {
          role: "user",
          content: `Please provide a concise summary of the following text:\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || "Failed to generate summary";
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}