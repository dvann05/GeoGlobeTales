import os
import math
import asyncio
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import edge_tts

# ==========================================================
# KONFIGURASI KANVAS 9:16 (1080x1920 @ 30 FPS)
# ==========================================================
WIDTH = 1080
HEIGHT = 1920
FPS = 30
VOICE = "id-ID-ArdiNeural"
AUDIO_DIR = "build_audio"
OUTPUT_MP4 = "geoglobetales_perfect_9x16.mp4"

# ==========================================================
# NASKAH LENGKAP 5 SCENE (MELANJUTKAN NARASI YANG TERPOTONG)
# ==========================================================
SCENES = [
    {
        "id": 1,
        "badge": "GEOGRAPHY EXPLAINER",
        "title": "FAKTA GEOGRAFI YANG\nPERLU KAMU TAHU",
        "subtitle_top": "Asal-Usul Kepulauan Nusantara",
        "narration": "Indonesia merupakan negara kepulauan yang terbentuk melalui proses geologi selama jutaan tahun.",
        "cam_start": (1.0, 0.50, 0.50),
        "cam_end": (1.25, 0.58, 0.52),
        "show_plates": False,
        "show_volcanoes": False,
        "show_badges": False,
        "show_outro": False,
    },
    {
        "id": 2,
        "badge": "MELIHAT PETA WILAYAH",
        "title": "PERGERAKAN LEMPENG\nTEKTONIK DUNIA",
        "subtitle_top": "Kenali Posisi dan Persebaran Wilayahnya",
        "narration": "Pergerakan lempeng tektonik Eurasia, Indo-Australia, dan Pasifik menyebabkan berbagai perubahan pada permukaan bumi.",
        "cam_start": (1.25, 0.58, 0.52),
        "cam_end": (2.10, 0.74, 0.58),
        "show_plates": True,
        "show_volcanoes": False,
        "show_badges": False,
        "show_outro": False,
    },
    {
        "id": 3,
        "badge": "FOKUS WILAYAH",
        "title": "AKTIVITAS VULKANIK\n& PERMUKAAN LAUT",
        "subtitle_top": "Jalur Cincin Api Pasifik (Ring of Fire)",
        "narration": "Aktivitas vulkanik, pergeseran kerak bumi, dan perubahan permukaan laut turut membentuk ribuan pulau yang kini menjadi wilayah Indonesia.",
        "cam_start": (2.10, 0.74, 0.58),
        "cam_end": (2.85, 0.77, 0.60),
        "show_plates": True,
        "show_volcanoes": True,
        "show_badges": False,
        "show_outro": False,
    },
    {
        "id": 4,
        "badge": "BENTANG ALAM NUSANTARA",
        "title": "KERAGAMAN TOPOGRAFI\nKEPULAUAN INDONESIA",
        "subtitle_top": "Pegunungan, Gunung Berapi, hingga Dataran Rendah",
        "narration": "Proses panjang tersebut menghasilkan bentang alam yang beragam, mulai dari pegunungan, gunung berapi aktif, hingga dataran rendah yang subur.",
        "cam_start": (2.85, 0.77, 0.60),
        "cam_end": (2.60, 0.76, 0.59),
        "show_plates": False,
        "show_volcanoes": True,
        "show_badges": True,
        "show_outro": False,
    },
    {
        "id": 5,
        "badge": "FAKTA MENARIK, BUKAN SEKADAR MITOS",
        "title": "JELAJAHI BERSAMA\nGEOGLOBETALES",
        "subtitle_top": "Rumah Bagi 17.508 Pulau & Biodiversitas Dunia",
        "narration": "Kekayaan geologi inilah yang menjadikan Indonesia rumah bagi lebih dari tujuh belas ribu pulau dengan keanekaragaman hayati tertinggi di dunia.",
        "cam_start": (2.60, 0.76, 0.59),
        "cam_end": (1.65, 0.70, 0.56),
        "show_plates": False,
        "show_volcanoes": True,
        "show_badges": False,
        "show_outro": True,
    },
]

def load_font(size, bold=False):
    candidates = [
        "/system/fonts/Roboto-Bold.ttf" if bold else "/system/fonts/Roboto-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

FONT_BADGE = load_font(25, bold=True)
FONT_TITLE = load_font(52, bold=True)
FONT_SUBTOP = load_font(30, bold=False)
FONT_MAP_LABEL = load_font(24, bold=True)
FONT_CARD_VAL = load_font(34, bold=True)
FONT_CARD_LBL = load_font(20, bold=True)
FONT_SUBTITLE = load_font(38, bold=True)

def get_audio_duration(filepath):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filepath
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return float(res.stdout.strip())

async def generate_all_voiceovers():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    for sc in SCENES:
        out_mp3 = os.path.join(AUDIO_DIR, f"scene_{sc['id']}.mp3")
        comm = edge_tts.Communicate(sc["narration"], VOICE, rate="+2%", pitch="-2Hz")
        await comm.save(out_mp3)
        dur = get_audio_duration(out_mp3)
        # Tambahkan jeda napas 0.45 detik agar narasi tidak pernah terpotong
        sc["audio_path"] = out_mp3
        sc["duration"] = dur + 0.45
        sc["frames"] = int(math.ceil(sc["duration"] * FPS))
        print(f"[AUDIO] Scene {sc['id']}: {dur:.2f}s -> {sc['frames']} frames")

def build_highres_world_map():
    """Membuat Peta Dunia + Highlight Indonesia Resolusi Tinggi (2400x1350) untuk di-zoom secara halus"""
    mw, mh = 2400, 1350
    img = Image.new("RGBA", (mw, mh), (7, 19, 36, 255))
    draw = ImageDraw.Draw(img)

    # Grid Kartografi
    for x in range(0, mw, 80):
        draw.line([(x, 0), (x, mh)], fill=(30, 58, 95, 70), width=1)
    for y in range(0, mh, 80):
        draw.line([(0, y), (mw, y)], fill=(30, 58, 95, 70), width=1)

    # Garis Khatulistiwa
    eq_y = int(mh * 0.58)
    for x in range(0, mw, 28):
        draw.line([(x, eq_y), (x + 14, eq_y)], fill=(56, 189, 248, 110), width=2)

    # Poligon Benua Dunia (Skala 2400x1350)
    continents = [
        # Amerika Utara
        [(200, 180), (560, 150), (640, 420), (430, 560), (260, 440)],
        # Amerika Selatan
        [(510, 630), (710, 720), (640, 1120), (520, 1040)],
        # Eropa
        [(1020, 170), (1330, 150), (1370, 390), (1060, 410)],
        # Afrika
        [(1040, 450), (1340, 450), (1390, 920), (1200, 1040), (1030, 740)],
        # Asia Daratan Utama
        [(1350, 150), (2080, 180), (2010, 590), (1650, 620), (1380, 430)],
        # Semenanjung Malaya & Indocina
        [(1620, 560), (1730, 560), (1710, 700), (1650, 690)],
        # Australia
        [(1790, 910), (2110, 890), (2140, 1140), (1830, 1160)],
    ]
    for poly in continents:
        draw.polygon(poly, fill=(45, 66, 92, 255), outline=(71, 95, 125, 255))

    return img

BASE_MAP = build_highres_world_map()

def draw_indonesia_and_geology(map_copy, scene, pulse):
    draw = ImageDraw.Draw(map_copy)

    # Gugusan Pulau Indonesia (Oranye Emas Terang)
    islands = [
        # Sumatera
        [(1630, 695), (1685, 735), (1725, 800), (1695, 820), (1615, 725)],
        # Jawa
        [(1732, 825), (1838, 835), (1834, 855), (1728, 845)],
        # Kalimantan
        [(1745, 685), (1835, 680), (1845, 775), (1755, 782)],
        # Sulawesi
        [(1862, 710), (1905, 700), (1896, 788), (1858, 778)],
        # Bali, NTB, NTT
        [(1848, 836), (1940, 842), (1940, 856), (1848, 852)],
        # Maluku
        [(1930, 735), (1955, 735), (1955, 765), (1930, 765)],
        # Papua
        [(1965, 752), (2085, 772), (2075, 836), (1958, 806)],
    ]
    for poly in islands:
        draw.polygon(poly, fill=(245, 158, 11, 255), outline=(254, 240, 138, 255))

    # Label Fokus INDONESIA
    lbl_x, lbl_y = 1845, 645
    draw.rounded_rectangle(
        [lbl_x - 95, lbl_y - 24, lbl_x + 95, lbl_y + 24],
        radius=10,
        fill=(6, 16, 30, 230),
        outline=(245, 158, 11, 255),
        width=3,
    )
    draw.text((lbl_x, lbl_y), "INDONESIA", font=FONT_MAP_LABEL, fill=(251, 191, 36, 255), anchor="mm")

    # Garis Lempeng Tektonik (Scene 2 & 3)
    if scene["show_plates"]:
        plate_pts = [(1570, 685), (1680, 845), (1840, 890), (2090, 865)]
        draw.line(plate_pts, fill=(56, 189, 248, 255), width=6)
        draw.text((1730, 595), "LEMPENG EURASIA  v", font=FONT_MAP_LABEL, fill=(56, 189, 248, 255), anchor="mm")
        draw.text((1720, 935), "^  LEMPENG INDO-AUSTRALIA", font=FONT_MAP_LABEL, fill=(56, 189, 248, 255), anchor="mm")
        draw.text((2060, 700), "<- PASIFIK", font=FONT_MAP_LABEL, fill=(56, 189, 248, 255), anchor="mm")

    # Titik Cincin Api Vulkanik (Scene 3, 4, 5)
    if scene["show_volcanoes"]:
        volcanoes = [
            (1655, 730), (1695, 780), (1755, 835),
            (1810, 842), (1875, 846), (1925, 845), (1890, 730)
        ]
        r_outer = int(14 + pulse * 12)
        for vx, vy in volcanoes:
            draw.ellipse([vx - r_outer, vy - r_outer, vx + r_outer, vy + r_outer], fill=(239, 68, 68, 95))
            draw.ellipse([vx - 7, vy - 7, vx + 7, vy + 7], fill=(239, 68, 68, 255))

def ease_in_out(t):
    return t * t * (3.0 - 2.0 * t)

def render_single_frame(scene, local_frame, global_frame):
    total_f = max(1, scene["frames"])
    progress = min(1.0, max(0.0, local_frame / total_f))
    eased = ease_in_out(progress)
    pulse = 0.5 + 0.5 * math.sin(global_frame / 4.5)

    # Kanvas Utama 9:16
    canvas = Image.new("RGB", (WIDTH, HEIGHT), (6, 16, 30))
    draw = ImageDraw.Draw(canvas)

    # ==========================================================
    # ZONA 1: HEADER ATAS (Y: 80px s/d 420px) - BEBAS TABRAKAN
    # ==========================================================
    badge_text = scene["badge"]
    bw = draw.textlength(badge_text, font=FONT_BADGE) + 56
    draw.rounded_rectangle(
        [(WIDTH - bw) / 2, 95, (WIDTH + bw) / 2, 150],
        radius=27,
        fill=(38, 28, 12),
        outline=(245, 158, 11),
        width=2,
    )
    draw.text((WIDTH / 2, 122), badge_text, font=FONT_BADGE, fill=(251, 191, 36), anchor="mm")

    # Judul Utama (Multi-baris Rapi)
    draw.multiline_text(
        (WIDTH / 2, 245),
        scene["title"],
        font=FONT_TITLE,
        fill=(248, 250, 252),
        anchor="mm",
        align="center",
        spacing=12,
    )

    # Sub-judul Atas (Berada di Y=365, Tidak Mungkin Menabrak Subtitle Bawah)
    draw.text(
        (WIDTH / 2, 368),
        scene["subtitle_top"],
        font=FONT_SUBTOP,
        fill=(56, 189, 248),
        anchor="mm",
    )

    # ==========================================================
    # ZONA 2: PANGGUNG PETA TENGAH (Y: 430px s/d 1350px)
    # ==========================================================
    s0, cx0, cy0 = scene["cam_start"]
    s1, cx1, cy1 = scene["cam_end"]
    scale = s0 + (s1 - s0) * eased
    cx = cx0 + (cx1 - cx0) * eased
    cy = cy0 + (cy1 - cy0) * eased

    map_layer = BASE_MAP.copy()
    draw_indonesia_and_geology(map_layer, scene, pulse)

    mw, mh = map_layer.size
    crop_w = int(960 / scale)
    crop_h = int(880 / scale)
    left = int(cx * mw - crop_w / 2)
    top = int(cy * mh - crop_h / 2)
    left = max(0, min(mw - crop_w, left))
    top = max(0, min(mh - crop_h, top))

    cropped = map_layer.crop((left, top, left + crop_w, top + crop_h)).resize(
        (960, 880), Image.Resampling.LANCZOS
    )

    # Bingkai Peta Tengah
    draw.rounded_rectangle(
        [56, 436, 1024, 1324],
        radius=28,
        fill=(7, 19, 36),
        outline=(51, 65, 85),
        width=3,
    )
    canvas.paste(cropped.convert("RGB"), (60, 440))

    # Kartu Infografis Bentang Alam (Hanya di Scene 4 - Di Dalam Bawah Peta)
    if scene["show_badges"]:
        cards = [
            ("PEGUNUNGAN", "Puncak 4.884m", (56, 189, 248)),
            ("VULKANIK", "127 Gunung Api", (239, 68, 68)),
            ("KEPULAUAN", "17.508 Pulau", (245, 158, 11)),
        ]
        card_w = 290
        gap = 20
        start_x = (WIDTH - (card_w * 3 + gap * 2)) // 2
        for i, (lbl, val, col) in enumerate(cards):
            x0 = start_x + i * (card_w + gap)
            y0 = 1175
            draw.rounded_rectangle(
                [x0, y0, x0 + card_w, y0 + 125],
                radius=18,
                fill=(9, 20, 38),
                outline=col,
                width=3,
            )
            draw.text((x0 + card_w / 2, y0 + 42), lbl, font=FONT_CARD_LBL, fill=col, anchor="mm")
            draw.text((x0 + card_w / 2, y0 + 86), val, font=FONT_CARD_VAL, fill=(255, 255, 255), anchor="mm")

    # Banner Penutup Bersih (Hanya di Scene 5)
    if scene["show_outro"]:
        draw.rounded_rectangle(
            [160, 1205, 920, 1295],
            radius=45,
            fill=(245, 158, 11),
            outline=(254, 240, 138),
            width=3,
        )
        draw.text(
            (WIDTH / 2, 1250),
            "IKUTI @GEOGLOBETALES",
            font=FONT_CARD_VAL,
            fill=(6, 16, 30),
            anchor="mm",
        )

    # ==========================================================
    # ZONA 3: KOTAK SUBTITLE BAWAH (Y: 1400px s/d 1780px)
    # ==========================================================
    box_x0, box_y0, box_x1, box_y1 = 60, 1400, 1020, 1775
    draw.rounded_rectangle(
        [box_x0, box_y0, box_x1, box_y1],
        radius=28,
        fill=(10, 22, 42),
        outline=(71, 85, 105),
        width=2,
    )

    # Word-wrapping & Highlight Kata Aktif (Karaoke Style)
    words = scene["narration"].split(" ")
    active_idx = min(len(words) - 1, int(progress * len(words)))

    lines = []
    cur_line = []
    max_text_w = 860
    for idx, w in enumerate(words):
        test_str = " ".join([item[1] for item in cur_line] + [w])
        if draw.textlength(test_str, font=FONT_SUBTITLE) <= max_text_w:
            cur_line.append((idx, w))
        else:
            lines.append(cur_line)
            cur_line = [(idx, w)]
    if cur_line:
        lines.append(cur_line)

    line_h = 56
    total_text_h = len(lines) * line_h
    start_ty = (box_y0 + box_y1 - total_text_h) / 2 + 18

    for l_idx, line_items in enumerate(lines):
        full_line_str = " ".join([w for _, w in line_items])
        line_w = draw.textlength(full_line_str, font=FONT_SUBTITLE)
        cur_x = (WIDTH - line_w) / 2
        cur_y = start_ty + l_idx * line_h
        for w_idx, word_str in line_items:
            if w_idx == active_idx:
                color = (251, 191, 36)  # Kuning Emas (Kata yang sedang diucapkan)
            elif w_idx < active_idx:
                color = (255, 255, 255) # Putih Bersih (Sudah diucapkan)
            else:
                color = (148, 163, 184) # Abu Terang (Belum diucapkan)
            draw.text((cur_x, cur_y), word_str, font=FONT_SUBTITLE, fill=color, anchor="lm")
            cur_x += draw.textlength(word_str + " ", font=FONT_SUBTITLE)

    # Progress Bar Emas di Bawah Kotak Subtitle
    prog_w = int((box_x1 - box_x0 - 20) * progress)
    if prog_w > 6:
        draw.rounded_rectangle(
            [box_x0 + 10, box_y1 - 12, box_x0 + 10 + prog_w, box_y1 - 4],
            radius=4,
            fill=(245, 158, 11),
        )

    return canvas

def main():
    asyncio.run(generate_all_voiceovers())

    # Gabungkan seluruh file audio scene menjadi 1 track utuh
    concat_list_path = os.path.join(AUDIO_DIR, "concat_list.txt")
    with open(concat_list_path, "w") as f:
        for sc in SCENES:
            # Tambahkan silence padding 0.45s per scene via ffmpeg
            padded_mp3 = os.path.join(AUDIO_DIR, f"scene_{sc['id']}_pad.mp3")
            subprocess.run([
                "ffmpeg", "-y", "-v", "error",
                "-i", sc["audio_path"],
                "-af", "apad=pad_dur=0.45",
                padded_mp3
            ], check=True)
            f.write(f"file 'scene_{sc['id']}_pad.mp3'\n")

    full_audio_path = os.path.join(AUDIO_DIR, "full_voiceover.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-v", "error",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy", full_audio_path
    ], check=True)

    total_frames = sum(sc["frames"] for sc in SCENES)
    print(f"[RENDER] Memulai render {total_frames} frames ({total_frames/FPS:.1f} detik) ke {OUTPUT_MP4}...")

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", full_audio_path,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_MP4
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    global_f = 0
    for sc in SCENES:
        for lf in range(sc["frames"]):
            frame_img = render_single_frame(sc, lf, global_f)
            proc.stdin.write(frame_img.tobytes())
            global_f += 1
        print(f"[DONE] Scene {sc['id']} selesai dirender.")

    proc.stdin.close()
    proc.wait()
    print(f"\n[SELESAI] Video 9:16 berhasil dibuat: {os.path.abspath(OUTPUT_MP4)}")

if __name__ == "__main__":
    main()
