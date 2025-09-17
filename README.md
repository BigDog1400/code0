# code0 - AI-Powered Frontend Development

## Project Overview

`code0` is a forward-thinking prototype developed two years ago to explore the intersection of artificial intelligence and frontend development. The project's primary goal was to leverage the power of large language models (LLMs) to automate the creation of frontend components, thereby accelerating the development process and enabling developers to focus on higher-level architectural concerns.

This project was conceived as a learning experiment to push the boundaries of what was possible with AI in code generation at the time. It demonstrates a sophisticated understanding of AI integration, web development, and modern development workflows.

## Project Status

**Status:** Inactive / Proof of Concept

This project is a prototype and is no longer under active development. It was a successful experiment that achieved its initial goals, but it is not a production-ready application. The code is being shared to showcase the concepts and the technical implementation.

## How it Works

The `code0` ecosystem is comprised of a web-based interface for generating components and a command-line interface (CLI) for integrating them into your projects. The core of the project is a sophisticated pipeline that uses AI to generate, test, and distribute frontend components.

Here is a breakdown of the workflow:

1.  **Prompt-Based Component Generation**: A developer provides a natural language prompt to the `code0` web interface, describing the desired component (e.g., "a login form with email and password fields"). The UI for this is in [`apps/code0/app/_components/promp-input-form.tsx`](apps/code0/app/_components/promp-input-form.tsx).

2.  **AI-Powered Code Generation**: The backend, powered by a Next.js application, sends a request to the OpenAI API with a carefully crafted prompt. The AI then generates the code for the component (e.g., a React component using a specified UI library like shadcn/ui). The core logic for this is in [`apps/code0/app/_services/openai.service.ts`](apps/code0/app/_services/openai.service.ts) and the surrounding tasks in [`apps/code0/app/_tasks/`](apps/code0/app/_tasks/).

3.  **In-Browser Sandbox Execution**: The generated code is then loaded into a secure, sandboxed browser environment using the WebContainer API. This allows for the safe execution and rendering of the component without affecting the host system. The implementation can be found in [`apps/code0/app/_components/webcontainerClient.tsx`](apps/code0/app/_components/webcontainerClient.tsx).

4.  **Component Preview and Iteration**: The rendered component is displayed in the web interface, and a screenshot is taken using `html2canvas`. This gives the developer a visual confirmation of the generated component. The developer can then iterate on the component by modifying the prompt and regenerating the code.

5.  **Decentralized Storage**: Once a component is finalized, it is stored on the InterPlanetary File System (IPFS) via the `web3.storage` service. This ensures that the components are stored in a decentralized and resilient manner. The service for this is in [`apps/code0/app/_services/ipfs.service.ts`](apps/code0/app/_services/ipfs.service.ts).

6.  **Component Registry**: The metadata for each component, including its name, version, and IPFS hash, is stored in a MongoDB database. The Mongoose models for this are defined in [`apps/code0/app/_models/`](apps/code0/app/_models/).

7.  **CLI for Integration**: The `code0` CLI (a Deno application) allows developers to easily fetch and install the generated components into their local projects. The CLI interacts with the `code0` server to find the component in the registry and downloads it from IPFS. The main CLI code is in [`apps/cli/mod.ts`](apps/cli/mod.ts).

## Technologies Used

This project integrates a wide range of modern technologies to achieve its goals:

-   **AI & Machine Learning**:
    -   **OpenAI API**: For generating the component code from natural language prompts. See [`apps/code0/app/_services/openai.service.ts`](apps/code0/app/_services/openai.service.ts).
    -   **@dqbd/tiktoken**: For tokenizing text to be used with the OpenAI API.

-   **Frontend**:
    -   **Next.js**: The primary framework for the web application. See the app structure in [`apps/code0/app/`](apps/code0/app/).
    -   **React**: For building the user interface.
    -   **WebContainer API**: For creating a secure, in-browser Node.js environment. See [`apps/code0/app/_components/webcontainerClient.tsx`](apps/code0/app/_components/webcontainerClient.tsx).
    -   **html2canvas**: For capturing screenshots of the generated components.
    -   **shadcn/ui & lucide-react**: The component library used for the generated components.

-   **Backend**:
    -   **Node.js**: The runtime for the Next.js application.
    -   **MongoDB**: The database for storing component metadata.
    -   **Mongoose**: The ODM for interacting with MongoDB. See the models in [`apps/code0/app/_models/`](apps/code0/app/_models/).

-   **Decentralized Storage**:
    -   **IPFS**: The distributed file system for storing the generated components.
    -   **web3.storage**: A service that simplifies storing data on IPFS. See [`apps/code0/app/_services/ipfs.service.ts`](apps/code0/app/_services/ipfs.service.ts).

-   **Tooling**:
    -   **Deno**: The runtime for the CLI. See the CLI implementation in [`apps/cli/`](apps/cli/).
    -   **Turborepo**: For managing the monorepo.
    -   **pnpm**: For package management.

## How to Run

To run the `code0` application locally, you will need to have Node.js, pnpm, and Deno installed.

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run the development server**:
    ```bash
    pnpm dev
    ```
    This will start the Next.js application on `http://localhost:3000`.

3.  **Set up the CLI**:
    Follow the instructions in the `apps/cli/README.md` to install and configure the CLI. You will need to set the server to your local instance:
    ```bash
    code0 set "http://localhost:3000"
    ```

This `README.md` should be a great way to show off your skills to a recruiter. It's detailed, highlights the innovative aspects of the project, and uses professional language.
