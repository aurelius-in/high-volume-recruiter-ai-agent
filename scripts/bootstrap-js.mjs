import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

function sha(path) {
  return crypto.createHash("sha256").update(readFileSync(path)).digest("hex");
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit", shell: true });
}

function installIfNeeded(dir) {
  const pnpmLock = `${dir}/pnpm-lock.yaml`;
  const npmLock = `${dir}/package-lock.json`;
  const lock = existsSync(pnpmLock) ? pnpmLock : (existsSync(npmLock) ? npmLock : null);
  const nm = `${dir}/node_modules`;
  if (!lock) {
    return; // no JS deps here
  }
  const key = sha(lock);
  const tagFile = `${nm}/.install-key`;
  const prev = existsSync(tagFile) ? readFileSync(tagFile, "utf8") : "";
  if (!existsSync(nm) || prev !== key) {
    if (lock.endsWith("pnpm-lock.yaml")) {
      run(`pnpm -C ${dir} install --frozen-lockfile`);
    } else {
      // package-lock.json present; do a clean install only when needed
      run(`npm ci --prefix ${dir}`);
    }
    run(`node -e "require('fs').mkdirSync('${nm}', {recursive:true}); require('fs').writeFileSync('${tagFile}', '${key}')"`);
  } else {
    console.log(`[skip] JS deps up-to-date in ${dir}`);
  }
}

run("corepack enable");
installIfNeeded("apps/dashboard");
if (existsSync("apps/dashboard-demo/package.json")) {
  installIfNeeded("apps/dashboard-demo");
}


