#!/usr/bin/env python3
"""Check that every station stream in _stations/ is playable from where this runs.

Run by .github/workflows/us-stream-check.yml on GitHub's US-hosted runners to
detect Canadian geo-blocking. Can also be run locally: python3 .github/scripts/check_streams.py
Writes a Markdown report to $GITHUB_STEP_SUMMARY (if set) and exits 1 if any
stream is blocked or down.
"""
import glob, json, os, re, subprocess, sys, tempfile

LISTEN_SECONDS = 8          # how long to pull audio from each stream
MIN_AUDIO_BYTES = 8_000     # less than this in LISTEN_SECONDS = not really playing
UA = "Mozilla/5.0 (FreeFanRadio stream check)"


def front_matter(path):
    text = open(path, encoding="utf-8").read()
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.S)
    fm = m.group(1) if m else ""
    def get(key):
        mm = re.search(rf"^{key}:\s*\"?(.*?)\"?\s*$", fm, re.M)
        return mm.group(1) if mm else ""
    return {"file": os.path.basename(path), "title": get("title"),
            "url": get("stream_url"), "hidden": get("hidden").lower() == "true"}


def location():
    try:
        out = subprocess.run(["curl", "-s", "--max-time", "8", "https://ipinfo.io/json"],
                             capture_output=True, text=True).stdout
        d = json.loads(out)
        return f"{d.get('city')}, {d.get('region')}, {d.get('country')} ({d.get('org')})"
    except Exception:
        return "unknown"


def check(url):
    with tempfile.NamedTemporaryFile() as tmp:
        p = subprocess.run(
            ["curl", "-sL", "-A", UA, "--max-time", str(LISTEN_SECONDS), "-o", tmp.name,
             "-w", "%{http_code}|%{content_type}|%{size_download}|%{url_effective}", url],
            capture_output=True, text=True)
        code, ctype, size, final = (p.stdout.split("|") + ["", "", "0", ""])[:4]
        size = int(float(size or 0))
        head = open(tmp.name, "rb").read(512)
    ctype = ctype.lower()
    is_playlist = head.startswith(b"#EXTM3U") or "mpegurl" in ctype
    looks_audio = ctype.startswith("audio/") or "octet-stream" in ctype or "aac" in ctype \
        or ctype == "" and size > MIN_AUDIO_BYTES
    if code not in ("200", "206"):
        status = "BLOCKED" if code in ("401", "403", "451") else "DOWN"
        detail = f"HTTP {code or 'no response'}"
    elif is_playlist:
        status, detail = "OK", "HLS playlist served"
    elif not looks_audio:
        status, detail = "BLOCKED?", f"got {ctype or 'unknown type'} instead of audio"
    elif size < MIN_AUDIO_BYTES:
        status, detail = "DOWN", f"only {size} bytes in {LISTEN_SECONDS}s"
    else:
        status, detail = "OK", f"{size // 1024} KB of {ctype or 'audio'} in {LISTEN_SECONDS}s"
    if final and final != url and status != "OK":
        detail += f" (redirected to {final[:80]})"
    return status, detail


def main():
    stations = [front_matter(p) for p in sorted(glob.glob("_stations/*.md"))]
    stations = [s for s in stations if s["url"] and not s["hidden"]]
    where = location()
    print(f"Testing {len(stations)} streams from: {where}\n")

    rows, failures = [], 0
    for s in stations:
        status, detail = check(s["url"])
        failures += status != "OK"
        icon = "✅" if status == "OK" else "❌"
        print(f"{icon} {status:9} {s['title']}: {detail}")
        rows.append(f"| {icon} {status} | {s['title']} | {detail} | `{s['file']}` |")

    report = [f"## Stream check from {where}", "",
              f"**{len(stations) - failures}/{len(stations)} streams playable.**", "",
              "| Status | Station | Detail | File |", "|---|---|---|---|", *rows]
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write("\n".join(report) + "\n")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
