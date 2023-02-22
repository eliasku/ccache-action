import * as core from "@actions/core";
import * as io from "@actions/io";
import * as exec from "@actions/exec";
import * as process from "process";
import * as cache from "@actions/cache";
import {ccache} from "./common";

// based on https://cristianadam.eu/20200113/speeding-up-c-plus-plus-github-actions-using-ccache/

async function install() {
  const platform = process.platform;
  if (platform === "darwin") {
    await exec.exec("brew install ccache");
  } else if (process.platform === "linux") {
    await exec.exec("sudo apt-get install -y ccache");
  } else if(platform === "win32") {
    await exec.exec(`msys2 -c "'pacman' '--noconfirm' '-S' 'ccache'"`);
  } else {
    core.info("unknown platform: " + platform);
  }
}

async function restore() {
  let restoreKey = `ccache-`;

  let inputKey = core.getInput("key");
  if (inputKey) {
    restoreKey += `${inputKey}-`;
  }

  const restoreKeys = [
    restoreKey
  ]
  
  const key = restoreKey + new Date().toISOString();

  const paths = [
    '.ccache'
  ]  

  const restoredWith = await cache.restoreCache(paths, key, restoreKeys)
  if (restoredWith) {
    core.info(`Restored from cache key "${restoredWith}".`);
  } else {
    core.info("No cache found.");
  }
}

async function configure() {
  const ghWorkSpace = process.env.GITHUB_WORKSPACE;
  const maxSize = core.getInput('max-size');
  
  core.info("Configure ccache");
  await ccache("--set-config=cache_dir=" + ghWorkSpace + "/.ccache");
  await ccache("--set-config=max_size=" + maxSize);
  await ccache("--set-config=compression=true");

  core.info("Ccache config:")
  await ccache("-p");
}

async function run() : Promise<void> {
  try {
    let ccachePath = await io.which("ccache");
    if (!ccachePath) {
      core.info(`Install ccache`);
      await install();
      if(process.platform !== "win32") {
        ccachePath = await io.which("ccache", true);
      }
    }

    await restore();
    await configure();

    await ccache("-z");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default run;
