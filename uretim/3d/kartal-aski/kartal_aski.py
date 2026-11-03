# Kartal askı: masaya delik açmadan, alttan elle sıkılan kelepçe (C-işkence).
# Kartal kanatları açık, yüzü masaya dönük, taş kaidesiyle kelepçenin üstüne oturur.
# Kuyruğu masa kenarından dışarı doğru uzanır, ucu kalkık: kulaklık / çanta askısı olur.
# Çalıştırma: pip install trimesh fast_simplification scikit-image manifold3d numpy && python3 kartal_aski.py
#
# Eksenler (mm): x = masa kenarı boyunca, y = masanın içine doğru (+), z = yukarı.
# Masa üst yüzü z=0, masa ön kenarı y=0. Kelepçe ağzı z = 0 … -GAP.
# Parçalar: 1 kelepçe + kuyruk (yan yatık basılır), 2 kartal (dik basılır, 2 pimle oturup yapıştırılır),
#           3 sıkma vidası (diş doğrudan çenede), 4 pabuç. Hazır donanım gerekmez.
import os
import numpy as np
import trimesh
import fast_simplification
from skimage.measure import marching_cubes

HERE = os.path.dirname(os.path.abspath(__file__))
RES = 0.45
HW = 22.0          # kelepçe yarım genişliği (x)
WALL = 9.0         # üst plaka ve ön kol kalınlığı
DEPTH = 50.0       # üst plakanın masa üstündeki derinliği
GAP = 50.0         # ağız: masa kalınlığı + pabuç
JAW = 16.0         # alt çene kalınlığı
BOLT = (0.0, 26.0) # vida ekseni (x, y)
PITCH, SCREW_MAJ, DEPTH_T, SCREW_L = 3.0, 16.0, 1.2, 48.0   # basılı vida: Ø16, adım 3
TAP_CLEAR = 0.5                                               # çene iç dişi radyal boşluğu
PINS = [(-9.0, 17.0), (9.0, 17.0)]   # kartalı kelepçeye oturtan pimler (x, y)
PIN_D, PIN_L = 6.0, 5.0
SPLIT_Y = -3.0     # kuyruk bu düzlemde ikiye ayrılır: önü kelepçede, arkası kartalda


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def ellipsoid(p, c, r):
    q = (p - np.array(c)) / np.array(r)
    k0 = np.linalg.norm(q, axis=-1)
    k1 = np.linalg.norm(q / np.array(r), axis=-1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def cone(p, a, b, ra, rb):
    a, b = np.array(a, float), np.array(b, float)
    ba = b - a
    t = np.clip(((p - a) @ ba) / (ba @ ba), 0, 1)
    return np.linalg.norm(p - (a + t[..., None] * ba), axis=-1) - (ra + (rb - ra) * t)


def chain(p, pts, radii):
    d = cone(p, pts[0], pts[1], radii[0], radii[1])
    for i in range(1, len(pts) - 1):
        d = np.minimum(d, cone(p, pts[i], pts[i + 1], radii[i], radii[i + 1]))
    return d


def rbox(p, lo, hi, r):
    lo, hi = np.array(lo, float), np.array(hi, float)
    c, h = (lo + hi) / 2, (hi - lo) / 2
    q = np.abs(p - c) - h + r
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(q.max(axis=-1), 0) - r


def clamp_sdf(p):
    top = rbox(p, (-HW, -WALL, 0), (HW, DEPTH, WALL), 3)
    arm = rbox(p, (-HW, -WALL, -GAP - JAW), (HW, 0.01, WALL), 3)
    jaw = rbox(p, (-HW, -WALL, -GAP - JAW), (HW, BOLT[1] + 16, -GAP), 3)
    return np.minimum(np.minimum(top, arm), jaw)


def rot_ellipsoid(p, c, r, ang):
    """x-z düzleminde ang (rad) kadar döndürülmüş elipsoid; r[0] uzun eksen."""
    d = p - np.array(c)
    ca, sa = np.cos(ang), np.sin(ang)
    q = np.stack([d[..., 0] * ca + d[..., 2] * sa, d[..., 1], -d[..., 0] * sa + d[..., 2] * ca], axis=-1)
    return ellipsoid(q, (0, 0, 0), r)


def seg2(py, pz, a, b):
    ab = np.array(b) - np.array(a)
    t = np.clip(((py - a[0]) * ab[0] + (pz - a[1]) * ab[1]) / (ab @ ab), 0, 1)
    return np.hypot(py - a[0] - t * ab[0], pz - a[1] - t * ab[1]), t


_TP = [(6, 19), (-3, 14), (-12, 12), (-28, 12), (-42, 13.5), (-52, 17.5), (-57, 26)]
_TW = [16, 20, 27, 36, 44, 46, 44]          # kuyruk genişliği (x), uca doğru yelpaze gibi açılır


def _chaikin(pts, ws, n=3):
    P, W = np.array(pts, float), np.array(ws, float)
    for _ in range(n):
        q = [P[0]]; w = [W[0]]
        for i in range(len(P) - 1):
            q += [0.75 * P[i] + 0.25 * P[i + 1], 0.25 * P[i] + 0.75 * P[i + 1]]
            w += [0.75 * W[i] + 0.25 * W[i + 1], 0.25 * W[i] + 0.75 * W[i + 1]]
        q.append(P[-1]); w.append(W[-1])
        P, W = np.array(q), np.array(w)
    return [tuple(p) for p in P], list(W)


TAIL, TAIL_W = _chaikin(_TP, _TW)     # köşeleri yuvarlatılmış kuyruk yolu (y, z)


def tail_sdf(p, t_th=8.5):
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    best = np.full(x.shape, 1e9); w = np.zeros(x.shape)
    for i in range(len(TAIL) - 1):
        d, t = seg2(y, z, TAIL[i], TAIL[i + 1])
        m = d < best
        best = np.where(m, d, best)
        w = np.where(m, TAIL_W[i] + (TAIL_W[i + 1] - TAIL_W[i]) * t, w)
    r = 2.2
    q0 = best - t_th / 2 + r
    q1 = np.abs(x) - w / 2 + r
    d = np.hypot(np.maximum(q0, 0), np.maximum(q1, 0)) + np.minimum(np.maximum(q0, q1), 0) - r
    return d + 0.35 * np.sin(x * 1.15)                         # tüy oluklari


def wing_sdf(p, s):
    q = p.copy(); q[..., 0] = s * p[..., 0]                   # sağ kanat formülü, aynalanır
    S, W = np.array([10.0, 5.5, 50.0]), np.array([48.0, 2.5, 80.0])
    a = np.arctan2(W[2] - S[2], W[0] - S[0])
    L = np.linalg.norm(W - S)
    d = rot_ellipsoid(q, (S + W) / 2, (L / 2 + 5, 3.4, 10.5), a)        # örtü tüyleri
    n = 10
    for i in range(n):
        t = i / (n - 1)
        base = S + (W - S) * t
        ang = np.radians(-38 + 108 * t)
        Lf = 20 + 18 * t
        c = base + np.array([np.cos(ang), 0, np.sin(ang)]) * Lf / 2
        c[1] -= 0.4 * i * 0.3
        d = smin(d, rot_ellipsoid(q, c, (Lf / 2, 2.2, 4.6 - 1.2 * t), ang), 1.2)
    return d


def eagle_sdf(p):
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    # taş kaide (kelepçe plakasına oturur)
    rock = rbox(p, (-20, SPLIT_Y, 8), (20, 37, 17.5), 4.5)
    rock = rock + 0.7 * np.sin(0.45 * x + 1.3) * np.sin(0.5 * y) + 0.4 * np.sin(0.9 * x + 0.7 * y)
    d = rock
    # gövde, göğüs (masaya, +y yönüne bakıyor)
    body = ellipsoid(p, (0, 8, 38), (15, 13, 22))
    body = smin(body, ellipsoid(p, (0, 14, 42), (12, 9, 16)), 6)
    for s in (-1, 1):                                          # bacaklar ve pençeler kaideyi kavrar
        fx = s * 8
        body = smin(body, ellipsoid(p, (fx, 13, 24), (7, 8, 9)), 4)
        body = smin(body, cone(p, (fx, 15, 20), (fx, 18, 18), 4.2, 3.6), 2)
        for dx in (-3.2, 0, 3.2):
            body = smin(body, chain(p, [(fx + dx * 0.3, 18, 18), (fx + dx, 27, 18.2), (fx + dx * 1.1, 31, 16.5)], [3.0, 2.4, 1.3]), 1)
    d = smin(d, body, 3)
    # kafa, kaşlar, kanca gaga, gözler
    d = smin(d, ellipsoid(p, (0, 16, 66), (11, 12, 11)), 8)
    for s in (-1, 1):
        d = smin(d, ellipsoid(p, (s * 6, 24, 71), (5, 4.5, 2.4)), 2)
    d = smin(d, chain(p, [(0, 25, 66), (0, 33, 64.5), (0, 37.5, 59.5), (0, 36, 55.5)], [5.5, 3.8, 2.0, 0.9]), 2.5)
    for s in (-1, 1):
        d = np.maximum(d, -ellipsoid(p, (s * 8.2, 24.5, 68.5), (2.2, 2.2, 2.2)))
    # açık kanatlar
    for s in (-1, 1):
        d = smin(d, wing_sdf(p, s), 4)
    # kuyruğun kartal tarafı
    d = smin(d, np.maximum(tail_sdf(p), SPLIT_Y - y), 4)
    return d


def part_clamp_sdf(p):
    y = p[..., 1]
    d = smin(clamp_sdf(p), np.maximum(tail_sdf(p), y - (SPLIT_Y - 0.15)), 6)     # geniş köşe dolgusu: kuyruk kökü sağlam
    mouth = rbox(p, (-HW - 5, 0, -GAP), (HW + 5, 200, 0), 0.01)
    d = np.maximum(d, -mouth)
    d = np.maximum(d, np.abs(p[..., 0]) - HW)                  # yanlar düz: yan yatırıp basmak için
    for px, py in PINS:                                        # pimler
        d = np.minimum(d, np.maximum(cone(p, (px, py, WALL - 1), (px, py, WALL + PIN_L - 0.6), PIN_D / 2, PIN_D / 2 - 0.4), -p[..., 2] + WALL - 1))
    return d


def part_eagle_sdf(p):
    y, z = p[..., 1], p[..., 2]
    d = eagle_sdf(p)
    d = np.maximum(d, SPLIT_Y + 0.15 - y)     # kuyruğun önü kelepçede
    d = np.maximum(d, -(clamp_sdf(p) - 0.2))                   # kelepçeye oturduğu yer düz
    d = np.maximum(d, WALL - z)
    for px, py in PINS:
        d = np.maximum(d, -cone(p, (px, py, WALL - 1), (px, py, WALL + PIN_L + 0.6), PIN_D / 2 + 0.25, PIN_D / 2 + 0.25))
    return d


def mesh_from_sdf(f, lo, hi):
    lo = np.array(lo, float) + RES * 0.37
    axes = [np.arange(l, h + RES, RES) for l, h in zip(lo, hi)]
    Y, Z = np.meshgrid(axes[1], axes[2], indexing="ij")
    vol = np.empty((len(axes[0]), *Y.shape), np.float32)
    for i, xv in enumerate(axes[0]):
        vol[i] = f(np.stack([np.full_like(Y, xv), Y, Z], axis=-1))
    v, fc, _, _ = marching_cubes(vol, 0.0, spacing=(RES,) * 3)
    m = trimesh.Trimesh(v + lo, fc, process=True)
    if m.volume < 0:
        m.invert()
    for red in (0.6, 0.5, 0.4, 0.3):
        sv, sf = fast_simplification.simplify(m.vertices, m.faces, target_reduction=red)
        s = trimesh.Trimesh(sv, sf, process=True)
        s.update_faces(s.nondegenerate_faces())
        s.update_faces(s.unique_faces())
        s.remove_unreferenced_vertices()
        s.merge_vertices()
        if s.is_watertight and s.is_winding_consistent:
            return s
    return m


def hexagon(af, h):
    return trimesh.creation.cylinder(radius=af / np.sqrt(3), height=h, sections=6)


def thread(r_maj, r_min, length, pitch=PITCH, taper=1.5, n_th=144, per_pitch=24):
    """Tek ağızlı, yamuk profilli dış diş (z = 0 … length). Uçlar diş dibine pahlanır."""
    th = np.linspace(0, 2 * np.pi, n_th, endpoint=False)
    zs = np.linspace(0, length, int(np.ceil(length / pitch * per_pitch)) + 1)
    T, Z = np.meshgrid(th, zs, indexing="ij")
    u = np.mod(Z / pitch - T / (2 * np.pi), 1.0)
    x = (0.5 - np.abs(u - 0.5)) * 2                       # 0 dip, 1 tepe
    f = np.clip((x - 0.1) / 0.7, 0, 1)
    f = np.minimum(f, np.clip(np.minimum(Z, length - Z) / taper, 0, 1))
    R = r_min + (r_maj - r_min) * f
    V = np.stack([R * np.cos(T), R * np.sin(T), Z], axis=-1).reshape(-1, 3)
    nz = len(zs)
    idx = lambda i, j: (i % n_th) * nz + j
    F = []
    for i in range(n_th):
        for j in range(nz - 1):
            a, b, c, d = idx(i, j), idx(i + 1, j), idx(i + 1, j + 1), idx(i, j + 1)
            F += [(a, b, c), (a, c, d)]
    bot, top = len(V), len(V) + 1
    V = np.vstack([V, [0, 0, 0], [0, 0, length]])
    for i in range(n_th):
        F += [(bot, idx(i + 1, 0), idx(i, 0)), (top, idx(i, nz - 1), idx(i + 1, nz - 1))]
    m = trimesh.Trimesh(V, np.array(F), process=True)
    if m.volume < 0:
        m.invert()
    return m


def clamp():
    m = mesh_from_sdf(part_clamp_sdf, (-HW - 1, -62, -GAP - JAW - 2), (HW + 1, DEPTH + 2, 36))
    # iç diş doğrudan alt çeneye açılır (ayrı somun yok). Yan yatık basıldığı için boşluk biraz bol.
    tap = thread(SCREW_MAJ / 2 + TAP_CLEAR, SCREW_MAJ / 2 - DEPTH_T + TAP_CLEAR, JAW + 6, taper=0.01)
    tap.apply_translation([BOLT[0], BOLT[1], -GAP - JAW - 3])
    m = m.difference(tap, engine="manifold")
    r = SCREW_MAJ / 2 + 1.2
    for z, up in ((-GAP - JAW, True), (-GAP, False)):                   # giriş pahları
        ch = trimesh.creation.cone(radius=r, height=r, sections=96)
        if not up:
            ch.apply_transform(trimesh.transformations.rotation_matrix(np.pi, [1, 0, 0]))
        ch.apply_translation([BOLT[0], BOLT[1], z - 1.2 if up else z + 1.2])
        m = m.difference(ch, engine="manifold")
    return m


def eagle():
    return mesh_from_sdf(part_eagle_sdf, (-70, SPLIT_Y - 1, WALL - 1), (70, 45, 122))


def screw():
    # sıkma vidası: tırtıllı topuz + Ø16 diş, topuz aşağı basılır
    r, h = 21.0, 14.0
    k = trimesh.creation.cylinder(radius=r, height=h, sections=160)
    for i in range(12):
        a = 2 * np.pi * i / 12
        c = trimesh.creation.cylinder(radius=4.0, height=h * 2, sections=48)
        c.apply_translation([np.cos(a) * (r + 1.8), np.sin(a) * (r + 1.8), 0])
        k = k.difference(c, engine="manifold")
    k.apply_translation([0, 0, h / 2])
    neck = trimesh.creation.cylinder(radius=SCREW_MAJ / 2 - DEPTH_T + 0.3, height=4, sections=96)
    neck.apply_translation([0, 0, h + 1])
    t = thread(SCREW_MAJ / 2, SCREW_MAJ / 2 - DEPTH_T, SCREW_L)
    t.apply_translation([0, 0, h])
    return k.union(neck, engine="manifold").union(t, engine="manifold")


def pad():
    # masaya basan pabuç: vida ucu alttaki çukura oturur
    p = trimesh.creation.cylinder(radius=15, height=7, sections=128)
    rec = trimesh.creation.cylinder(radius=SCREW_MAJ / 2 + 0.5, height=7, sections=96)
    rec.apply_translation([0, 0, -3.5])
    p = p.difference(rec, engine="manifold")
    p.apply_translation([0, 0, 3.5])
    return p


def print_pose(m):
    # yan yatır: düz yan yüz tablaya, katmanlar C şeklini boydan boya sarar (en sağlam yön)
    m = m.copy()
    m.apply_transform(trimesh.transformations.rotation_matrix(-np.pi / 2, [0, 1, 0]))
    m.apply_translation([-(m.bounds[0][0] + m.bounds[1][0]) / 2, -(m.bounds[0][1] + m.bounds[1][1]) / 2, -m.bounds[0][2]])
    return m


if __name__ == "__main__":
    c, e = clamp(), eagle()
    e_print = e.copy(); e_print.apply_translation([0, 0, -e.bounds[0][2]])
    parts = {"kartal-aski-1-kelepce": c, "kartal-aski-1-kelepce-baski-yonu": print_pose(c),
             "kartal-aski-2-kartal": e, "kartal-aski-2-kartal-baski-yonu": e_print,
             "kartal-aski-3-vida": screw(), "kartal-aski-4-pabuc": pad()}
    for name, m in parts.items():
        # STL float32 yazar: önce yuvarla ve temizle ki dosyadan geri okununca da kapalı kalsın
        m = trimesh.Trimesh(m.vertices.astype(np.float32).astype(np.float64), m.faces, process=True)
        m.update_faces(m.nondegenerate_faces()); m.update_faces(m.unique_faces())
        m.remove_unreferenced_vertices(); m.merge_vertices()
        assert m.is_watertight and m.is_volume, name
        path = os.path.join(HERE, f"{name}.stl")
        m.export(path)
        assert trimesh.load(path).is_volume, name + " (dosyadan)"
        b = m.bounds[1] - m.bounds[0]
        print(f"{name}: {b[0]:.1f}×{b[1]:.1f}×{b[2]:.1f} mm, {m.volume/1000:.1f} cm³, {len(m.faces)} üçgen")
    asm = trimesh.util.concatenate([c, e])
    print("montaj sınırları", asm.bounds.round(1).tolist())
