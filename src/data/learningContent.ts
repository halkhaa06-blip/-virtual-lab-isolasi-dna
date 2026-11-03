export interface SubTopic {
  title: string;
  content: string[];
  keyPoints?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface TopicSection {
  id: string;
  letter: string;
  title: string;
  summary: string;
  subtopics: SubTopic[];
}

export const LEARNING_OBJECTIVES = [
  "Mengidentifikasi alat dan bahan isolasi DNA bawang bombai.",
  "Menjelaskan fungsi alat dan bahan dalam proses isolasi DNA.",
  "Mengurutkan tahapan isolasi DNA mulai dari preparasi hingga analisis.",
  "Menjelaskan prinsip lisis dinding sel dan membran sel secara mekanik dan kimiawi.",
  "Menjelaskan prinsip kerja sentrifugasi berdasarkan gaya sedimentasi.",
  "Mengidentifikasi fraksi pelet dan supernatan hasil sentrifugasi.",
  "Menjelaskan prinsip spektrofotometri UV pada asam nukleat.",
  "Menentukan panjang gelombang spesifik pengukuran DNA (260 nm dan 280 nm).",
  "Menghitung konsentrasi DNA menggunakan hukum Beer-Lambert.",
  "Menginterpretasikan rasio absorbansi A260/A280 untuk estimasi kemurnian.",
  "Menganalisis hasil isolasi DNA berdasarkan parameter rendemen dan kemurnian.",
  "Mengevaluasi faktor-faktor kritis yang memengaruhi kualitas dan integritas DNA."
];

export const LEARNING_SECTIONS: TopicSection[] = [
  {
    id: "dasar-dna",
    letter: "A",
    title: "Dasar-Dasar DNA dan Biologi Molekuler",
    summary: "Memahami struktur heliks ganda, komponen nukleotida, peran genetik, dan lokalisasi DNA dalam sel eukariotik tumbuhan.",
    subtopics: [
      {
        title: "Pengertian dan Fungsi Utama DNA",
        content: [
          "DNA (Deoxyribonucleic Acid) atau asam deoksiribonukleat adalah biomolekul polimer makronukleotida yang bertindak sebagai materi genetik pembawa informasi hereditas pada seluruh organisme seluler dan sebagian besar virus.",
          "Fungsi esensial DNA meliputi penyimpanan informasi sintesis protein, replikasi diri secara semikonservatif saat pembelahan sel, serta pengatur seluruh aktivitas biokimiawi sel melalui transkripsi RNA."
        ],
        keyPoints: [
          "DNA merupakan cetak biru (blueprint) kehidupan.",
          "Membawa kode kodon triplet untuk asam amino.",
          "Bawang bombai (Allium cepa) memiliki ukuran genom besar (sekitar 16 Gbp per genom haploid) sehingga menjadi model ideal untuk ekstraksi DNA makroskopis di sekolah."
        ]
      },
      {
        title: "Struktur dan Komponen Nukleotida",
        content: [
          "DNA tersusun atas monomer yang disebut nukleotida. Setiap nukleotida tersusun atas tiga komponen: gugus fosfat bermuatan negatif, gula pentosa deoksiribosa (kehilangan satu atom oksigen pada atom C-2'), dan satu basa nitrogen.",
          "Basa nitrogen terdiri dari kelompok Purin (Adenin [A] dan Guanin [G]) serta kelompok Pirimidin (Timin [T] dan Sitosin [C]). Pasangan basa dihubungkan oleh ikatan hidrogen spesifik: A berikatan ganda dengan T (2 ikatan hidrogen), dan G berikatan rangkap tiga dengan C (3 ikatan hidrogen)."
        ],
        tableData: {
          headers: ["Komponen", "Karakteristik Kimia", "Peran dalam Isolasi"],
          rows: [
            ["Gugus Fosfat", "Bermuatan sangat negatif (-PO4 3-)", "Membuat DNA larut dalam air polar, berinteraksi dengan ion garam Na+ saat presipitasi."],
            ["Gula Deoksiribosa", "Pentosa tanpa gugus 2'-OH", "Memberikan stabilitas kimiawi lebih tinggi dibanding ribosa pada RNA."],
            ["Basa Purin & Pirimidin", "Cincin aromatik terkonjugasi", "Menyerap radiasi cahaya ultraviolet kuat dengan puncak absorbansi pada panjang gelombang 260 nm."]
          ]
        }
      },
      {
        title: "Lokasi DNA di dalam Sel Tumbuhan",
        content: [
          "Pada sel eukariotik bawang bombai (Allium cepa), DNA genomik terbesar berada di dalam inti sel (nukleus), terkemas bersama protein histon menjadi serat kromatin.",
          "Sebagian kecil DNA sirkular juga berada di dalam organel semiotonom yaitu mitokondria (mtDNA) dan plastida/kloroplas (cpDNA). Untuk mengisolasi DNA, kita harus menembus dinding selulosa, membran plasma sel, dan selubung membran ganda inti sel."
        ]
      }
    ]
  },
  {
    id: "konsep-isolasi",
    letter: "B",
    title: "Konsep Umum Isolasi DNA",
    summary: "Prinsip dasar pemisahan DNA genomik dari biomolekul seluler kontaminan secara bertahap dan steril.",
    subtopics: [
      {
        title: "Pengertian dan Tujuan Isolasi DNA",
        content: [
          "Isolasi DNA adalah serangkaian prosedur biokimia dan fisik untuk memisahkan DNA intak dari komponen seluler lainnya (dinding sel, membran lipid, protein, metabolit sekunder, dan RNA).",
          "Tujuannya adalah menghasilkan DNA berkualitas tinggi yang siap digunakan untuk aplikasi bioteknologi hilir seperti PCR (Polymerase Chain Reaction), sekuensing DNA, rekayasa genetika, analisis sidik jari DNA (DNA profiling), dan kloning gen."
        ]
      },
      {
        title: "Tahapan Inti Isolasi DNA",
        content: [
          "1. Preparasi & Lisis Mekanik: Menghancurkan jaringan tumbuhan menggunakan mortar dan alu untuk merobek dinding sel berkutikula.",
          "2. Lisis Kimiawi: Melarutkan membran fosfolipid sel dan membran inti menggunakan deterjen/buffer lisis serta menginaktivasi enzim nuklease perusak DNA.",
          "3. Filtrasi / Sentrifugasi Awal: Memisahkan debris fragmen jaringan kasar dari cairan ekstrak yang mengandung asam nukleat terlarut.",
          "4. Presipitasi DNA: Menurunkan kelarutan DNA menggunakan alkohol dingin (etanol 95% atau isopropanol) dengan bantuan ion monovalen (Na+) hingga untai DNA mengendap.",
          "5. Pencucian & Pelarutan Ulang: Mencuci pelet DNA dari sisa garam dan melarutkannya kembali dalam buffer TE pH 8.0 stabil."
        ],
        tableData: {
          headers: ["Tahap", "Tindakan di Lab", "Efek Molekuler"],
          rows: [
            ["Lisis Sel", "Penumbukan + Buffer SDS", "Integritas membran lipid hancur, kromatin terlepas."],
            ["Pemisahan Debris", "Filtrasi kertas saring / Sentrifugasi", "Serat selulosa dan ampas jaringan tertahan."],
            ["Presipitasi", "Penambahan Etanol 95% dingin", "Dehidrasi lapisan hidrasi DNA, untai DNA memadat/menggumpal."],
            ["Resuspensi", "Buffer TE (Tris-EDTA)", "DNA larut kembali dalam lingkungan pH stabil terlindung dari DNase."]
          ]
        }
      }
    ]
  },
  {
    id: "larutan-reagen",
    letter: "C",
    title: "Larutan dan Reagen dalam Isolasi DNA",
    summary: "Komposisi biokimia buffer lisis, etanol absolut, dan buffer TE beserta mekanisme aksinya.",
    subtopics: [
      {
        title: "Buffer Lisis (Larutan Ekstraksi)",
        content: [
          "Buffer lisis diformulasikan khusus untuk merusak membran bilayer dan melindungi integritas DNA dari degradasi enzimatis.",
          "Komponen utamanya mencakup: Tris-HCl untuk menjaga pH stabil (pH 8.0); EDTA (Ethylenediaminetetraacetic acid) sebagai agen pengkhelat ion divalen (Mg2+, Ca2+) yang merupakan kofaktor wajib enzim deoksiribonuklease (DNase); SDS (Sodium Dodecyl Sulfate) atau deterjen anionik untuk melarutkan lipid membran dan mendenaturasi protein; serta NaCl untuk menyediakan ion Na+ yang menetralkan muatan negatif fosfat DNA."
        ],
        keyPoints: [
          "Tris-HCl: Penjaga pH fisiologis agar rantai DNA tidak mengalami hidrolisis asam.",
          "EDTA: Melumpuhkan enzim DNase perusak dengan mengikat ion Mg2+.",
          "SDS: Deterjen pelarut lipid bilayer membran sel dan nukleus.",
          "NaCl: Menetralkan tolakan elektrostatik antar rantai fosfat DNA."
        ]
      },
      {
        title: "Etanol 95% Dingin",
        content: [
          "DNA memiliki konstanta dielektrik yang tinggi dan sangat larut dalam air karena molekul air membentuk mantel hidrasi di sekeliling gugus fosfat bermuatan negatif.",
          "Ketika etanol dingin (konstanta dielektrik rendah) ditambahkan, mantel hidrasi air diserap oleh etanol, memungkinkan kation Na+ menempel erat pada muatan negatif gugus fosfat (-PO4 3-). Fenomena ini menurunkan gaya tolak-menolak elektrostatik antar untai DNA, sehingga DNA mengagregasi dan mempresipitasi membentuk gumpalan benang putih halus yang kasat mata."
        ]
      },
      {
        title: "Buffer TE (Tris-EDTA)",
        content: [
          "Buffer TE (10 mM Tris-HCl, 1 mM EDTA, pH 8.0) adalah larutan standar penyimpanan DNA murni.",
          "Buffer ini menjaga pH basa lemah di mana DNA paling stabil, sekaligus menyediakan sedikit EDTA untuk mencegah aktivitas sisa enzim nuklease kontaminan selama penyimpanan jangka panjang di lemari pembeku."
        ]
      }
    ]
  },
  {
    id: "sentrifugasi",
    letter: "D",
    title: "Sentrifugasi dalam Isolasi DNA",
    summary: "Mekanisme gaya sentrifugal (RCF), pemisahan fase pelet dan supernatan, serta prinsip keseimbangan rotor.",
    subtopics: [
      {
        title: "Prinsip Fisika Sentrifus",
        content: [
          "Sentrifugasi adalah metode pemisahan partikel dalam suspensi cairan berdasarkan perbedaan ukuran, bentuk, dan kerapatan massa jenis partikel di bawah pengaruh percepatan medan gravitasi buatan (gaya sentrifugal).",
          "Kecepatan sentrifugasi dinyatakan dalam RPM (Revolutions Per Minute). Gaya sebenarnya yang dialami partikel disebut RCF (Relative Centrifugal Field) atau gaya-g, yang dihitung dengan rumus: RCF = 1.118 × 10^-5 × r × (RPM)^2, di mana r adalah jari-jari rotor dalam sentimeter."
        ]
      },
      {
        title: "Pelet vs Supernatan",
        content: [
          "Setelah proses sentrifugasi selesai, isi tabung sentrifus akan terbagi menjadi dua bagian nyata:",
          "1. Pelet (Pellet): Endapan massa partikel padat atau molekul berkerapatan tinggi yang terkumpul rapat di dasar tabung sentrifus.",
          "2. Supernatan (Supernatant): Cairan bening yang berada di bagian atas pelet.",
          "Perhatian Penting: Pada tahap sentrifugasi pemisahan debris sel, DNA berada di dalam supernatan sedangkan debris kasar mengendap sebagai pelet. Namun pada tahap presipitasi etanol dingin berkecapatan tinggi, DNA mengendap sebagai pelet di dasar tabung!"
        ],
        tableData: {
          headers: ["Parameter", "Sentrifugasi Debris", "Sentrifugasi Presipitasi DNA"],
          rows: [
            ["Kecepatan Lazim", "4.000 – 6.000 RPM", "8.000 – 12.000 RPM"],
            ["Fraksi Target", "Supernatan (mengandung DNA terlarut)", "Pelet (mengandung agregat untai DNA)"],
            ["Fraksi Buangan", "Pelet debris dinding sel & organel", "Supernatan sisa etanol dan garam"]
          ]
        }
      },
      {
        title: "Kaidah Keselamatan & Keseimbangan Rotor",
        content: [
          "Rotor sentrifus berputar pada ribuan rotasi per menit. Tabung sentrifus harus selalu dipasang secara seimbang (counterbalance) dengan massa cairan yang setara pada slot berseberangan (180 derajat).",
          "Ketidakseimbangan beban rotor dapat menyebabkan getaran hebat yang berpotensi merusak poros motor, memecahkan tabung sampel, dan membahayakan keselamatan praktikan di laboratorium."
        ]
      }
    ]
  },
  {
    id: "spektrofotometri",
    letter: "E",
    title: "Spektrofotometri UV untuk Analisis DNA",
    summary: "Dasar absorbansi ultraviolet oleh cincin aromatik asam nukleat pada 260 nm dan protein pada 280 nm.",
    subtopics: [
      {
        title: "Prinsip Spektrofotometer UV-Vis",
        content: [
          "Spektrofotometer UV-Vis mengukur fraksi radiasi berkas cahaya monokromatik yang diserap oleh larutan senyawa kimia saat cahaya melewati kuvet optik.",
          "Asam nukleat (DNA dan RNA) memiliki cincin basa aromatik purin dan pirimidin yang memiliki ikatan rangkap terkonjugasi. Ikatan pi ini mengalami transisi elektron saat terpapar sinar UV, menghasilkan puncak serapan absorbansi khas pada panjang gelombang 260 nm."
        ]
      },
      {
        title: "Mengapa Mengukur pada 260 nm dan 280 nm?",
        content: [
          "1. Panjang gelombang 260 nm (A260): Merupakan panjang gelombang absorbansi maksimum untuk asam nukleat (DNA dan RNA).",
          "2. Panjang gelombang 280 nm (A280): Merupakan panjang gelombang serapan maksimum untuk protein, yang disebabkan oleh keberadaan asam amino cincin aromatik seperti Triptofan, Tirosin, dan Fenilalanin.",
          "Dengan membandingkan absorbansi A260 terhadap A280, kita dapat menentukan rasio kemurnian sampel DNA terhadap kontaminasi protein."
        ]
      },
      {
        title: "Peran Larutan Blanko",
        content: [
          "Larutan blanko berisi semua komponen pelarut sampel tanpa analit target (dalam hal ini buffer TE murni).",
          "Pengukuran blanko dilakukan sebelum sampel untuk mengkalibrasi instrumen (auto-zero), sehingga absorbansi yang terbaca murni berasal dari analit DNA, bukan serapan kuvet atau buffer pelarut."
        ]
      }
    ]
  },
  {
    id: "analisis-kualitas",
    letter: "F",
    title: "Analisis Konsentrasi, Kemurnian, dan Kualitas DNA",
    summary: "Kalkulasi kuantitatif konsentrasi DNA (ng/µL), rasio A260/A280, dan evaluasi hasil.",
    subtopics: [
      {
        title: "Rumus Perhitungan Konsentrasi DNA",
        content: [
          "Berdasarkan Hukum Beer-Lambert, untuk DNA untai ganda (dsDNA) dengan panjang lintasan optik kuvet kuarsa 1 cm, nilai absorbansi A260 sebesar 1.0 setara dengan konsentrasi 50 µg/mL.",
          "Rumus: Konsentrasi DNA (µg/mL) = A260 × 50 × Faktor Pengenceran.",
          "Karena 1 µg/mL setara dengan 1 ng/µL, maka konsentrasi DNA dalam ng/µL sama dengan: Konsentrasi DNA (ng/µL) = A260 × 50 (bila tanpa pengenceran tambahan).",
          "Total rendemen DNA (µg) dihitung dengan mengalikan konsentrasi DNA (µg/mL) dengan total volume akhir larutan resuspensi (mL)."
        ],
        tableData: {
          headers: ["Contoh Parameter", "Nilai", "Keterangan"],
          rows: [
            ["Absorbansi A260", "0.940", "Absorbansi pada 260 nm."],
            ["Faktor Konversi dsDNA", "50", "Koefisien ekstingsi optik standar 1 cm."],
            ["Konsentrasi DNA", "47.0 ng/µL (µg/mL)", "Hasil A260 × 50."],
            ["Volume Buffer TE", "0.5 mL", "Volume akhir sampel."],
            ["Total Rendemen DNA", "23.5 µg", "47.0 µg/mL × 0.5 mL."]
          ]
        }
      },
      {
        title: "Interpretasi Rasio Kemurnian A260/A280",
        content: [
          "Rasio A260/A280 digunakan sebagai indikator awal kemurnian asam nukleat:",
          "• Nilai Rasio 1.7 – 1.9 (Optimal ~1.8): Sampel DNA berkemurnian tinggi, sangat layak untuk reaksi PCR dan sekuensing.",
          "• Nilai Rasio < 1.6: Mengindikasikan kontaminasi protein, fenol, atau metabolit sekunder aromatik berlebih.",
          "• Nilai Rasio > 2.0: Mengindikasikan keberadaan kontaminan RNA residu atau sisa reagen organik pelarut."
        ]
      }
    ]
  },
  {
    id: "evaluasi-masalah",
    letter: "G",
    title: "Permasalahan dan Evaluasi Isolasi DNA",
    summary: "Troubleshooting kegagalan praktikum, kontaminasi, dan strategi optimasi ekstraksi.",
    subtopics: [
      {
        title: "Penyebab Konsentrasi DNA Rendah atau Tidak Terdeteksi",
        content: [
          "1. Lisis mekanik kurang memadai: Dinding sel bawang bombai belum hancur sempurna sehingga banyak sel tidak melepaskan intinya.",
          "2. Penambahan deterjen lisis tidak proporsional dengan massa biomassa bawang.",
          "3. Waktu presipitasi etanol terlalu singkat atau suhu etanol tidak cukup dingin (kurang dari 0°C).",
          "4. Pelet DNA terbuang secara tidak sengaja saat dekantasi atau aspirasi supernatan."
        ]
      },
      {
        title: "Penyebab Kemurnian Rendah (Rasio A260/A280 Janggal)",
        content: [
          "1. Resuspensi pelet debris kasar yang ikut tersedot pipet saat memisahkan fraksi supernatan.",
          "2. Busa deterjen berlebih yang masuk ke kuvet spektrofotometer dan membiasakan pembacaan optik.",
          "3. Sisa etanol yang belum menguap sempurna sebelum pelet dilarutkan dalam buffer TE.",
          "4. Kuvet tergores, kotor, atau terdapat sidik jari pada dinding optik kuvet."
        ],
        keyPoints: [
          "Gunakan pipet dengan ujung lancip dan gerakan perlahan.",
          "Pastikan kuvet dipegang hanya pada sisi buram (frosted side).",
          "Ukur blanko secara teliti pada panjang gelombang yang sama persis."
        ]
      }
    ]
  }
];
