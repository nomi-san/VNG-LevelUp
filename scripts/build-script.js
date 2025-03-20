import { exec } from "child_process";
import { createHash } from "crypto";
import { copyFile, createReadStream, readFileSync, rename, statSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { dirname, join, parse } from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";
const __dirname = dirname(fileURLToPath(import.meta.url));
const hashFile = (file) => {
    return new Promise((resolve, reject) => {
        const hash = createHash("sha512");
        hash.on("error", reject).setEncoding("base64");
        createReadStream(file, {
            highWaterMark: 1024 * 1024,
        })
            .on("error", reject)
            .on("end", () => {
            hash.end();
            const result = hash.read();
            console.log("Hash", result);
            resolve(result);
        })
            .pipe(hash, {
            end: false,
        });
        const stats = statSync(file);
        console.log("File size: ", stats.size);
    });
};
const updateLatestYaml = async (latestYamlPath, targetPath, newHash) => {
    const latestYaml = await readFile(latestYamlPath, {
        encoding: "utf-8",
    });
    const latestDto = YAML.parse(latestYaml);
    const parsedPath = parse(targetPath);
    const targetFileName = parsedPath.name + parsedPath.ext;
    const targetFileSize = statSync(targetPath).size;
    if (latestDto.path.includes(targetFileName)) {
        latestDto.sha512 = newHash;
    }
    for (const file of latestDto.files) {
        if (file.url.includes(targetFileName)) {
            file.sha512 = newHash;
            file.size = targetFileSize;
        }
    }
    await writeFile(latestYamlPath, YAML.stringify(latestDto));
};
// Function to copy content from the source file to the destination file
function copyFileContent(source, dest) {
    return new Promise((resolve, reject) => {
        copyFile(source, dest, (err) => {
            if (err) {
                reject(`Error copying file: ${err}`);
            }
            else {
                console.log(`Copied content from ${source} to ${dest}`);
                resolve();
            }
        });
    });
}
function renameFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        rename(oldPath, newPath, (err) => {
            if (err) {
                reject(`Error renaming file: ${err}`);
            }
            else {
                console.log(`Renamed file from ${oldPath} to ${newPath}`);
                resolve();
            }
        });
    });
}
function runBuildCommand() {
    return new Promise((resolve, reject) => {
        var _a, _b;
        const childProcess = exec("npm run build:win", (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }
            resolve();
        });
        // Output stdout (standard output) in real-time
        (_a = childProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (data) => {
            process.stdout.write(data.toString()); // Print stdout logs in real-time
        });
        // Output stderr (standard error) in real-time
        (_b = childProcess.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (data) => {
            console.error(data.toString()); // Print stderr logs in real-time
        });
    });
}
//const installers = ["base"];
const installers = ["ghoststory", "kto", "mlb", "base"];
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;
const appName = packageJson.productName;
for (const installer of installers) {
    const installerPath = join(__dirname, "../installers", `${installer}.nsh`);
    const buildPath = join(__dirname, "../build/installer.nsh");
    await copyFileContent(installerPath, buildPath);
    try {
        await runBuildCommand();
    }
    catch (error) {
        console.log(error);
    }
    const outputPath = join(__dirname, "../dist", `${appName}-${version}.exe`);
    const installerOutputPath = installer === "base"
        ? join(__dirname, "../dist", `${appName}.exe`)
        : join(__dirname, "../dist", `${appName}-${installer}.exe`);
    await renameFile(outputPath, installerOutputPath);
    if (installer === "base") {
        const baseAppPath = join(__dirname, "../dist", `${appName}-${version}.exe`);
        await copyFileContent(installerOutputPath, baseAppPath);
        const hashResult = await hashFile(baseAppPath);
        await updateLatestYaml(join(__dirname, "../dist/latest.yml"), baseAppPath, hashResult);
    }
}
