import mongoose, { Model } from "mongoose";

interface IGeneraatedComponent {
  componentId: string;
  slug: string;
  name: string;
  prompt: string;
  timestamp: Date;
  version: string;
  code: string;
};

// Define a schema for the data
export const GeneratedComponentSchema = new mongoose.Schema<IGeneraatedComponent>({
  componentId: {
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
});

// Create a Mongoose model using the schema
export const GeneratedComponentModel: Model<IGeneraatedComponent> =
  mongoose.models.GeneratedComponent ||
  mongoose.model("GeneratedComponent", GeneratedComponentSchema);
