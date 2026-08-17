import { dirname } from "path";

export const SOCKET_FILE_NAME = ".pm.sock";

// Unix domain socket paths must fit into sockaddr_un.sun_path, which is 108 bytes on Linux and 104 bytes on macOS.
// Opening a longer path fails with EINVAL (or ENOENT, if the path gets truncated), which happens in deeply nested
// projects. Only the path passed to bind()/connect() counts, so we always change into the directory containing the
// config file and refer to the socket by its plain file name.
export function chdirToProjectRoot(configSource: string): void {
    process.chdir(dirname(configSource));
}
