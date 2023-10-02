//@deno-types=npm:@types/markdown-it
import mdit from "npm:markdown-it";
import { IGenericLibrary } from "../types.ts";
import { join } from "https://deno.land/std@0.202.0/path/mod.ts";

const decoder = new TextDecoder();

const markdownIt = mdit();
const extractTsxCodeBlocks = (markdownFile: string) => {
  const tokens = markdownIt.parse(markdownFile, {});

  const tsxCodeBlocks = [];
  let currentCodeBlock = "";

  for (const token of tokens) {
    if (token.type === "fence" && ["js", "vue", "html"].includes(token.info)) {
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
    const chakra_docs_files = Deno.readDir(
      `./clones/chakra-vue/content/4.components`
    );
    const chakra_example_folders = Deno.readDir(
      `./clones/chakra-vue/components/content/examples`
    );
  
    const docsSpecs = [];
  
    for await (const file of chakra_docs_files) {
      const slug = file.name.split(".md")[0];
      const meta = {
        title: "",
        description: "",
        version: "",
      };
      const content = decoder.decode(
        await Deno.readFile(
          join(`./clones/chakra-vue/content/4.components`, file.name)
        )
      );
  
      const tsx_blocks_docs = extractTsxCodeBlocks(content).map((block) => {
        return {
          source: file.name,
          code: block
            .trim()
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
          else if (split[0] === `version`) meta.version = split[1].trim();
        });
  
      if (!tsx_blocks_docs || !tsx_blocks_docs.length) continue;
  
      const tsx_blocks_examples = [];
  
      for await (const folder of chakra_example_folders) {
        if (folder.isDirectory && folder.name == slug) {
          const currentFolder = Deno.readDir(
            join(`./clones/chakra-vue/components/content/examples`, folder.name)
          );
  
          for await (const fileb of currentFolder) {
            if (!fileb.isFile && !fileb.name.startsWith(slug)) continue;
            const fileContent = decoder.decode(
              await Deno.readFile(
                join(
                  `./clones/chakra-vue/components/content/examples`,
                  folder.name,
                  fileb.name
                )
              )
            );
            tsx_blocks_examples.push({
              source: fileb.name,
              code: fileContent.trim()
            });
          }
        }
      }
  
      docsSpecs.push({
        name: meta.title,
        description: meta.description,
        docs_path: join(
          `./clones/chakra-vue/components/content/examples`,
          file.name
        ),
        docs: {
            import: tsx_blocks_docs[0],
            use: tsx_blocks_docs.slice(1),
            examples: tsx_blocks_examples
        },
      });
    }
  
    return docsSpecs.filter((e) => e);
  };

export const getDocsSpecs = (): IGenericLibrary => ({
  clone: {
    path: "chakra-vue",
    repo: "https://github.com/chakra-ui/vue-docs",
    branch: "main",
  },
  framework: "vue",
  library: "chakra-ui-vue-next",
  specs: () => getSpecsFromDocsAndExamples()
});
