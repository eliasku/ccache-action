import * as exec from "@actions/exec";

export function msys2(cmd:string, args:string[]):Promise<number> {
    return exec.exec(cmd, ["-c", args.map((s)=>`"${s}"`).join(" ")]);
}

export function ccache(...args:string[]):Promise<number> {
    const platform = process.platform;
    if(platform === "win32") {
        return msys2("ccache", args);
    }
    return exec.exec("ccache", args);
}
