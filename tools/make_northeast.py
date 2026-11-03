"""Cut the north-east Indian states (DataMeet States/Admin2 shapefile) and Bangladesh's
Sylhet division (geoBoundaries BGD ADM1) into data/maps/northeast.json, [lat, lon] rings.
Usage: python3 tools/make_northeast.py <Admin2.shp> <Admin2.dbf> <bgd_adm1.geojson>"""
import json, struct, sys

KEEP = {'Arunachal Pradesh': 'arunachal', 'Assam': 'assam', 'Manipur': 'manipur', 'Meghalaya': 'meghalaya',
        'Mizoram': 'mizoram', 'Nagaland': 'nagaland', 'Tripura': 'tripura', 'Sikkim': 'sikkim'}
TOL = 0.01

def dbf_names(path):
    b = open(path, 'rb').read()
    n, hlen, rlen = struct.unpack('<IHH', b[4:12])
    fields, off = [], 32
    while b[off] != 0x0D:
        fields.append((b[off:off + 11].split(b'\0')[0].decode(), b[off + 16])); off += 32
    out = []
    for i in range(n):
        rec = b[hlen + i * rlen + 1: hlen + (i + 1) * rlen]
        out.append(rec[:fields[0][1]].decode('latin1').strip())
    return out

def shp_polys(path):
    b = open(path, 'rb').read(); off = 100; out = []
    while off < len(b):
        clen = struct.unpack('>I', b[off + 4:off + 8])[0] * 2; rec = b[off + 8: off + 8 + clen]; off += 8 + clen
        if struct.unpack('<i', rec[:4])[0] != 5: out.append([]); continue
        np_, npt = struct.unpack('<ii', rec[36:44])
        parts = list(struct.unpack('<%di' % np_, rec[44:44 + 4 * np_])) + [npt]
        pts = struct.unpack('<%dd' % (2 * npt), rec[44 + 4 * np_: 44 + 4 * np_ + 16 * npt])
        out.append([[(pts[2 * j], pts[2 * j + 1]) for j in range(parts[k], parts[k + 1])] for k in range(np_)])
    return out

def dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; stack = [(0, len(pts) - 1)]
    while stack:
        a, z = stack.pop(); ax, ay = pts[a]; zx, zy = pts[z]; dx, dy = zx - ax, zy - ay; L = (dx * dx + dy * dy) ** .5 or 1e-12
        best, bi = 0, -1
        for i in range(a + 1, z):
            d = abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / L
            if d > best: best, bi = d, i
        if best > tol: keep[bi] = True; stack += [(a, bi), (bi, z)]
    return [p for p, k in zip(pts, keep) if k]

def ring(pts):
    # a closed ring has equal ends; split at the point farthest from the start so each half simplifies
    m = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
    s = dp(pts[:m + 1], TOL)[:-1] + dp(pts[m:], TOL)
    return [[round(y, 4), round(x, 4)] for x, y in s] if len(s) >= 4 else None

states = {}
for name, polys in zip(dbf_names(sys.argv[2]), shp_polys(sys.argv[1])):
    if name in KEEP:
        rings = [r for r in (ring(p) for p in polys) if r]
        # keep only outer-ish rings with some size
        states[KEEP[name]] = {'name': name, 'rings': rings}
bgd = json.load(open(sys.argv[3]))
for f in bgd['features']:
    if f['properties']['shapeName'] == 'Sylhet':
        g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        states['sylhet'] = {'name': 'Sylhet division (Bangladesh)', 'rings': [r for r in (ring([tuple(c) for c in p[0]]) for p in polys) if r]}
json.dump({'note': 'North-east Indian states: DataMeet Community Maps States/Admin2 (CC BY 4.0 / ODbL). Sylhet division: geoBoundaries gbOpen BGD ADM1 (CC BY 4.0). Simplified at 0.01 degrees. [lat, lon].',
           'regions': states}, open('data/maps/northeast.json', 'w'), separators=(',', ':'))
for k, v in states.items(): print(k, len(v['rings']), sum(len(r) for r in v['rings']))
