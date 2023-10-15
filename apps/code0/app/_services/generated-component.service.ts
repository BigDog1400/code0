import clientPromise from '@/lib/database';
import {
  GeneratedComponentBase,
  GeneratedComponentMetadata,
  GeneratedComponentModel,
} from '@/app/_models/component';
import { NextRequest } from 'next/server';

interface Params {
  generationId: string;
}

export async function getGeneratedComponentByGenerationId(
  generationId: string,
) {
  await clientPromise;
  const components =
    await GeneratedComponentModel.findOne<GeneratedComponentBase>({
      generationId,
    }).sort({ timestamp: -1 });

  if (!components) {
    return null;
  }

  return components;
}

export async function getComponentIterationsById(
  generationId: string,
): Promise<GeneratedComponentMetadata> {
  await clientPromise;
  const components = await GeneratedComponentModel.find({
    generationId,
  });

  return {
    ...components[0].toObject(),
    iterations: components.sort(),
  };
}
