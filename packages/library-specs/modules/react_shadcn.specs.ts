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
    `./clones/shadcn/apps/www/app/examples`
  );
  const shadcn_docs_files = Deno.readDir(
    `./clones/shadcn/apps/www/content/docs/components`
  );

  const docsSpecs = [];

  for await (const file of shadcn_docs_files) {
    const slug = file.name.split(".mdx")[0];
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

    for await (const folder of shadcn_example_folders) {
      if (folder.isDirectory) {
        const currentFolder = Deno.readDir(
          join(`./clones/shadcn/apps/www/app/examples`, folder.name)
        );

        for await (const fileb of currentFolder) {
          if (!fileb.isFile && !fileb.name.startsWith(slug)) continue;
          const fileContent = decoder.decode(
            await Deno.readFile(
              join(
                `./clones/shadcn/apps/www/app/examples`,
                folder.name,
                fileb.name
              )
            )
          );
          tsx_blocks_examples.push({
            source: fileb.name,
            code: fileContent
              .trim()
              .replaceAll(`"@/registry/default/ui/`, `"@/components/ui/`),
          });
        }
      }
    }

    docsSpecs.push({
      name: meta.title,
      description: meta.description,
      docs_path: join(
        `./clones/shadcn/apps/www/content/docs/components`,
        file.name
      ),
      docs: { ...meta },
      examples: tsx_blocks_examples,
    });
  }

  return docsSpecs.filter((e) => e);
};
export const getDocsSpecs = async (): Promise<IGenericLibrary> => ({
  clone: 'https://github.com/shadcn-ui/ui',
  framework: "react",
  library: "shadcn-ui",
  specs: await getSpecsFromDocsAndExamples(),
});
