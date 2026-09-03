import {
  LayoutDashboard, CheckSquare, FolderKanban, CalendarDays, Timer, StickyNote,
  BookOpen, Lightbulb, Flame, Target, Library, Bookmark, FolderOpen, Wrench,
  BarChart3, Bell, Command, Sparkles, CloudCog,
} from 'lucide-react'
import { Card } from '@/components/ui'
import { AccordionItem } from '@/components/ui/Accordion'

export default function SettingsGuide() {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display font-semibold mb-1">Panduan Penggunaan</h3>
        <p className="text-xs text-muted-light dark:text-muted-dark mb-2">
          Ringkasan singkat tiap fitur di Meridian. Klik bagian di bawah untuk buka detailnya.
        </p>
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-300 mb-2">
          <Command size={14} className="shrink-0" />
          Tekan <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 mx-1">⌘K</kbd> (atau Ctrl+K) kapan saja untuk pencarian cepat ke semua data — task, project, note, goal, habit, dan koleksi buku/film di Library.
        </div>
      </Card>

      <Card className="!p-0">
        <div className="px-5">
          <AccordionItem title="Dashboard" icon={LayoutDashboard} defaultOpen>
            <p>Halaman utama yang merangkum semua aktivitas kamu hari ini: task yang jatuh tempo, jadwal acara terdekat, progress project aktif, streak habit, ringkasan sesi Pomodoro, dan tren produktivitas mingguan. Cocok jadi titik awal tiap buka aplikasi.</p>
          </AccordionItem>
          <AccordionItem title="Tasks" icon={CheckSquare}>
            <p>Kelola semua to-do: buat task baru, atur prioritas (urgent/high/medium/low), status (to do/in progress/done), deadline, tag, dan checklist di dalam satu task. Bisa dicari, difilter per status, dan diarsipkan kalau sudah tidak relevan tapi belum mau dihapus permanen.</p>
          </AccordionItem>
          <AccordionItem title="Projects" icon={FolderKanban}>
            <p>Untuk pekerjaan yang lebih besar dari satu task. Setiap project punya progress bar, deadline, tag, catatan, dan daftar file terkait. Klik salah satu project untuk buka halaman detailnya.</p>
          </AccordionItem>
          <AccordionItem title="Calendar" icon={CalendarDays}>
            <p>Lihat jadwal dalam tampilan bulan, minggu, atau hari. Klik tanggal kosong untuk bikin acara baru, klik acara yang sudah ada untuk edit. Aktifkan "reminder" di sebuah acara supaya kamu dapat notifikasi ±15 menit sebelum acara mulai.</p>
          </AccordionItem>
          <AccordionItem title="Pomodoro" icon={Timer}>
            <p>Timer fokus 25 menit dengan jeda pendek/panjang otomatis mengikuti siklus klasik Pomodoro. Setiap sesi yang selesai otomatis tercatat di riwayat sesi dan masuk ke grafik "focus minutes" di Dashboard & Analytics.</p>
          </AccordionItem>
          <AccordionItem title="Notes" icon={StickyNote}>
            <p>Catatan mendukung format Markdown (judul pakai #, list pakai -, dst). Bisa dikelompokkan ke folder, diberi tag, di-pin ke atas, atau ditandai favorit. Klik ikon mata untuk lihat hasil preview yang sudah dirender.</p>
          </AccordionItem>
          <AccordionItem title="Journal" icon={BookOpen}>
            <p>Jurnal harian: catat mood hari ini, hal-hal yang disyukuri, highlight, dan pelajaran yang didapat. Satu entri per hari — kalau sudah ada, klik "Today's entry" akan membawamu ke entri yang sama.</p>
          </AccordionItem>
          <AccordionItem title="Brainstorm" icon={Lightbulb}>
            <p>Tempat menampung ide random sebelum lupa. Beri kategori dan status (new/exploring/validated/archived) supaya gampang disortir nanti saat mau dieksekusi.</p>
          </AccordionItem>
          <AccordionItem title="Habits" icon={Flame}>
            <p>Lacak kebiasaan harian/mingguan. Centang kotak di kartu habit untuk menandai selesai hari ini. Kotak-kotak kecil di bawahnya adalah heatmap riwayat 12 minggu terakhir — makin banyak kotak terisi, makin konsisten.</p>
          </AccordionItem>
          <AccordionItem title="Goals" icon={Target}>
            <p>Target jangka menengah/panjang dengan progress % dan milestone. Cocok untuk hal yang butuh beberapa minggu/bulan, sementara Tasks lebih untuk hal-hal harian.</p>
          </AccordionItem>
          <AccordionItem title="Media Library" icon={Library}>
            <p>Koleksi pribadi: buku, film, game, musik, dan course. Tambahkan cover/poster (upload gambar dari perangkat atau tempel URL gambar), beri rating bintang 1–5, status (planned/in progress/completed/dropped), dan review singkat.</p>
          </AccordionItem>
          <AccordionItem title="Bookmarks" icon={Bookmark}>
            <p>Simpan link penting supaya gampang ditemukan lagi, dikelompokkan per folder dan bisa ditandai favorit.</p>
          </AccordionItem>
          <AccordionItem title="Files" icon={FolderOpen}>
            <p>Manajer file sederhana. Dalam mode lokal, file yang di-upload hanya tersimpan sebagai metadata di browser ini. Kalau Firebase sudah disambungkan (lihat tab Koneksi), file betulan ter-upload ke Firebase Storage.</p>
          </AccordionItem>
          <AccordionItem title="Dev Tools" icon={Wrench}>
            <p>Kumpulan utilitas: simpan snippet kode, buat palet warna, generator gradient CSS, JSON formatter (prettify/minify), generator UUID, dan encoder/decoder Base64. Semua berjalan langsung di browser, tidak butuh internet.</p>
          </AccordionItem>
          <AccordionItem title="Analytics" icon={BarChart3}>
            <p>Rangkuman angka: total task selesai, total menit fokus, streak habit terpanjang, progress tiap goal — semua dalam bentuk grafik supaya gampang dibaca trennya.</p>
          </AccordionItem>
          <AccordionItem title="Notifications" icon={Bell}>
            <p>Meridian memberi notifikasi untuk: acara dengan reminder aktif (±15 menit sebelumnya), ringkasan task yang jatuh tempo hari ini, dan pengingat habit yang belum dicentang di malam hari. Nyalakan izin notifikasi browser di tab "Notifikasi" supaya juga muncul sebagai notifikasi sistem, bukan cuma di lonceng atas. Catatan: pengecekan hanya berjalan selagi tab aplikasi ini terbuka.</p>
          </AccordionItem>
          <AccordionItem title="AI Assistant (Gemini)" icon={Sparkles}>
            <p className="mb-2">Chat assistant yang bisa "lihat" ringkasan task, project, habit, dan goal kamu saat itu juga — jadi sarannya nyambung sama kondisi kamu, bukan generik. Bisa juga dipakai buat pertanyaan apa saja di luar produktivitas.</p>
            <p className="font-medium text-inherit mb-1">Lampiran (gambar & file):</p>
            <p className="mb-2">Klik ikon <b>penjepit kertas</b> di sebelah kolom chat untuk melampirkan gambar (PNG/JPEG/WebP), PDF, atau file teks (maks 4 file, 8MB per file). Cocok buat minta dibacain isi screenshot, ringkas dokumen, atau analisis foto. Setelah refresh halaman, lampiran lama hanya tampil sebagai label nama file (data gambarnya tidak disimpan permanen di browser, biar hemat ruang).</p>
            <p className="font-medium text-inherit mb-1">Cara mengaktifkan:</p>
            <ol className="list-decimal list-inside space-y-1 mb-2">
              <li>Buka <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary-500">aistudio.google.com/apikey</a>, login pakai akun Google, klik "Create API key". Gratis untuk pemakaian personal dalam batas kuota.</li>
              <li>Copy API key yang muncul (diawali "AIza...").</li>
              <li>Buka Settings → tab General di aplikasi ini, tempel di kolom "Gemini API key".</li>
              <li>Buka menu AI Assistant di sidebar, langsung bisa dipakai.</li>
            </ol>
            <p className="text-xs">⚠️ API key ini cuma tersimpan di browser kamu (localStorage), tidak pernah ikut ter-upload ke GitHub atau ke build aplikasi. Tapi tetap jangan share API key ke orang lain, dan jangan taruh di file <code>.env</code> kalau aplikasi ini di-deploy publik — karena isi <code>.env</code> ikut terbundle ke kode yang bisa dilihat siapa saja.</p>
          </AccordionItem>
          <AccordionItem title="Setup Firebase (opsional, buat sinkron ke cloud)" icon={CloudCog}>
            <p className="mb-2">Secara default aplikasi ini jalan 100% lokal di browser kamu (mode "Local mode") — tidak wajib pakai Firebase sama sekali. Kalau nanti mau data kamu tersimpan online dan bisa diakses dari HP/laptop lain, ikuti langkah ini:</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-primary-500">console.firebase.google.com</a>, login dengan akun Google, klik "Add project" / "Tambahkan project", ikuti wizard-nya (nama bebas, boleh matikan Google Analytics kalau tidak perlu).</li>
              <li>Di dashboard project, klik ikon <code>&lt;/&gt;</code> (Web) untuk daftarkan "Web app" baru. Kasih nama bebas, tidak perlu centang Firebase Hosting.</li>
              <li>Setelah itu Firebase akan menampilkan blok <code>firebaseConfig</code> berisi <code>apiKey</code>, <code>authDomain</code>, <code>projectId</code>, dst. Simpan halaman ini / jangan ditutup dulu.</li>
              <li>Di menu kiri Firebase Console, buka <b>Build → Authentication</b> → klik "Get started" → aktifkan minimal provider "Email/Password" (atau juga "Google" kalau mau login pakai Google).</li>
              <li>Buka <b>Build → Firestore Database</b> → "Create database" → pilih lokasi server terdekat → mode "Start in test mode" dulu supaya gampang (nanti bisa diperketat lewat Security Rules).</li>
              <li>Buka <b>Build → Storage</b> → "Get started" → lanjut sampai selesai (dipakai untuk upload file & cover Library).</li>
              <li>Di dalam folder project aplikasi ini, cari file <code>.env.example</code>, duplikat lalu ubah namanya jadi <code>.env</code>.</li>
              <li>Isi tiap baris di <code>.env</code> dengan nilai yang sesuai dari <code>firebaseConfig</code> di langkah 3 (contoh: <code>VITE_FIREBASE_API_KEY=</code> diisi nilai <code>apiKey</code>, dan seterusnya).</li>
              <li>Simpan file, lalu jalankan ulang <code>npm run dev</code> (kalau lagi development) atau <code>npm run build</code> ulang (kalau mau deploy). Aplikasi otomatis mendeteksi <code>.env</code> ini dan pindah dari "Local mode" ke "Connected to Firebase" — bisa dicek statusnya di Settings → General → Connection.</li>
            </ol>
            <p className="text-xs mt-2">Kalau cuma dipakai sendiri di satu browser/HP, langkah ini boleh dilewati saja — Local mode sudah cukup dan datanya tetap aman tersimpan di perangkat kamu.</p>
          </AccordionItem>
        </div>
      </Card>
    </div>
  )
}
