import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

const reqOrch = "apps/orchestrator/requirements.txt";
const reqAts = "apps/ats-mock/requirements.txt";
const venvDir = "apps/orchestrator/.venv";
const venvBin = process.platform === "win32" ? `${venvDir}/Scripts` : `${venvDir}/bin`;

function sha(path) {
  return crypto.createHash("sha256").update(readFileSync(path)).digest("hex");
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit", shell: true });
}

if (!existsSync(venvDir)) {
  run(`python -m venv ${venvDir}`);
}

const key = sha(reqOrch) + ":" + sha(reqAts);
const tag = `${venvDir}/.install-key`;
let prev = existsSync(tag) ? readFileSync(tag, "utf8") : "";

if (prev !== key) {
  run(`${venvBin}/python -m pip install -U pip`);
  run(`${venvBin}/python -m pip install -r ${reqOrch}`);
  run(`${venvBin}/python -m pip install -r ${reqAts}`);
  run(`node -e "require('fs').writeFileSync('${tag}','${key}')"`);
} else {
  console.log("[skip] Python deps up-to-date for orchestrator/ats");
}


