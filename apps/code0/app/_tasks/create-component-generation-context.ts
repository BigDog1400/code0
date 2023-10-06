import { ChatCompletionMessageParam } from 'openai/resources/chat/index.mjs';
import { ComponentDesign } from '../_interfaces/component-design';
import { ragLibrary } from '../_rag/library';
import { get_encoding } from '@dqbd/tiktoken';
import { AllowedFramework } from '../_models/library';

const tiktokenEncoder = get_encoding('cl100k_base');

interface ComponentGenerationContextParams {
  componentDesign: ComponentDesign;
  framework: AllowedFramework;
}

export async function createComponentGenerationContext(
  params: ComponentGenerationContextParams,
): Promise<ChatCompletionMessageParam[]> {
  let retrievedContext = {
    components: !params.componentDesign.libraries
      ? []
      : // : (
        //   await rag_library_components.run({
        //     library_components: query.library_components.map(e=>e.name),
        //   })
        await ragLibrary({
          library_components: params.componentDesign.libraries.map(
            (e) => e.name,
          ),
          framework: params.framework,
        }),
    //         icons : !query.icons
    //         ? []
    //         : ( await rag_icons.run({ icons: query.icons,   }) ),
    // library_components : !query.library_components
    //         ? []
    icons: [], // for now we are going to ignore icons until we have a better way to handle them using the RAG
  };

  // We need to limit the number of examples we use for each library component
  retrievedContext.components = retrievedContext.components.map((e, idx) => {
    const docs = e?.docs;
    const examples_total_tokens = tiktokenEncoder.encode(
      docs.examples
        .map(
          (example) => example.source + '```\n' + example.code.trim() + '\n```',
        )
        .join('\n\n'),
    ).length;

    console.log(
      `tokens for context entry ${e.name} : ${examples_total_tokens} (limit : ${process.env.CONTEXT_TOKENS_PER_LIBRARY_COMPONENT_LIMIT})`,
    );

    // If the total number of tokens for all examples for this library component is greater than the limit, we need to reduce the number of examples to just one
    // We will randomly select one example to keep
    if (
      examples_total_tokens >
      parseInt(process.env.CONTEXT_TOKENS_PER_LIBRARY_COMPONENT_LIMIT!)
    ) {
      e.docs.examples = [
        docs.examples[Math.floor(Math.random() * docs.examples.length)],
      ];
      return e;
    }
    return e;
  });

  return [
    ...retrievedContext.components.map((e, idx) => {
      return {
        role: `user`,
        content:
          `Library components can be used while making the new ${params.framework} component\n\n` +
          `Suggested library component (${idx + 1}/${
            params.componentDesign.libraries.length
          }) : ${e.name} - ${e.description}\n` +
          `Suggested usage : ${params.componentDesign.libraries[idx].reason}\n\n\n` +
          `# ${e.name} can be imported into the new component like this:\n` +
          '```tsx\n' +
          e.docs.import.code.trim() +
          '\n```\n\n---\n\n' +
          `# examples of how ${e.name} can be used inside the new component:\n` +
          e.docs.use
            .map((block) => {
              return '```tsx\n' + block.code.trim() + '\n```';
            })
            .join(`\n\n`) +
          '\n\n---\n\n' +
          `# full code examples of ${params.framework} components that use ${e.name} :\n` +
          e.docs.examples
            .map((example) => {
              return example.source + '```\n' + example.code.trim() + '\n```';
            })
            .join(`\n\n`),
      };
    }),

    // ...[
    //   retrievedContext.icons.length
    //     ? {
    //       role: `user`,
    //       content: `Icon elements can optionally be used when making the React component.\n\n`
    //                 + `---\n\n* example: importing icons in the component (only import the ones you need) :\n\n`
    //                 + '```tsx\n'
    //                 + `import { ${retrieved.icons.map(e=> e.retrieved.join(' , ') ).join(' , ')} } from "lucide-react";`
    //                 + '\n```\n\n'
    //                 + `* example: using an icon inside the component :\n\n`
    //                 + '```tsx\n'
    //                 + `<${retrieved.icons[0].retrieved[0]} className="h-4 w-4" />`
    //                 + '\n```\n\n' + '---\n\n\n'
    //                 + `Here are some available icons that might be relevant to the component you are making. You can choose from them if relevant :\n\n`
    //                 + '```\n'
    //                 + retrieved.icons.map((e)=> {
    //                     // return `- role : ${e.icon}\n  available icons: ${e.retrieved.join(' , ')}` // it confuses the gpt
    //                     return `- ${e.retrieved.join(' , ')}`
    //                 }).join('\n')
    //                 + '\n```'
    //                 //'icon stuff >' + JSON.stringify(retrieved.icons)
    //       }
    //     : false
    // ],
  ].filter((e) => e) as ChatCompletionMessageParam[];
}
