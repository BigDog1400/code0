'use server';
import { z } from 'zod';

export async function processPrompt(prevState: any, formData: FormData) {
  const schema = z.object({
    prompt: z.string().nonempty(),
  });
  try {
    const data = schema.parse({
      prompt: formData.get('prompt'),
    });
    try {
      // sleep for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return { message: `Received prompt: ${data.prompt}` };
    } catch (e) {
      return { message: 'Failed to process prompt' };
    }
  } catch (error) {
    return { message: 'Failed to process prompt' };
  }
}
