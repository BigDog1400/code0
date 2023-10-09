import { ChatCompletionMessageParam } from 'openai/resources/chat/index.mjs';
import { ComponentDesign } from '../_interfaces/component-design';
import { get_encoding } from '@dqbd/tiktoken';
import { openai } from '../_services/openai.service';
import clientPromise from '@/lib/database';
import { GeneratedComponentModel } from '../_models/component';
import { generateComponentPreview } from '../_services/images.service';

const tiktokenEncoder = get_encoding('cl100k_base');

interface ComponentGenerationContextParams {
  componentDesign: ComponentDesign;
  context: ChatCompletionMessageParam[];
  generationId: string;
  framework: string;
  libraries: string[];
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
    `Your generated code will be directly written to a .tsx ${framework} component file and used in production.`,
});

export async function generateComponent(
  params: ComponentGenerationContextParams,
) {
  console.log('Generating component...');
  await clientPromise;
  const context: ChatCompletionMessageParam[] = [
    getFirstContextEntry(params.framework),
    ...params.context,
    {
      role: `user`,
      content:
        `- COMPONENT NAME : ${params.componentDesign.name}\n\n` +
        `- COMPONENT DESCRIPTION :\n` +
        '```\n' +
        params.componentDesign.description.by_user +
        '\n```\n\n' +
        `- additional component suggestions :\n` +
        '```\n' +
        params.componentDesign.description.by_llm +
        '\n```\n\n\n' +
        `Write the full code for the new ${params.framework} web component, which uses Tailwind classes in className if needed (add tailwind dark: classes too if you can), and optionally, library components and icons, based on the provided design task.\n` +
        'The full code of the new ${params.framework} component that you write will be written directly to a .tsx file inside the ${params.framework} project. Make sure all necessary imports are done, and that your full code is enclosed with tsx``` blocks. Answer with generated code only, DO NOT ADD ANY EXTRA TEXT DESCRIPTION OR COMMENTS BESIDES THE CODE. YOUR ANSWER CONTAINS CODE ONLY ! COMPONENT CODE ONLY !\n' +
        `Important :\n` +
        `- DO NOT USE LIBRARIES OR IMPORTS OUTSIDE OF WHAT IS PROVIDED IN THIS TASK; otherwise it would crash the component because not installed. DO NOT IMPORT EXTRA LIBRARIES BESIDES WHAT IS PROVIDED ABOVE!\n` +
        `- DO NOT HAVE ANY DYNAMIC DATA! Components are meant to be working as is without supplying any variable to them when importing them ! ONLY WRITE A COMPONENT THAT RENDER DIRECTLY WITH PLACEHOLDERS AS DATA, COMPONENT NOT SUPPLIED WITH ANY DYNAMIC DATA.\n` +
        `- Only write the code for the component; Do not write extra code to import it! The code will directly be stored in an individual ${params.framework} .tsx file !\n` +
        `Write the ${params.framework} component code as the creative genius and ${params.framework} component genius you are - with good ui formatting.\n`,
    },
  ];

  const prompt = {
    model: process.env.OPENAI_MODEL!,
    messages: context,
    /*functions: [
        {
          name: `generate_new_react_component_to_send_to_api`,
          description: `Write the full code for a new React component, which uses Tailwind classes in className, and optionally, library components and icons, based on the provided design task`,
          parameters : (new Schema( generate_component_schema , {_id:false})).jsonSchema() ,
        }
    ],*/
  };

  console.log(
    `Context tokens around : ${
      tiktokenEncoder.encode(context.map((c) => c.content).join('')).length
    }`,
  );

  const response = await openai.chat.completions.create({
    ...prompt,
    stream: false,
  });

  //   let generated_code = ``
  //   let start = false
  //   for (let l of completion.split('\n') ) {
  //     let skip = false
  //     if ( l.trim() === '```' || l.trim() === 'tsx```' || l.trim() === '```tsx' ) {
  //       start = !start
  //       skip = true
  //     }
  //     if (start && !skip) generated_code += `${l}\n`
  //   }
  //   generated_code = generated_code.trim()

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
  console.log('To save: ', params.libraries);

  const generatedComponent = new GeneratedComponentModel({
    generationId: params.generationId,
    code: cleanCode,
    name: params.componentDesign.name,
    prompt: params.componentDesign.description.by_user,
    slug: params.componentDesign.name,
    framework: params.framework,
    libraries: params.libraries,
    version: params.componentDesign.version || 1,
    preview: '',
  });

  await generatedComponent.save();

  generateComponentPreview(params.generationId);

  return {
    code: cleanCode,
    usage: response.usage,
  };
}
