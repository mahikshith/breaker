"""Preserve reusable artwork byte-for-byte; changed sources become new versions."""
from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / 'artwork-library'
MEDIA = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.webm'}
SOURCES = [
    ('concepts', 'design/phase1/img'),
    ('sources', 'art/space'),
    ('sources', 'art/frost-warden'),
    ('sources', 'art/starflight'),
    ('sources', 'art/starflight-v2'),
    ('sources', 'art/starflight-arsenal'),
    ('assets', 'design/phase1/weapon-vfx-v2'),
    ('assets', 'design/phase1/weapon-vfx-v3'),
    *[('assets', 'assets/' + name) for name in (
        'space-a', 'space-b', 'space-c', 'space-common', 'space-companions', 'circuit-companions',
        'relay-circuit', 'orbital-forge', 'frost-warden', 'kit', 'kit-cast', 'snake-jade', 'starflight', 'starflight-v2', 'starflight-arsenal')],
    *[('renders', 'out/' + name) for name in (
        'brum-proof', 'kit-proof', 'kit-cast-proof', 'cast',
        'rejected-cast-20261018', 'rejected-kit-20261018')],
]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    LIBRARY.mkdir(exist_ok=True)
    manifest_path = LIBRARY / 'manifest.json'
    manifest = json.loads(manifest_path.read_text('utf-8')) if manifest_path.exists() else {'version': 1, 'files': []}
    files = {item['sha256']: item for item in manifest['files']}
    for item in files.values():
        path = LIBRARY / item['archive']
        assert path.is_file() and digest(path) == item['sha256'], f"Archive changed: {path}"
    for category, source_root in SOURCES:
        base = ROOT / source_root
        if not base.exists():
            continue
        for source in sorted(base.rglob('*')):
            allowed = MEDIA | ({'.json'} if category == 'assets' else set())
            if not source.is_file() or source.suffix.lower() not in allowed:
                continue
            sha = digest(source)
            relative = source.relative_to(ROOT).as_posix()
            item = files.get(sha)
            if item is None:
                tail = source.relative_to(base)
                archived = Path(category) / base.name / tail.parent / f'{tail.stem}--{sha[:12]}{tail.suffix.lower()}'
                target = LIBRARY / archived
                target.parent.mkdir(parents=True, exist_ok=True)
                assert not target.exists(), f'Archive name collision: {target}'
                shutil.copyfile(source, target)
                assert digest(target) == sha, f'Copy mismatch: {source}'
                item = files[sha] = {'archive': archived.as_posix(), 'sha256': sha, 'bytes': source.stat().st_size, 'sources': []}
            if relative not in item['sources']:
                item['sources'].append(relative)
                item['sources'].sort()
    manifest['files'] = sorted(files.values(), key=lambda item: item['archive'])
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    rows = ['# Artwork catalogue', '', 'Every link opens a preserved original. Identical files share one copy; source aliases and full SHA256 hashes are in [manifest.json](manifest.json).', '', '| Artwork | Working source / aliases |', '|---|---|']
    for item in manifest['files']:
        aliases = '<br>'.join(item['sources'])
        rows.append(f"| [{Path(item['archive']).stem.rsplit('--', 1)[0]}]({item['archive']}) | {aliases} |")
    (LIBRARY / 'CATALOGUE.md').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    boards = ['# Space design boards', '', 'Preserved originals; these links remain usable if a working source changes. Carrier A, Circuit A and Forge A are selected directions. Eclipse D and the alternate later gameplay directions remain references.', '']
    for title, name in [('Carrier Breakout — A', 'space-carrier-a.png'), ('Relay Raiders — B', 'space-relay-b.png'), ('Orbital Breakout — C', 'space-orbital-c-v1.png'), ('Eclipse Rescue — D', 'space-eclipse-d-v1.png'), ('Circuit gameplay alternatives', 'relay-variety-study-v3.png'), ('Forge gameplay alternatives', 'orbital-variety-study-v3.png')]:
        alias = 'design/phase1/img/' + name
        match = next(item for item in files.values() if alias in item['sources'])
        boards += [f'## {title}', '', f"![{title}]({match['archive']})", '']
    (LIBRARY / 'SPACE_BOARDS.md').write_text('\n'.join(boards), encoding='utf-8')
    print(json.dumps({'folder': str(LIBRARY), 'uniqueFiles': len(files), 'sourceVersions': sum(len(i['sources']) for i in files.values()), 'bytes': sum(i['bytes'] for i in files.values()), 'verified': True}))


if __name__ == '__main__':
    main()
