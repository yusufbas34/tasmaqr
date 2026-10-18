# Tasma QR 3D baskı gövdesi: kulaklı yuvarlak rozet, önünde QR etiket çukuru.
# Çalıştırma: pip install trimesh shapely manifold3d mapbox_earcut && python3 uretim/3d/govde.py
# Çıktı: govde-30mm.stl, govde-35mm.stl, tasmaqr-5-renk-<ölçü>.3mf (aynı tablada 5 renk)
import os, zipfile
import trimesh
from shapely.geometry import Point, box
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
THICK, RECESS_DEPTH, RIM, CLEAR = 4.0, 1.0, 2.2, 0.3   # mm: kalınlık, çukur derinliği, kenar, etiket boşluğu (yarıçap)
COLORS = [("lacivert", "#163A7A"), ("turuncu", "#E8742A"), ("kirmizi", "#C62828"), ("yesil", "#1F7A4A"), ("pembe", "#E05A8A")]

def body(d):
    R = d / 2
    ear_c, ear_r, hole_r = R + 2.6, 5.0, 2.1                 # kulak merkezi, kulak yarıçapı, halka deliği Ø4,2
    outline = unary_union([Point(0, 0).buffer(R, 256), Point(0, ear_c).buffer(ear_r, 128), box(-ear_r, R - 3, ear_r, ear_c)])
    outline = outline.difference(Point(0, ear_c).buffer(hole_r, 96))
    solid = trimesh.creation.extrude_polygon(outline, THICK)
    recess = trimesh.creation.cylinder(radius=R - RIM, height=RECESS_DEPTH * 2, sections=256)
    recess.apply_translation([0, 0, THICK])
    m = solid.difference(recess, engine="manifold")
    return m, 2 * (R - RIM - CLEAR)

def write_3mf(path, mesh, colors, gap):
    w = mesh.bounds[1][0] - mesh.bounds[0][0]
    objs, items = [], []
    mats = "".join(f'<base name="{n}" displaycolor="{c}FF"/>' for n, c in colors)
    for i, (name, _) in enumerate(colors):
        v = "".join(f'<vertex x="{x:.4f}" y="{y:.4f}" z="{z:.4f}"/>' for x, y, z in mesh.vertices)
        t = "".join(f'<triangle v1="{a}" v2="{b}" v3="{c}"/>' for a, b, c in mesh.faces)
        objs.append(f'<object id="{i + 2}" name="govde-{name}" type="model" pid="1" pindex="{i}"><mesh><vertices>{v}</vertices><triangles>{t}</triangles></mesh></object>')
        items.append(f'<item objectid="{i + 2}" transform="1 0 0 0 1 0 0 0 1 {(i - 2) * (w + gap) + 128:.3f} 128 0"/>')
    model = ('<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="tr-TR" '
             'xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources>'
             f'<basematerials id="1">{mats}</basematerials>{"".join(objs)}</resources><build>{"".join(items)}</build></model>')
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                   '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                   '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   '<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
        z.writestr("3D/3dmodel.model", model)

for d in (30, 35):
    m, sticker = body(d)
    assert m.is_watertight
    m.export(os.path.join(HERE, f"govde-{d}mm.stl"))
    write_3mf(os.path.join(HERE, f"tasmaqr-5-renk-{d}mm.3mf"), m, COLORS, 6)
    ext = m.bounds[1] - m.bounds[0]
    print(f"Ø{d}: {ext[0]:.1f}×{ext[1]:.1f}×{ext[2]:.1f} mm, hacim {m.volume / 1000:.2f} cm³ (~{m.volume / 1000 * 1.27:.1f} g PETG), etiket Ø{sticker:.1f} mm")
