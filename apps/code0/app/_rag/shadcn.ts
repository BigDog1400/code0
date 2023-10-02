// TODO: remove this file when the real API is ready, we're just using this to test the UI
import shadcn from '../../shadcn_dump.json';

export async function ragShadcn(query: { library_components: string[] }) {
  return shadcn.filter((e) =>
    query.library_components
      .map((e) => e.toLowerCase())
      .includes(e.name.toLowerCase()),
  );
}
