import {
  Command,
  HelpCommand,
  CompletionsCommand,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import meta from "./package.json" assert {
  type: "json",
};
import { downloadCommand } from "./commands/global.ts";
import { setCode0ServerCommand } from "./commands/setServer.ts";
import { getComponentCommand } from "./commands/getComponent.ts";

await new Command()
  .name(meta.name)
  .version(meta.version)
  .description(`${meta.description}`)
  .default("help")
  .command("help", new HelpCommand().global())
  .command("completions", new CompletionsCommand())
  .command(
    "setup",
    new Command()
      .name("setup")
      .description("Set Code0 server")
      .alias("set")
      .alias("s")
      .usage("<server> Code0 server")
      .option("-f, --force", "Override existing server")
      .arguments("<server> [output:string]")
      .action((options, ...args) => {
        setCode0ServerCommand(options, args);
      })
  )
  .command(
    "install",
    new Command()
      .name("install")
      .alias("i")
      .description("Install Code0 server")
      .arguments("[destination] [output:string]")
      .action(async (_, args) => {
        await downloadCommand(args);
      })
  )
  .command(
    "add",
    new Command()
      .name("add")
      .description("Add a component to the components (or destination) folder")
.usage("(<id>, [version]) \nIf no version is provided, the latest version will be used")
      .example("Add a component","Code0 add my-component")
      .arguments(
        "<component_id...>"
      )
      .alias("a")
      .alias("get")
      .action(async (_, ...args) => {
        await getComponentCommand(args as [string, (string | undefined)?]);
      })
  )
  .parse(Deno.args);
