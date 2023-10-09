import clientPromise from '@/lib/database';
import { AllowedFramework, GenericLibraryModel } from '../_models/library';
import { getGeneratedComponentByGenerationId } from '../_services/generated-component.service';
import { designComponentIterationFromPrompt } from './design-component-iteration-from-prompt';
import { createComponentGenerationContext } from './create-component-generation-context';
import { generateComponentIteration } from './generate-component-iteration';
interface DesignComponentFromPromptParams {
  description: string;
  generationId: string;
}

export async function createIteration({
  generationId,
  description,
}: DesignComponentFromPromptParams) {
  await clientPromise;

  const lastGeneratedComponent = await getGeneratedComponentByGenerationId(
    generationId,
  );

  debugger;
  const newComponentDesign = await designComponentIterationFromPrompt({
    description,
    generationId,
    lastGeneratedComponent: lastGeneratedComponent!,
  });

  debugger;

  console.log('Continuing to create component generation context');
  const componentTaskContext = await createComponentGenerationContext({
    componentDesign: newComponentDesign,
    framework: lastGeneratedComponent?.framework as AllowedFramework,
  });

  debugger;

  console.log('Continuing to generate component iteration');

  const code = await generateComponentIteration({
    context: componentTaskContext,
    componentDesign: newComponentDesign,
    generationId,
    lastGeneratedComponent: lastGeneratedComponent!,
  });

  return code;
}
