import { ChatCompletionMessageParam } from 'openai/resources/chat/index.mjs';
import { ComponentDesign } from '../_interfaces/component-design';
import { get_encoding } from '@dqbd/tiktoken';
import { openai } from '../_services/openai.service';
import clientPromise from '@/lib/database';
import { GeneratedComponentModel } from '../_models/component';
import { GeneratedComponent } from '../_models/component';

const tiktokenEncoder = get_encoding('cl100k_base');

const FRAMEWORKS_EXTENSION_MAP = {
  react: `tsx`,
  next: `tsx`,
  svelte: `svelte`,
};

interface ComponentGenerationContextParams {
  componentDesign: ComponentDesign;
  context: ChatCompletionMessageParam[];
  generationId: string;
  lastGeneratedComponent: GeneratedComponent;
}

const getFirstContextEntry = (
  framework: string,
): ChatCompletionMessageParam => ({
  role: `system`,
  content:
    `You are an expert at writing ${framework} components.\n` +
    `Your task is to write a new ${framework} component for a web app, according to the provided task details.\n` +
    `The ${framework} component you write can make use of Tailwind classes for styling (in className).\n` +
    `If you judge it is relevant to do so, you can use library components and icons.\n\n` +
    `You will write the full ${framework} component code, which should include all imports.` +
    `Your generated code will be directly written to a .${
      FRAMEWORKS_EXTENSION_MAP[
        framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
      ] || 'tsx'
    } ${framework} component file and used in production.`,
});

export async function generateComponentIteration(
  params: ComponentGenerationContextParams,
) {
  console.log('Generating component...');
  await clientPromise;
  const context: ChatCompletionMessageParam[] = [
    getFirstContextEntry(params.lastGeneratedComponent.framework),
    ...params.context,
    {
      role: `user`,
      content:
        `- COMPONENT NAME : ${params.componentDesign.name}\n\n` +
        `- COMPONENT DESCRIPTION :\n` +
        '```\n' +
        params.componentDesign.description +
        '\n```\n\n' +
        `- CURRENT COMPONENT CODE :\n\n` +
        '```' +
        FRAMEWORKS_EXTENSION_MAP[
          params.lastGeneratedComponent
            .framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
        ] +
        '\n' +
        params.lastGeneratedComponent.code +
        '\n```\n\n' +
        `- DESIRED COMPONENT UPDATES :\n\n` +
        '```\n' +
        params.componentDesign.description.by_user +
        '\n```\n\n' +
        `- additional component update suggestions :\n` +
        '```\n' +
        params.componentDesign.description.by_llm +
        '\n```\n\n\n' +
        `Write the full code for the new, updated ${params.lastGeneratedComponent.framework} web component, which uses Tailwind classes if needed (add tailwind dark: classes too if you can; backgrounds in dark: classes should be black), and optionally, library components and icons, based on the provided design task.\n` +
        'The full code of the new ' +
        params.lastGeneratedComponent.framework +
        ' component that you write will be written directly to a .' +
        FRAMEWORKS_EXTENSION_MAP[
          params.lastGeneratedComponent
            .framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
        ] +
        ' file inside the ' +
        params.lastGeneratedComponent.framework +
        ' project. Make sure all necessary imports are done, and that your full code is enclosed with ```' +
        FRAMEWORKS_EXTENSION_MAP[
          params.lastGeneratedComponent
            .framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
        ] +
        ' blocks.\n' +
        'Answer with generated code only. DO NOT ADD ANY EXTRA TEXT DESCRIPTION OR COMMENTS BESIDES THE CODE. Your answer contains code only ! component code only !\n' +
        `Important :\n` +
        `- Make sure you import provided components libraries and icons that are provided to you if you use them !\n` +
        `- Tailwind classes should be written directly in the elements class tags (or className in case of React). DO NOT WRITE ANY CSS OUTSIDE OF CLASSES\n` +
        `- Do not use libraries or imports except what is provided in this task; otherwise it would crash the component because not installed. Do not import extra libraries besides what is provided above !\n` +
        `- Do not have ANY dynamic data! Components are meant to be working as is without supplying any variable to them when importing them ! Only write a component that render directly with placeholders as data, component not supplied with any dynamic data.\n` +
        `- Only write the code for the component; Do not write extra code to import it! The code will directly be stored in an individual ${
          params.lastGeneratedComponent.framework
        } .${
          FRAMEWORKS_EXTENSION_MAP[
            params.lastGeneratedComponent
              .framework as keyof typeof FRAMEWORKS_EXTENSION_MAP
          ]
        } file !\n` +
        `${
          params.lastGeneratedComponent.framework != 'svelte'
            ? '- Very important : Your component should be exported as default !\n'
            : ''
        }` +
        `Write the updated version of the ${params.lastGeneratedComponent.framework} component code as the creative genius and ${params.lastGeneratedComponent.framework} component genius you are - with good ui formatting.\n`,
    },
  ];

  const prompt = {
    model: process.env.OPENAI_MODEL!,
    messages: context,
  };

  console.log(
    `Context tokens around : ${
      tiktokenEncoder.encode(context.map((c) => c.content).join('')).length
    }`,
  );

  const context_prompt_tokens = tiktokenEncoder.encode(
    context.map((e) => e.content).join(''),
  ).length;
  console.log(
    `> total context prompt tokens (estimate) : ${context_prompt_tokens}`,
  );

  debugger;
  const response = await openai.chat.completions.create({
    ...prompt,
    stream: false,
  });

  let cleanCode = '';
  let start = false;
  const completion = response.choices?.[0].message?.content!;
  for (const l of completion.split('\n')) {
    let skip = false;
    if (l.trim() === '```' || l.trim() === 'tsx```' || l.trim() === '```tsx') {
      start = !start;
      skip = true;
    }
    if (start && !skip) cleanCode += `${l}\n`;
  }

  console.log(`Generated code : \n${cleanCode}`);

  cleanCode = cleanCode.trim();

  const generatedComponent = new GeneratedComponentModel({
    generationId: params.generationId,
    code: cleanCode,
    name: params.componentDesign.name,
    prompt: params.componentDesign.description.by_user,
    slug: params.componentDesign.name,
    framework: params.lastGeneratedComponent.framework,
    libraries: params.lastGeneratedComponent.libraries,
    version: Number(params.lastGeneratedComponent.version) + 1,
  });

  await generatedComponent.save();

  return {
    code: cleanCode,
    usage: response.usage,
  };
}
