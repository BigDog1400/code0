"use client";
import React from "react";
import { WebContainer } from "@webcontainer/api";
import templates from "../_templates";
import axios from "axios";


// /** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance: WebContainer;

async function installDependencies() {
  // Install dependencies
  const installProcess = await webcontainerInstance!.spawn("pnpm", ["install"]);

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    }),
  );

  // Wait for install command to exit
  return installProcess.exit;
}

async function startDevServer() {
  const iframeEl = document.querySelector("iframe")!;
  // Run `npm run start` to start the Express app
  await webcontainerInstance!.spawn("pnpm", ["run", "dev"]);

  // Wait for `server-ready` event
  webcontainerInstance!.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });
}

window.addEventListener("load", async () => {
  // Call only once
  webcontainerInstance = await WebContainer.boot();

  // This is for testing we will have  to add the webconainnter to a global state somehow and update urls utomatically

  const { data } = await axios.get(
    "/api/components/HelloWorldButton_i9n25"
  )

  const componentMetadata = {
    ...data,
    extension: 'tsx'
  }
  // Mount
  await webcontainerInstance.mount(templates.react[0].template);

  // Write component code

  await webcontainerInstance.fs.writeFile(
    `/src/components/generated/${componentMetadata.componentId}_${componentMetadata.version}.${componentMetadata.extension}`,
    componentMetadata.code
  )
  await webcontainerInstance.fs.writeFile(
    `/src/components/generated/import.meta.ts`,
    `export default ${JSON.stringify(componentMetadata)}`
  )

  const exitCode = await installDependencies();
  if (exitCode !== 0) {
    throw new Error("Installation failed");
  }

  startDevServer();
});

export function WebContainerClient() {
  return (
    <div className="preview">
      <iframe src="/loading"></iframe>
    </div>
  );
}