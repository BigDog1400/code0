import { openai } from '../_services/openai.service';
import { ChatCompletionMessageParam } from 'openai/resources/chat/index.mjs';
import clientPromise from '@/lib/database';
import { GenericLibraryModel } from '../_models/library';
import { getGeneratedComponentByGenerationId } from '../_services/generated-component.service';
import { ComponentDesignModel } from '../_models/component-design';
import { GeneratedComponent } from '../_models/component';
// Add interface for function parameters
interface DesignComponentFromPromptParams {
  description: string;
  generationId: string;
  lastGeneratedComponent: GeneratedComponent;
}

const getComponentIterationSchema = async (
  framework: string,
  libraries: string[],
) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
      description: `Write a description for the ${framework} component update design task based on the user query. Stick strictly to what the user wants in their request - do not go off track`,
    },
    // icons: {
    //   type: 'object',
    //   properties: {
    //     needed: {
    //       type: 'boolean',
    //     },
    //     list: {
    //       type: 'array',
    //       items: {
    //         type: 'string',
    //       },
    //     },
    //   },
    //   required: ['needed', 'list'],
    // },
    // I tried with short names for the properties, but it doesn't work (as point above)
    // the LLM doesn't generate the appropriate response, let's go with the long names for now
    does_new_component_need_icons_elements: {
      type: 'object',
      properties: {
        needed: {
          type: 'boolean',
        },
        if_so_what_new_component_icons_elements_are_needed: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['needed', 'list'],
    },
    libraries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            enum: (
              await GenericLibraryModel.find({
                framework: framework,
                library: {
                  $in: libraries,
                },
              })
            )
              .flatMap((e) => e.specs)
              .map((e) => e.name),
          },
          reason: {
            type: 'string',
          },
        },
        required: ['name', 'reason'],
      },
    },
  },
  required: ['name', 'description'],
});

const getContext = async (
  framework: string,
  libraries: string[],
): Promise<ChatCompletionMessageParam[]> => [
  {
    role: 'system',
    content:
      `Your task is to modify a ${framework} component for a web app, according to the user's request.\n` +
      `If you judge it is relevant to do so, you can specify pre-made library components to use in the component update.\n` +
      `You can also specify the use of icons if you see that the user's request requires it.`,
  },
  {
    role: `user`,
    content:
      'Multiple library components can be used while creating a new component in order to help you do a better design job, faster.\n\nAVAILABLE LIBRARY COMPONENTS:\n```\n' +
      (
        await GenericLibraryModel.find({
          framework: framework,
          library: {
            $in: libraries,
          },
        })
      )
        .flatMap((e) => {
          return e.specs;
        })
        .map((e) => {
          return `${e.name} : ${e.description.slice(0, -1)};`;
        })
        .join('\n') +
      '\n```',
  },
];

export async function designComponentIterationFromPrompt({
  generationId,
  description,
  lastGeneratedComponent,
}: DesignComponentFromPromptParams) {
  await clientPromise;

  console.log('lastGeneratedComponent', lastGeneratedComponent);

  debugger;
  //   TODO: Add try catch block to validate the lastGeneratedComponent is not null
  const context = await getContext(
    lastGeneratedComponent?.framework!,
    lastGeneratedComponent?.libraries!,
  );

  context.push({
    role: `user`,
    content:
      `- Component name : ${lastGeneratedComponent?.name}\n` +
      '- Component description : `' +
      lastGeneratedComponent?.prompt +
      '`\n' +
      '- New component updates query : \n```\n' +
      description +
      '\n```\n\n' +
      `Design the 
        ${lastGeneratedComponent?.framework!} web component updates for the user, as the creative genius you are`,
  });

  const gptPrompt = {
    model: process.env.OPENAI_MODEL!,
    messages: context,
    functions: [
      {
        name: `design_new_component_api`,
        description: `generate the required design details to updated the provided component`,
        parameters: await getComponentIterationSchema(
          lastGeneratedComponent!.framework,
          lastGeneratedComponent!.libraries,
        ),
      },
    ],
  };

  console.log(`Generating update instructions for user query: ${description}`);
  console.log(`Current prompt: ${JSON.stringify(gptPrompt, null, 2)}`);

  const response = await openai.chat.completions.create({
    ...gptPrompt,
    stream: false,
  });

  const component_design: {
    name: string;
    description: string;
    does_new_component_need_icons_elements: {
      needed: boolean;
      if_so_what_new_component_icons_elements_are_needed: string[];
    };
    libraries: {
      name: string;
      reason: string;
    }[];
  } = {
    ...JSON.parse(
      response?.choices?.[0].message?.function_call?.arguments ?? '{}',
    ),
  };

  const componentDesignResult = {
    name: component_design.name,
    description: {
      by_user: description,
      by_llm: component_design.description,
    },
    icons: component_design.does_new_component_need_icons_elements?.needed
      ? component_design.does_new_component_need_icons_elements
          .if_so_what_new_component_icons_elements_are_needed
      : [],
    libraries:
      component_design.libraries?.map(({ name, reason }) => ({
        name,
        reason,
      })) || [],
    generation_id: generationId,
    version: Number(lastGeneratedComponent?.version!) + 1,
  };

  const componentDesignInstance = new ComponentDesignModel(
    componentDesignResult,
  );

  await componentDesignInstance.save();

  return componentDesignResult;
}
