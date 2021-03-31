import * as core from "@actions/core";
import * as cache from "@actions/cache";
import {ccache} from "./common";

async function run() : Promise<void> {
  try{
    core.info("Ccache stats:")
    await ccache("-s");

    let restoreKey = `ccache-`;
    let inputKey = core.getInput("key");

    if (inputKey) {
      restoreKey += `${inputKey}-`;
    }

    const key = restoreKey + new Date().toISOString();
    const paths = [
      '.ccache'
    ]
  
    core.info(`Save cache using key "${key}".`)
    await cache.saveCache(paths, key);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default run;
