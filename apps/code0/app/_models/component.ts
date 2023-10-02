import mongoose from 'mongoose';

export interface GeneratedComponent {
  generationId: string;
  slug: string;
  name: string;
  prompt: string;
  timestamp?: Date;
  version: string;
  code: string;
}

export const GeneratedComponentSchema = new mongoose.Schema<GeneratedComponent>(
  {
    generationId: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
);

// Create a Mongoose model using the schema
export const GeneratedComponentModel =
  mongoose.models.GeneratedComponent<GeneratedComponent> ||
  mongoose.model<GeneratedComponent>(
    'GeneratedComponent',
    GeneratedComponentSchema,
  );
