"use client";
import React from "react";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";


// /** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance: WebContainer;

async function installDependencies() {
  // Install dependencies
  const installProcess = await webcontainerInstance!.spawn("npm", ["install"]);

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
  await webcontainerInstance!.spawn("npm", ["run", "start"]);

  // Wait for `server-ready` event
  webcontainerInstance!.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });
}

window.addEventListener("load", async () => {
  // Call only once
  webcontainerInstance = await WebContainer.boot();

  await webcontainerInstance.mount(files);

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