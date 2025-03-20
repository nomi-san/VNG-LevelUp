import path from "path";

import uploadFile from "./utils-code-sign.js";

export default async function afterSign(context) {
  const {
    appOutDir,
    packager: { appInfo },
  } = context;

  const destFileDir = path.join(appOutDir, `${appInfo.productFilename}.exe`);

  const outputPath = path.join(appOutDir, `${appInfo.productFilename}-signed.exe`);
  await uploadFile(destFileDir, outputPath);
}
