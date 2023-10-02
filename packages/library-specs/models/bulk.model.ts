import { model, Schema } from "npm:mongoose";

const GenericLibrarySpecSchema = new Schema({
  name: String,
  description: String,
  docs_path: String,
  docs: {
    import: {
      code: String,
      source: String,
    },
    use: Schema.Types.Mixed,
    examples: [
      {
        source: String,
        code: String,
      },
    ],
  }
});

const GenericLibrarySchema = new Schema({
  framework: String,
  library: {
    unique: true,
    type: String,
  },
  specs: [GenericLibrarySpecSchema],
});

// Create the Mongoose model based on the GenericLibrarySchema
export const GenericLibraryModel = model(
  "GenericLibrary",
  GenericLibrarySchema
);

// Define the schema for LibraryCollection
const LibraryCollectionSchema = new Schema({
  react: [{ type: Schema.Types.ObjectId, ref: "GenericLibrary" }],
  vue: [{ type: Schema.Types.ObjectId, ref: "GenericLibrary" }],
  svelte: [{ type: Schema.Types.ObjectId, ref: "GenericLibrary" }],
});

// Create the Mongoose model based on the LibraryCollectionSchema
export const LibraryCollectionModel = model(
  "LibraryCollection",
  LibraryCollectionSchema
);
