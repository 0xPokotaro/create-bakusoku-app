#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import prompts from "prompts";
import { cyan, green, yellow, red } from "kolorist";
import { copyDir } from "./utils/fs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async function main() {
  const argName = process.argv[2];
  const { name, pm, preset } = await prompts([
    { type: argName ? null : "text", name: "name", message: "Project name?", initial: "my-app" },
    { type: "select", name: "pm", message: "Package manager?", initial: 0,
      choices: [
        { title: "npm", value: "npm" }, 
        { title: "pnpm", value: "pnpm" }, 
        { title: "yarn", value: "yarn" },
        { title: "bun", value: "bun" },
        { title: "deno", value: "deno" }
      ] },
    { type: "select", name: "preset", message: "Template preset?", initial: 0,
      choices: [{ title: "default (Next+Hono+Turbo)", value: "templates" }] }
  ], { onCancel: () => process.exit(1) });

  const projectName = argName || name;
  const targetDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.log(red(`Directory '${projectName}' is not empty.`)); process.exit(1);
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // テンプレ展開
  const templateRoot = path.join(__dirname, preset, "root");
  copyDir(templateRoot, targetDir);

  // 依存インストール
  console.log(yellow(`\nInstalling dependencies via ${pm}...`));
  if (pm === "deno") {
    // Denoの場合はdeno installを実行
    await execa("deno", ["install"], { cwd: targetDir, stdio: "inherit" }).catch(() => {});
  } else if (pm === "bun") {
    // Bunの場合はbun installを実行
    await execa("bun", ["install"], { cwd: targetDir, stdio: "inherit" }).catch(() => {});
  } else {
    // npm, yarn, pnpmの場合は従来通り
    await execa(pm, ["install"], { cwd: targetDir, stdio: "inherit" }).catch(() => {});
  }

  // Git 初期化（失敗は無視）
  try {
    await execa("git", ["init"], { cwd: targetDir });
    await execa("git", ["add", "."], { cwd: targetDir });
    await execa("git", ["commit", "-m", "chore: scaffold with create-balusoku-app"], { cwd: targetDir });
  } catch {}

  console.log(green("\n✅ Done!"));
  console.log(`${cyan("Next steps:")}
  cd ${projectName}
  ${pm === "deno" ? "deno task dev" : pm === "bun" ? "bun dev" : `${pm} dev`}
`);
})();
