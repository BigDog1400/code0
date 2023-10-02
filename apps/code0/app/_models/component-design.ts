import mongoose from 'mongoose';

interface ComponentDesign {
  name: string;
  description: {
    by_user: string;
    by_llm: string;
  };
  icons: string[];
  libraries: {
    name: string;
    reason: string;
  }[];
}

interface ComponentDesignModelWithGenerationId extends ComponentDesign {
  generation_id: string;
}
// Define a schema for the data
export const ComponentDesignSchema =
  new mongoose.Schema<ComponentDesignModelWithGenerationId>({
    description: {
      by_user: String,
      by_llm: String,
    },
    generation_id: {
      type: String,
      required: true,
    },
    icons: [String],
    libraries: [
      {
        name: String,
        reason: String,
      },
    ],
    name: String,
  });

// Create a Mongoose model using the schema
export const ComponentDesignModel =
  mongoose.models.ComponentDesign<ComponentDesignModelWithGenerationId> ||
  mongoose.model('ComponentDesign', ComponentDesignSchema);
