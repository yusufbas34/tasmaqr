# Raf kedisi: rafın kenarına yatmış, bir arka bacağı ve kuyruğu aşağı sarkan kedi biblosu.
# Alttan, rafın içinden geçen vidayla sabitlenir; vida üstten/önden görünmez.
# Çalıştırma: pip install trimesh fast_simplification scikit-image manifold3d numpy && python3 raf_kedisi.py
#
# Eksenler (mm): x = rafın kenarı boyunca (kafa -x, kuyruk +x), y = rafın içine doğru (+),
# z = yukarı. Raf üst yüzeyi z=0, raf ön kenarı y=0. Sarkan bacak ve kuyruk y<0, z<0 bölgesinde.
import os
import numpy as np
import trimesh
import fast_simplification
from skimage.measure import marching_cubes

HERE = os.path.dirname(os.path.abspath(__file__))
RES = 0.5          # ızgara adımı (mm)
K = 6.0            # yumuşak birleşim yarıçapı (mm)
BACK_CUT = 42.0    # arka (duvar tarafı) düz kesim: baskıda tablaya oturan gizli yüz

# Vida noktaları (karın altında, x, y). İki vida: kedi dönmez.
SCREWS = [(-22.0, 22.0), (30.0, 20.0)]
INSERT_D, INSERT_DEPTH = 5.7, 10.0     # M4 sıcak gömme somun (Ø5.6–5.8 delik)
PILOT_D, PILOT_DEPTH = 3.0, 20.0       # Ø3.5–4 sunta/ahşap vidası doğrudan


def smin(a, b, k=K):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def ellipsoid(p, c, r):
    q = (p - np.array(c)) / np.array(r)
    k0 = np.linalg.norm(q, axis=-1)
    k1 = np.linalg.norm(q / np.array(r), axis=-1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def cone(p, a, b, ra, rb):
    a, b = np.array(a), np.array(b)
    ba = b - a
    t = np.clip(((p - a) @ ba) / (ba @ ba), 0, 1)
    d = np.linalg.norm(p - (a + t[..., None] * ba), axis=-1)
    return d - (ra + (rb - ra) * t)


def chain(p, pts, radii):
    d = None
    for i in range(len(pts) - 1):
        s = cone(p, pts[i], pts[i + 1], radii[i], radii[i + 1])
        d = s if d is None else np.minimum(d, s)
    return d


def cat_sdf(p):
    # gövde: göğüs + kalça, karnı rafa yaslanmış
    d = ellipsoid(p, (-12, 23, 13), (48, 22, 21))
    d = smin(d, ellipsoid(p, (32, 19, 13), (27, 22, 21)))
    # kafa: alçakta, yanağı rafa yaslı, -x yönüne bakıyor
    d = smin(d, ellipsoid(p, (-62, 25, 20), (21, 22, 20)))
    d = smin(d, ellipsoid(p, (-80, 25, 14), (8, 11, 8)), 4)       # burun/ağız
    # kulaklar
    for side in (-1, 1):
        d = smin(d, cone(p, (-60, 25 + side * 11, 32), (-62, 25 + side * 17, 47), 8.0, 1.6), 3)
    # önde katlanmış ön pati (kafanın altında)
    d = smin(d, ellipsoid(p, (-48, 6, 6), (16, 7, 6)), 4)
    # sarkan arka bacak: kalçadan kenarın üstünden aşağı
    d = smin(d, chain(p, [(38, 6, 14), (44, -5, 4), (45, -8, -12), (45, -8, -32)], [11, 8.5, 7, 6.2]))
    d = smin(d, ellipsoid(p, (46, -10, -35), (7.5, 8, 6)), 3)     # pati
    # kuyruk: kalçadan kenara, aşağı, sonda yukarı kıvrılıyor
    d = smin(d, chain(p, [(54, 20, 12), (62, 6, 9), (66, -6, 1), (67, -7, -22), (69, -7, -42),
                          (77, -7, -52), (87, -7, -49), (92, -7, -40)],
                         [6.0, 5.6, 5.2, 5.0, 4.8, 4.5, 4.2, 4.0]), 4)
    # rafın kendisini çıkar (y>0, z<0) ve arka gizli yüzü düzle
    shelf = np.maximum(-p[..., 1], p[..., 2])       # raf içinde negatif
    d = np.maximum(d, -shelf)
    d = np.maximum(d, p[..., 1] - BACK_CUT)
    return d


def build():
    lo, hi = np.array([-110, -25, -65]) + RES * 0.37, np.array([105, 50, 55])
    axes = [np.arange(l, h + RES, RES) for l, h in zip(lo, hi)]
    X, Y, Z = np.meshgrid(*axes, indexing="ij")
    P = np.stack([X, Y, Z], axis=-1)
    vol = np.empty(X.shape, np.float32)
    for i in range(X.shape[0]):                        # dilim dilim (bellek)
        vol[i] = cat_sdf(P[i])
    v, f, _, _ = marching_cubes(vol, 0.0, spacing=(RES,) * 3)
    m = trimesh.Trimesh(v + lo, f, process=True)
    if m.volume < 0:
        m.invert()
    sv, sf = fast_simplification.simplify(m.vertices, m.faces, target_reduction=0.55)
    s = trimesh.Trimesh(sv, sf, process=True)
    return s if s.is_watertight else m


def with_holes(m, dia, depth):
    out = m
    for x, y in SCREWS:
        c = trimesh.creation.cylinder(radius=dia / 2, height=2 * depth, sections=64)
        c.apply_translation([x, y, 0])
        out = out.difference(c, engine="manifold")
    return out


def print_pose(m):
    # baskı yönü: gizli arka düz yüz (y=BACK_CUT) tablaya; destek izleri yalnızca rafa dönük yüzlerde kalır
    r = trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0])
    m = m.copy()
    m.apply_transform(r)
    m.apply_translation(-m.bounds[0] * [0, 0, 1] - (m.bounds[0] + m.bounds[1]) / 2 * [1, 1, 0])
    return m


if __name__ == "__main__":
    base = build()
    for name, dia, depth in (("insert-M4", INSERT_D, INSERT_DEPTH), ("ahsap-vida", PILOT_D, PILOT_DEPTH)):
        m = with_holes(base, dia, depth)
        assert m.is_watertight, name
        m.export(os.path.join(HERE, f"raf-kedisi-{name}.stl"))
        print_pose(m).export(os.path.join(HERE, f"raf-kedisi-{name}-baski-yonu.stl"))
        e = m.bounds[1] - m.bounds[0]
        print(f"{name}: {e[0]:.0f}×{e[1]:.0f}×{e[2]:.0f} mm, hacim {m.volume/1000:.0f} cm³, {len(m.faces)} üçgen")
