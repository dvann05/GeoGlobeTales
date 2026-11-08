# Geographic Data

Semua sumber data geografis dikelola secara terpisah dari rendering engine.

## Dataset

- world.ts: dataset negara dunia.
- Indonesia: akan ditambahkan sebagai dataset regional.
- historical: untuk batas wilayah historis.
- custom: untuk dataset tambahan dari pengguna.

## Prinsip

1. Engine tidak boleh bergantung pada satu negara.
2. Setiap dataset harus memiliki identitas sendiri.
3. Wilayah dapat dipilih berdasarkan ID.
4. Data asli tidak boleh diubah oleh komponen animasi.
5. Sumber dan lisensi data harus dicatat.
