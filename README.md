WIFI File Sharing
=================

Share files over your local Wi‑Fi network from a simple web UI.

Quick start (Docker Compose)
---------------------------
1) Build and start
docker compose up -d --build


2) Open the site
- Windows: http://localhost:3000
- Android/iOS (same Wi‑Fi): http://<your-PC-IPv4>:3000


3) Shared storage
- Files are stored inside the container at `/app/shared`.
- With the default compose file, the project `./shared` directory on the host is mounted to `/app/shared`.


Security considerations (read before exposing)
---------------------------------------------
This app is designed for trusted local networks. If reachable by untrusted clients, there are risks:
- Unauthenticated access: anyone on the LAN can list, upload, download, and delete files.
- Cross‑Site Request Forgery: other pages on the LAN could trigger uploads/deletes via your browser.
- Upload/delete path safety: downloads are sanitized; uploads/deletes must also normalize and reject `..`.
- No size/type limits: large uploads may exhaust disk/RAM.
- Preview server: served via `vite preview`, which is not a hardened production server.


Hardening suggestions
--------------------
- Add a shared secret (PIN/token) required on all API routes (header or query param).
- Sanitize paths on upload/delete (normalize, ensure inside `/app/shared`, reject traversal).
- Add file size/type limits and stream uploads to disk.
- Enforce same-origin requests (check `Origin`/`Referer`) or use a CSRF token.
- Consider running behind a reverse proxy (nginx/traefik) with basic auth if you must expose beyond LAN.


.gitignore
----------
These entries are already included to avoid committing local artifacts and uploaded files:
```
shared/
node_modules/
.svelte-kit/
dist/
.env
.env.*
```

Notes
-----
- The server listens on port 3000 in the container and on the host.
- On Windows, allow inbound TCP 3000 in the firewall if accessing from another device.


Troubleshooting
---------------
- Can’t access from phone: ensure both devices are on the same Wi‑Fi (not guest network), and open port 3000 on the host firewall.
- Downloads on Android fail: the API supports HTTP Range and correct headers; try Chrome and ensure large downloads are allowed with screen on.
