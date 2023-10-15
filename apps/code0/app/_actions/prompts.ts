'use server';
import { z } from 'zod';
import { designComponentFromPrompt } from '../_tasks/design-component-from-prompt';
import { createComponentGenerationContext } from '../_tasks/create-component-generation-context';
import { generateComponent } from '../_tasks/generate-component';
import clientPromise from '@/lib/database';
import { nanoid } from 'nanoid';
import { AllowedFramework } from '../_models/library';
import registeredTemplates from '../_templates/index';
import { redirect } from 'next/navigation';

const frameworkMap: Record<AllowedFramework, string> = {
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
};

export async function processPrompt(prevState: any, formData: FormData) {
  await clientPromise;
  const schema = z.object({
    prompt: z.string().nonempty(),
    framework: z
      .string()
      .nonempty()
      .refine((val) => Object.keys(frameworkMap).includes(val)),
    template: z.string().nonempty(),
  });

  const generationId = nanoid();
  try {
    const data = schema.parse({
      prompt: formData.get('prompt'),
      framework: formData.get('framework') as AllowedFramework,
      template: formData.get('template'),
    });

    const libraries =
      registeredTemplates[data.framework as AllowedFramework].find(
        (e) => e.name === data.template,
      )?.specs || [];

    // TODO: how can we abstract this so that we can use multiple different models? (also, should we use multiple different models?)
    const designComponent = await designComponentFromPrompt({
      description: data.prompt,
      generationId,
      libraries,
      framework: data.framework,
    });

    console.log('Continuing to create component generation context');
    const componentTaskContext = await createComponentGenerationContext({
      componentDesign: designComponent,
      framework: data.framework as AllowedFramework,
    });

    console.log('Continuing to generate component');

    const code = await generateComponent({
      context: componentTaskContext,
      componentDesign: designComponent,
      framework: frameworkMap[data.framework as AllowedFramework],
      libraries,
      generationId,
    });

    console.log('Calling Forge API');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FORGE_API_URL}/api/forge/${generationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // TODO: redirect user to the new component page. We can use the generationId to do this (e.g. /components/:generationId)
    // We may want to add a loading screen while the component is being generated, or send the user to a page where they can see the progress of the generation
    // And then ping the API every few seconds to see if the component has been generated yet. Let's see how long it takes to generate a component first
  } catch (e) {
    console.log('Failed to process prompt', e);
    return { message: 'Failed to process prompt' };
  } finally {
    redirect(`/generated/${generationId}`);
  }
}
