import { walk } from "https://deno.land/std@0.202.0/fs/mod.ts";
import micromatch from "npm:micromatch";

export interface FileSystemTree {
  [name: string]: DirectoryNode | FileNode;
}

export interface DirectoryNode {
  directory: FileSystemTree;
}

export interface FileNode {
  file: {
    contents: string | Uint8Array;
  };
}

async function createTreeRecursive(
  dirPath: string | URL,
  ignorePatterns: string[] = []
): Promise<FileSystemTree> {
  const tree: FileSystemTree = {};
  const baseDirPath = await Deno.realPath(dirPath);

  for await (const entry of walk(dirPath)) {
    const relativePath = entry.path.substring(baseDirPath.length + 1);
    const sanitizedPath = relativePath.replace(/\\/g, "/");

    // Skip the base directory itself to prevent looping
    if (sanitizedPath === "") {
      continue;
    }

    const stats = await Deno.lstat(entry.path);

    if (stats.isDirectory) {
      continue; // Skip directories
    }

    // Check if the entry matches any ignore patterns
    if (micromatch.isMatch(sanitizedPath, ignorePatterns)) {
      continue; // Skip this entry if it matches an ignore pattern
    }

    const parts = sanitizedPath.split("/");
    let currentNode = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!currentNode[part]) {
        currentNode[part] = i === parts.length - 1 ?
          {
            file: {
              contents: await Deno.readTextFile(entry.path),
            },
          } :
          {
            directory: {},
          };
      }

      currentNode = (currentNode[part] as DirectoryNode).directory || {};
    }
  }

  return tree;
}

export function createFileSystemTreeAsync(
  dirPath: string | URL,
  ignorePatterns: string[] = []
): Promise<FileSystemTree> {
  return createTreeRecursive(dirPath, ignorePatterns);
}
  
const writeFile = async (path: string, contents: string) => {
  await Deno.writeTextFile(path, contents);
}

// Example usage:
const pathToScan = await Deno.realPath(Deno.cwd()); // Replace with your desired path
const ignorePatterns = ['node_modules', 'build']; // Add patterns to ignore here
const fileSystemTree = await createFileSystemTreeAsync(pathToScan, ignorePatterns);
await writeFile(`${Deno.cwd()}/fileSystemTree.json`, JSON.stringify(fileSystemTree, null, 2));
