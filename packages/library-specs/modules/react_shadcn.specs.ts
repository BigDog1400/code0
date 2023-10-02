//@deno-types=npm:@types/markdown-it
import mdit from "npm:markdown-it";
import { join } from "https://deno.land/std@0.202.0/path/mod.ts";
import { IGenericLibrary } from "../types.ts";

const decoder = new TextDecoder();

const markdownIt = mdit();
const extractTsxCodeBlocks = (markdownFile: string) => {
  const tokens = markdownIt.parse(markdownFile, {});

  const tsxCodeBlocks = [];
  let currentCodeBlock = "";

  for (const token of tokens) {
    if (token.type === "fence" && token.info === "tsx") {
      currentCodeBlock = token.content;
      tsxCodeBlocks.push(currentCodeBlock);
    } else if (currentCodeBlock && token.type === "fence") {
      currentCodeBlock = "";
    } else if (currentCodeBlock) {
      currentCodeBlock += "\n" + token.content;
    }
  }

  return tsxCodeBlocks;
};

const getSpecsFromDocsAndExamples = async () => {
  const shadcn_example_folders = Deno.readDir(
    `./clones/shadcn/apps/www/registry/default/example`
  );
  const shadcn_docs_files = Deno.readDir(
    `./clones/shadcn/apps/www/content/docs/components`
  );

  const docsSpecs = [];

  for await (const file of shadcn_docs_files) {
    const slug = file.name.split(".mdx")[0];
    console.log(slug);
    const meta = {
      title: "",
      description: "",
      component: false,
    };
    const content = decoder.decode(
      await Deno.readFile(
        join(`./clones/shadcn/apps/www/content/docs/components`, file.name)
      )
    );

    const tsx_blocks_docs = extractTsxCodeBlocks(content).map((block) => {
      return {
        source: file.name,
        code: block
          .trim()
          .replaceAll(`"@/registry/default/ui/`, `"@/components/ui/`),
      };
    });

    content
      .split("---")[1]
      .trim()
      .split("\n")
      .map((e) => {
        const split = e.trim().split(":");
        if (split[0] === `title`) meta.title = split[1].trim();
        else if (split[0] === `description`) meta.description = split[1].trim();
        else if (split[0] === `component`)
          meta.component = split[1].trim() === "true" ? true : false;
      });

    if (!tsx_blocks_docs || !tsx_blocks_docs.length) continue;
    if (!meta.component) continue;

    const tsx_blocks_examples = [];

    for await (const fileb of shadcn_example_folders) {
      if (fileb.isFile && fileb.name.startsWith(slug)) {

        const fileContent = decoder.decode(
          await Deno.readFile(
            join(`./clones/shadcn/apps/www/registry/default/example`, fileb.name)
          )
        );;
        tsx_blocks_examples.push({
          source: fileb.name,
          code: fileContent
            .trim()
            .replaceAll(`"@/registry/default/ui/`, `"@/components/ui/`),
        });
      }
    }

    docsSpecs.push({
      name: meta.title,
      description: meta.description,
      docs_path: join(
        `./clones/shadcn/apps/www/copent/docs/components`,
        file.name
      ),
      docs: {
        import: tsx_blocks_docs[0],
        use: tsx_blocks_docs.slice(1),
        examples: tsx_blocks_examples,
      },
    });
  }

  return docsSpecs.filter((e) => e);
};
export const getDocsSpecs = (): IGenericLibrary => ({
  clone: {
    path: "shadcn",
    repo: "https://github.com/shadcn-ui/ui",
    branch: "main",
  },
  framework: "react",
  library: "shadcn-ui",
  specs: () => getSpecsFromDocsAndExamples(),
});
