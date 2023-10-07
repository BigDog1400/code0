import clientPromise from '@/lib/database';
import {
  GeneratedComponent,
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
  const components = await GeneratedComponentModel.findOne<GeneratedComponent>({
    generationId,
  }).sort({ timestamp: -1 });

  if (!components) {
    return null;
  }

  return components;
}
