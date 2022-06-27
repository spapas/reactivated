
import atexit
import os
import re
import subprocess

from django.conf import settings


def start_tsc() -> None:
    print("start_tsc")
    tsc = "tsc.cmd" if os.name == 'nt' else "tsc"
    tsc_process = subprocess.Popen(
        [f"node_modules/.bin/{tsc}", "--watch", "--noEmit", "--preserveWatchOutput"],
        # stdout=subprocess.PIPE,
        # stderr=subprocess.PIPE,
        env={**os.environ.copy()},
    )
    atexit.register(lambda: tsc_process.terminate())


def start_client() -> None:
    print("start_client")
    entry_points = getattr(settings, "REACTIVATED_BUNDLES", ["index"])

    client_process = subprocess.Popen(
        [
            "node",
            f"{settings.BASE_DIR}/node_modules/reactivated/build.client.js",
            *entry_points,
        ],
        stdout=subprocess.PIPE,
        env={**os.environ.copy()},
    )
    atexit.register(lambda: client_process.terminate())


def start_renderer() -> None:
    print("start_renderer")
    os.environ["REACTIVATED_RENDERER"] = "true"

    renderer_process = subprocess.Popen(
        ["node", f"{settings.BASE_DIR}/node_modules/reactivated/build.renderer.js"],
        encoding="utf-8",
        stdout=subprocess.PIPE,
        env={
            **os.environ.copy(),
        },
    )
    atexit.register(lambda: renderer_process.terminate())

    renderer_process_port = ""
    output = ""
    print("start_renderer 2")

    for c in iter(lambda: renderer_process.stdout.read(1), b""):  # type: ignore[union-attr]
        output += c

        if match := re.match(r"RENDERER:([/.\w]+):LISTENING", output):
            renderer_process_port = match.group(1)
            break
    os.environ["REACTIVATED_RENDERER"] = renderer_process_port
    print("start_renderer 3")
