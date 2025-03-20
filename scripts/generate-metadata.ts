import crypto from "crypto";
import fs from "fs";
import path from "path";

import type { DiffObjectV2 } from "../src/main/utils/game-install";

//bun run generate-metadata.ts /mnt/d/Test/TNMND_old /mnt/d/Test/TNMND_patch_vn_b_0.9.363.363_d_0.9.359.359_nested/.levelup-patch-content /mnt/d/Test/TNMND_patch_vn_b_0.9.366.366_d_0.9.363.363_nested/.levelup-patch-content /mnt/d/Test/TNMND_patch_vn_b_0.9.369.369_d_0.9.366.366_nested/.levelup-patch-content /mnt/d/Test/TNMND_patch_vn_b_0.9.372.372_d_0.9.369.369_nested/.levelup-patch-content /mnt/d/Test/TNMND_patch_vn_b_0.9.376.376_d_0.9.372.372_nested/.levelup-patch-content

const makeJsonFileName = (filePath: string, postfix: string = "") => {
  const fileName = path.basename(filePath);

  return postfix ? `${fileName}-${postfix}.json` : `${fileName}.json`;
};

const writeToJsonFile = (filePath: string, data: any) => {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json);
  console.log(`Wrote ${filePath}`);

  return json;
};

console.log("Hello World!");
console.log(process.argv);

const fullPackageAbsolutePath = process.argv[2];
const patchesAbsolutePaths = process.argv.slice(3);

console.log(fullPackageAbsolutePath);
console.log(patchesAbsolutePaths);
console.log(process.cwd());

type Path = string;
type Checksum = string;

const traverseFolder = (
  prefix: string,
  absoluteFolderPath: Path,
  result: Record<Path, Checksum> = {},
  logPrefix = "",
) => {
  const files = fs.readdirSync(absoluteFolderPath);
  files.forEach((file) => {
    const filePath = path.join(absoluteFolderPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      traverseFolder(prefix, filePath, result, logPrefix);
    } else {
      const absoluteFilePath = path.join(absoluteFolderPath, file);
      const relativeFilePath = absoluteFilePath.slice(prefix.length + 1);
      const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

      console.log(logPrefix, relativeFilePath, hash);
      result[relativeFilePath] = hash;
    }
  });
};

const begin = Date.now();
const fullPackageMap: Record<Path, Checksum> = {};
traverseFolder(fullPackageAbsolutePath, fullPackageAbsolutePath, fullPackageMap, "old");
const timeToTraverse = Date.now() - begin;
console.log(fullPackageMap);
console.log(`Traversed ${Object.keys(fullPackageMap).length} files in ${timeToTraverse}ms`);
writeToJsonFile(
  path.join(process.cwd(), makeJsonFileName(fullPackageAbsolutePath)),
  fullPackageMap,
);

const patchesMaps = patchesAbsolutePaths.map((patchAbsolutePath, index) => {
  const beginNewMap = Date.now();
  const newMap: Record<Path, Checksum> = {};

  traverseFolder(patchAbsolutePath, patchAbsolutePath, newMap, `new-${index}`);
  const timeToTraverseNewMap = Date.now() - beginNewMap;
  console.log(newMap);
  console.log(`Traversed ${Object.keys(newMap).length} files in ${timeToTraverseNewMap}ms`);

  writeToJsonFile(path.join(process.cwd(), makeJsonFileName(patchAbsolutePath)), newMap);

  return newMap;
});

const diffMap = (oldVer: Record<Path, Checksum>, newVer: Record<Path, Checksum>): DiffObjectV2 => {
  const added: Record<Path, Checksum> = {};
  const removed: Record<Path, Checksum> = {};

  for (const [filePath, newFileHash] of Object.entries(newVer)) {
    if (!oldVer[filePath]) {
      added[filePath] = newFileHash;
    }

    if (oldVer[filePath] !== newFileHash) {
      removed[filePath] = oldVer[filePath];
      added[filePath] = newFileHash;
    }
  }

  return {
    added,
    removed,
  };
};

let currentMap = fullPackageMap;
patchesMaps.forEach((patchMap, index) => {
  const diff = diffMap(currentMap, patchMap);
  writeToJsonFile(path.join(process.cwd(), `metadata-${index}.json`), diff);

  currentMap = {
    ...currentMap,
    ...patchMap,
  };
});
