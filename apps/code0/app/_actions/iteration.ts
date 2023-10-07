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
import { createIteration } from '../_tasks/create-iteration';

const frameworkMap: Record<AllowedFramework, string> = {
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
};

export async function processIterationPrompt(
  prevState: any,
  formData: FormData,
) {
  await clientPromise;
  const iteration = await createIteration({
    generationId: formData.get('generationId') as string,
    description: formData.get('prompt') as string,
  });
  return {
    message: 'Iteration created',
    // iteration: await createIteration(formData),
  };
}
