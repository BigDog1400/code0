// TODO: remove this file when the real API is ready, we're just using this to test the UI
import { AllowedFramework, GenericLibraryModel } from '../_models/library';

export async function ragLibrary(query: {
  library_components: string[];
  framework: AllowedFramework;
}) {
  const library = (
    await GenericLibraryModel.find({
      framework: query.framework,
      specs: {
        $elemMatch: {
          name: {
            $in: query.library_components,
          },
        },
      },
    })
  )
    .flatMap((e) => e.specs)
    .filter((e) => query.library_components.includes(e.name));
  return library.filter((e) =>
    query.library_components
      .map((e) => e.toLowerCase())
      .includes(e.name.toLowerCase()),
  );
}
