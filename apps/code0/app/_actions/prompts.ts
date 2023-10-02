'use server';
import { z } from 'zod';
import { designComponentFromPrompt } from '../_tasks/design-component-from-prompt';
import { createComponentGenerationContext } from '../_tasks/create-component-generation-context';
import { generateComponent } from '../_tasks/generate-component';
import clientPromise from '@/lib/database';
import { nanoid } from 'nanoid';
export async function processPrompt(prevState: any, formData: FormData) {
  await clientPromise;
  const schema = z.object({
    prompt: z.string().nonempty(),
  });

  try {
    const data = schema.parse({
      prompt: formData.get('prompt'),
    });
    const generationId = nanoid();

    try {
      // TODO: how can we abstract this so that we can use multiple different models? (also, should we use multiple different models?)
      const designComponent = await designComponentFromPrompt({
        description: data.prompt,
        generationId,
      });

      const componentTaskContext = await createComponentGenerationContext({
        componentDesign: designComponent,
      });

      const code = await generateComponent({
        context: componentTaskContext,
        componentDesign: designComponent,
        generationId,
      });

      // TODO: redirect user to the new component page. We can use the generationId to do this (e.g. /components/:generationId)
      // We may want to add a loading screen while the component is being generated, or send the user to a page where they can see the progress of the generation
      // And then ping the API every few seconds to see if the component has been generated yet. Let's see how long it takes to generate a component first
      return { message: `Received prompt: ${data.prompt}` };
    } catch (e) {
      return { message: 'Failed to process prompt' };
    }
  } catch (error) {
    return { message: 'Failed to process prompt' };
  }
}
