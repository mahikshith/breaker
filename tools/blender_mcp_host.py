# Runs the Blender MCP add-on (mcp-for-blender) inside headless Blender, so an AI agent's Blender MCP server
# can drive Blender on a machine with no display (cloud containers, CI).
# The add-on refuses to start in background mode because it relies on Blender's UI timers to run commands;
# this host binds the same socket and drains the add-on's command queue on the main thread itself.
#
# Setup (once):  python3 -m pip install bpy==5.2.2 requests          (Python 3.13)
#                uv tool install mcp-for-blender                       (the MCP server, provides the add-on)
# Run:           python3 tools/blender_mcp_host.py [port]             (default 9876; leave it running)
# Then connect:  claude mcp add blender -e BLENDER_MCP_DISABLE_TELEMETRY=true -- uvx mcp-for-blender
import glob, importlib.util, os, socket, sys, threading, time

import bpy  # noqa: F401  (must import before the add-on)

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 9876
hits = glob.glob(os.path.expanduser('~/.local/share/uv/tools/mcp-for-blender/lib/python*/site-packages/blender_mcp/bundled/addon.py'))
ADDON = os.environ.get('BLENDER_MCP_ADDON') or (hits[0] if hits else None)
if not ADDON:
    sys.exit('addon.py not found: run `uv tool install mcp-for-blender` or set BLENDER_MCP_ADDON')

spec = importlib.util.spec_from_file_location('blendermcp_addon', ADDON)
addon = importlib.util.module_from_spec(spec)
spec.loader.exec_module(addon)
addon.register()


class HeadlessServer(addon.BlenderMCPServer):
    def start(self):
        self.running = True
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.socket.listen(5)
        self.server_thread = threading.Thread(target=self._server_loop, daemon=True)
        self.server_thread.start()
        print(f'Blender MCP host listening on {self.host}:{self.port} (Blender {bpy.app.version_string}, headless)', flush=True)


server = HeadlessServer(port=PORT)
server.start()
try:
    while server.running:
        server._drain_command_queue()
        time.sleep(0.02)
except KeyboardInterrupt:
    server.stop()
