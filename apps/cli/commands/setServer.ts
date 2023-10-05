
export const setCode0ServerCommand = async (options: { force?: boolean } , args: [string, (string | undefined)?]) => {
    const kv = await Deno.openKv();
    const server = args[0];
    if (!server) {
        console.log("Please provide a server");
        return;
    }
    const currentServer = await kv.get<string>(["Code0_server"]);
    if (currentServer.value && !options.force) {  
        console.log(`A server is already set to ${currentServer.value} use --force to override`);
        return; 
    }
    await kv.set(["Code0_server"], server);
    console.log(`Server set to ${server}`);
}