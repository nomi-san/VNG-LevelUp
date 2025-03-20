import path from "path";

import uploadFile from "./utils-code-sign.js";

export default async function artifactBuildCompleted(context) {
  const {
    file,
    target: { outDir },
  } = context;
  // Current API only support signing exe files
  // We don't upload blockmap to cdn at the moment so it shouldn't matter much
  if (file.endsWith(".blockmap")) return;

  const ext = path.extname(file);
  const fileNameWithoutExt = path.basename(file, ext);
  const outputPath = path.join(outDir, `${fileNameWithoutExt}-signed${ext}`);

  uploadFile(file, outputPath);
}
