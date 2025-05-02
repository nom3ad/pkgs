#!/usr/bin/env python
import atexit
from collections import defaultdict
from contextlib import contextmanager
import errno
import os
import sys
import subprocess
import argparse
import tempfile
import logging
import threading
import time
import threading
import pathlib
import stat
import shutil
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)


from fuse import FUSE, FuseOSError, Operations, fuse_get_context, fuse_exit

def ensure_imports(modules):
    missing = []
    for m in modules.keys():
        try:
            globals()[m] = __import__(m)
        except ImportError:
            missing.append(m)

    if missing:
        import site, sys, logging
        from subprocess import check_call, DEVNULL

        cmd = [sys.executable, "-m", "pip", "install", "--user", *(modules[m] for m in missing)]
        logging.warning(f"Missing modules: {missing}. Try {cmd}")
        check_call(cmd, stdin=DEVNULL, stdout=sys.stderr, stderr=sys.stderr)
        site.main()
        for m in missing:
            globals()[m] = __import__(m)


ensure_imports({"fuse": "fusepy"})

class Passthrough(Operations):

    _RECORD: defaultdict[str, set[str]] = defaultdict(set)

    def __init__(self, root, log_file):
        self.root = root
        self.log_file = open(log_file, "w") if log_file else None

    def __record(self, method, path):
        if self.log_file:
            print(f"{method}(): {path}", file=self.log_file)
        # print(f"{method}(): {path}", file=sys.stderr)
        self._RECORD[method].add(path)

    def _full_path(self, partial):
        if partial.startswith("/"):
            partial = partial[1:]
        path = os.path.join(self.root, partial)
        return path

    def access(self, path, mode):
        full_path = self._full_path(path)
        if not os.access(full_path, mode):
            raise FuseOSError(errno.EACCES)

    def chmod(self, path, mode):
        full_path = self._full_path(path)
        return os.chmod(full_path, mode)

    def chown(self, path, uid, gid):
        full_path = self._full_path(path)
        return os.chown(full_path, uid, gid)

    def getattr(self, path, fh=None):
        full_path = self._full_path(path)
        st = os.lstat(full_path)
        self.__record('getattr', path)
        return dict(
            (key, getattr(st, key))
            for key in (
                "st_atime",
                "st_ctime",
                "st_gid",
                "st_mode",
                "st_mtime",
                "st_nlink",
                "st_size",
                "st_uid",
            )
        )

    def readdir(self, path, fh):
        full_path = self._full_path(path)

        dirents = [".", ".."]
        if os.path.isdir(full_path):
            dirents.extend(os.listdir(full_path))
        for r in dirents:
            yield r

    def readlink(self, path):
        pathname = os.readlink(self._full_path(path))
        if pathname.startswith("/"):
            # Path name is absolute, sanitize it.
            return os.path.relpath(pathname, self.root)
        else:
            return pathname

    def mknod(self, path, mode, dev):
        return os.mknod(self._full_path(path), mode, dev)

    def rmdir(self, path):
        full_path = self._full_path(path)
        return os.rmdir(full_path)

    def mkdir(self, path, mode):
        return os.mkdir(self._full_path(path), mode)

    def statfs(self, path):
        full_path = self._full_path(path)
        stv = os.statvfs(full_path)
        return dict(
            (key, getattr(stv, key))
            for key in (
                "f_bavail",
                "f_bfree",
                "f_blocks",
                "f_bsize",
                "f_favail",
                "f_ffree",
                "f_files",
                "f_flag",
                "f_frsize",
                "f_namemax",
            )
        )

    def unlink(self, path):
        return os.unlink(self._full_path(path))

    def symlink(self, name, target):
        return os.symlink(target, self._full_path(name))

    def rename(self, old, new):
        return os.rename(self._full_path(old), self._full_path(new))

    def link(self, target, name):
        return os.link(self._full_path(name), self._full_path(target))

    def utimens(self, path, times=None):
        return os.utime(self._full_path(path), times)

    # File methods
    # ============

    def open(self, path, flags):
        full_path = self._full_path(path)
        fd = os.open(full_path, flags)
        self.__record('open', path)
        return fd

    def create(self, path, mode, fi=None):
        self.__record('create', path)
        uid, gid, pid = fuse_get_context()
        full_path = self._full_path(path)
        fd = os.open(full_path, os.O_WRONLY | os.O_CREAT, mode)
        os.chown(full_path, uid, gid)  # chown to context uid & gid
        return fd

    def read(self, path, length, offset, fh):
        os.lseek(fh, offset, os.SEEK_SET)
        return os.read(fh, length)

    def write(self, path, buf, offset, fh):
        os.lseek(fh, offset, os.SEEK_SET)
        return os.write(fh, buf)

    def truncate(self, path, length, fh=None):
        full_path = self._full_path(path)
        with open(full_path, "r+") as f:
            f.truncate(length)

    def flush(self, path, fh):
        return os.fsync(fh)

    def release(self, path, fh):
        return os.close(fh)

    def fsync(self, path, fdatasync, fh):
        return self.flush(path, fh)



@contextmanager
def fuse_mount(operations, *args, **kwargs):
    def _run():
        FUSE(operations, *args, **kwargs, nothreads=True, foreground=True)
    t = threading.Thread(target=_run, daemon=True)
    t.start()
    time.sleep(0.1)
    if not t.is_alive():
        raise RuntimeError("FUSE thread died")
    try:
        yield
    finally:
        pass
        # t.join()

def mount_and_exec(mountpoint, root, cmd, sync, log_file, allow_other=False):
    ops = Passthrough(root, log_file)
    logger.info(f"Passthrough mount {mountpoint} on {root}")
    with fuse_mount(ops, mountpoint, allow_other=allow_other):
        logger.info(f"Executing: {cmd}")
        ret = subprocess.run(cmd, shell=True, cwd=mountpoint)
        logging.info(f"Return code: {ret.returncode}")

    n_read_files = len(ops._RECORD["open"])
    n_stat_only_files = len(ops._RECORD["getattr"] - ops._RECORD["open"])

    all_paths = ops._RECORD["read"] | ops._RECORD["getattr"]
    all_paths = [ pathlib.Path(root, p.lstrip("/")) for p in all_paths ]
    all_files = [ p for p in all_paths if p.is_file() ]
    n_all_files =  len(all_files)
    total_size = sum(p.stat().st_size for p in all_files)
    total_size_mb = f"{total_size / 1024 / 1024:.2f} MB"

    logging.info(f"Stat: All={len(all_paths)} Files={len(all_files)} Read={n_read_files} StatOnly={n_stat_only_files} TotalSize={total_size_mb}")

    if sync:
        logging.info(f"Syncing files to {sync}")
        for p in all_files:
            src = str(p)
            dst = os.path.join(sync, src.removeprefix(root).lstrip("/"))
            logging.debug(f"Copying {src} to {dst}")
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(src, dst)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root")
    parser.add_argument("--sync", default="")
    parser.add_argument("--log", default="")
    parser.add_argument("--allow-other", action="store_true", default=False)
    parser.add_argument("cmd", nargs="*")

    args = parser.parse_args()
    root = args.root
    cmd = args.cmd
    allow_other = args.allow_other
    sync = args.sync
    log_file = args.log
    if sync:
        sync = os.path.abspath(sync)
        if not os.path.exists(sync):
            os.makedirs(sync)
        assert os.path.isdir(sync), f"sync directory '{sync}' does not exist"
    with tempfile.TemporaryDirectory(delete=False, prefix="fuse-passthrough-") as tmpdir:
        mount_and_exec(tmpdir, root, cmd, sync, log_file, allow_other=allow_other)



if __name__ == "__main__":
    main()
