import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";

dotenv.config();

const accessToken = process.env.CODESIGN_API_TOKEN;
const url = process.env.CODESIGN_API_URL;

const replaceFile = (originalPath, replacementPath) => {
  fs.rmSync(originalPath);
  fs.renameSync(replacementPath, originalPath);
};

export default async function uploadFile(filePath, outputPath) {
  if (!accessToken || !url) return;

  const formData = new FormData();
  formData.append("accessToken", accessToken);
  formData.append("artifact", fs.createReadStream(filePath));
  const fileName = path.basename(filePath);

  console.log(`  • code signing ${fileName} with token ${accessToken.substring(0, 5)} on ${url}`);
  await axios
    .post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: "arraybuffer", // Ensure response is treated as binary
    })
    .then((response) => {
      // Save the response data to a file
      fs.writeFileSync(outputPath, response.data);
      console.log("  • code signed finished");
    })
    .catch((error) => {
      console.error(
        "Error: while signing code for ",
        filePath,
        error.response ? error.response.data : error.message,
      );
    });

  replaceFile(filePath, outputPath);
}
