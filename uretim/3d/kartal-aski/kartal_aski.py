# Kartal askı: masaya delik açmadan, alttan cıvatayla sıkılan kelepçe (C-işkence).
# Kartal masanın ön kenarına konmuş; bacakları kelepçenin ön yüzünden iner, pençeleri öne
# uzanıp yukarı kıvrılarak kulaklık / çanta askısı olur.
# Çalıştırma: pip install trimesh fast_simplification scikit-image manifold3d numpy && python3 kartal_aski.py
#
# Eksenler (mm): x = masa kenarı boyunca, y = masanın içine doğru (+), z = yukarı.
# Masa üst yüzü z=0, masa ön kenarı y=0. Kelepçe ağzı z = 0 … -GAP.
# Hazır donanım gerekmez: vida, somun ve pabuç da basılır.
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
GAP = 50.0         # ağız: masa kalınlığı + baskı pabucu (18–42 mm masa)
JAW = 16.0         # alt çene kalınlığı
BOLT = (0.0, 26.0) # cıvata ekseni (x, y)
PITCH, SCREW_MAJ, DEPTH_T, SCREW_L = 3.0, 16.0, 1.2, 48.0   # basılı vida: Ø16, adım 3
NUT_AF, NUT_H = 26.0, 10.0                                    # basılı somun


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


def eagle_sdf(p):
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    # gövde + göğüs, kenara konmuş, öne bakıyor (-y)
    d = ellipsoid(p, (0, -1, 38), (17, 15, 28))
    d = smin(d, ellipsoid(p, (0, -8, 44), (14, 10, 19)), 6)
    # kanatlar: yanlara katlanmış, tüy sıraları kabartmalı
    for s in (-1, 1):
        w = ellipsoid(p, (s * 13.5, 4, 37), (6.5, 15, 27))
        w = np.minimum(w, cone(p, (s * 12, 12, 20), (s * 8, 30, 11), 5.5, 2.0))
        w = w + 0.45 * np.sin(0.85 * z + 0.55 * y) * (y > -6)
        d = smin(d, w, 3)
    # kuyruk: plakanın üstüne yatık
    d = smin(d, ellipsoid(p, (0, 30, 11), (10, 15, 3.2)), 4)
    # kafa, kaş çıkıntıları, kanca gaga
    d = smin(d, ellipsoid(p, (0, -5, 72), (12, 13, 12)), 8)
    for s in (-1, 1):
        d = smin(d, ellipsoid(p, (s * 6, -13, 77), (5, 4.5, 2.4)), 2)
    d = smin(d, chain(p, [(0, -13, 72), (0, -23, 71), (0, -28.5, 65.5), (0, -27, 61)], [5.5, 3.8, 2.0, 0.9]), 2.5)
    for s in (-1, 1):                                                  # gözler (çukur)
        d = np.maximum(d, -ellipsoid(p, (s * 8.2, -13.5, 74.5), (2.2, 2.2, 2.2)))
    # bacaklar: tüylü üst bacak + kelepçenin önünden inen incik
    for s in (-1, 1):
        fx = s * 9.5
        d = smin(d, ellipsoid(p, (fx, -10, 14), (7, 8, 10)), 4)
        d = smin(d, cone(p, (fx, -13, 8), (fx, -14.5, -40), 5.2, 4.6), 3)
        # pençe: 3 parmak öne uzanıp yukarı kıvrılıyor = askı kancası
        for dx in (-3.6, 0.0, 3.6):
            toe = chain(p, [(fx + dx * 0.3, -14.5, -42), (fx + dx, -30, -47), (fx + dx * 1.1, -43, -45),
                            (fx + dx * 1.15, -48, -36), (fx + dx * 1.15, -47, -30)],
                        [4.6, 4.3, 4.0, 3.2, 1.6])
            d = smin(d, toe, 1.5)
    return d


def full_sdf(p):
    d = smin(clamp_sdf(p), eagle_sdf(p), 3)
    # masa ve kelepçe ağzı boş kalsın
    mouth = rbox(p, (-HW - 5, 0, -GAP), (HW + 5, 200, 0), 0.01)
    d = np.maximum(d, -mouth)
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


def body():
    m = mesh_from_sdf(full_sdf, (-HW - 1, -55, -GAP - JAW - 2), (HW + 1, DEPTH + 2, 88))
    hole = trimesh.creation.cylinder(radius=SCREW_MAJ / 2 + 0.6, height=JAW * 3, sections=96)
    hole.apply_translation([BOLT[0], BOLT[1], -GAP - JAW / 2])
    pocket = hexagon(NUT_AF + 0.5, (NUT_H - 0.5) * 2)                 # somun yuvası çenenin üst yüzünde
    pocket.apply_translation([BOLT[0], BOLT[1], -GAP])
    return m.difference(hole, engine="manifold").difference(pocket, engine="manifold")


def nut():
    # basılı somun: altıgen, iç diş vidadan 0,4 mm boşluklu
    n = hexagon(NUT_AF, NUT_H)
    n.apply_translation([0, 0, NUT_H / 2])
    tap = thread(SCREW_MAJ / 2 + 0.45, SCREW_MAJ / 2 - DEPTH_T + 0.45, NUT_H + 4, taper=0.01)
    tap.apply_translation([0, 0, -2])
    for z in (0, NUT_H):                                               # giriş pahları
        ch = trimesh.creation.cone(radius=SCREW_MAJ / 2 + 1.2, height=SCREW_MAJ / 2 + 1.2, sections=96)
        if z:
            ch.apply_transform(trimesh.transformations.rotation_matrix(np.pi, [1, 0, 0]))
        ch.apply_translation([0, 0, z - 1.2 if not z else z + 1.2])
        n = n.difference(ch, engine="manifold")
    return n.difference(tap, engine="manifold")


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
    b = body()
    parts = {"kartal-aski-govde": b, "kartal-aski-govde-baski-yonu": print_pose(b),
             "kartal-aski-vida": screw(), "kartal-aski-somun": nut(), "kartal-aski-pabuc": pad()}
    for name, m in parts.items():
        assert m.is_watertight, name
        m.export(os.path.join(HERE, f"{name}.stl"))
        e = m.bounds[1] - m.bounds[0]
        print(f"{name}: {e[0]:.1f}×{e[1]:.1f}×{e[2]:.1f} mm, {m.volume/1000:.1f} cm³, {len(m.faces)} üçgen")
