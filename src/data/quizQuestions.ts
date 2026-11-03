export interface Question {
  id: number;
  question: string;
  options: {
    key: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation: string;
}

export const PRETEST_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Apa yang dimaksud dengan DNA?",
    options: [
      { key: "A", text: "Materi genetik yang menyimpan informasi genetik." },
      { key: "B", text: "Zat yang menghasilkan energi." },
      { key: "C", text: "Bagian sel yang mencerna makanan." },
      { key: "D", text: "Zat yang mengangkut oksigen." },
    ],
    correctAnswer: "A",
    explanation: "DNA (Deoxyribonucleic Acid) adalah materi genetik makromolekul polimer nukleotida yang menyimpan instruksi cetak biru biologis hereditas bagi pertumbuhan, metabolisme, dan pewarisan sifat pada organisme hidup.",
  },
  {
    id: 2,
    question: "Apa tujuan isolasi DNA?",
    options: [
      { key: "A", text: "Menghancurkan seluruh isi sel." },
      { key: "B", text: "Memisahkan DNA dari komponen sel lainnya." },
      { key: "C", text: "Mengubah DNA menjadi protein." },
      { key: "D", text: "Memperbanyak jumlah sel." },
    ],
    correctAnswer: "B",
    explanation: "Tujuan utama isolasi DNA adalah mengekstraksi dan memisahkan asam deoksiribonukleat (DNA) murni dari makromolekul seluler lain seperti lipid membran, protein globular/struktural, polisakarida, dan RNA.",
  },
  {
    id: 3,
    question: "Apa fungsi alat sentrifugasi dalam isolasi DNA?",
    options: [
      { key: "A", text: "Mengukur suhu sampel." },
      { key: "B", text: "Mengamati bentuk DNA." },
      { key: "C", text: "Memisahkan komponen sampel melalui pemutaran berkecepatan tinggi." },
      { key: "D", text: "Mengukur konsentrasi DNA." },
    ],
    correctAnswer: "C",
    explanation: "Sentrifus memanfaatkan gaya sentrifugal (RCF) berkecepatan tinggi untuk memisahkan molekul berdasarkan massa jenis dan ukuran sedimentasi, memisahkan fraksi debris kasar dan mengendapkan pelet nukleat.",
  },
  {
    id: 4,
    question: "Apa fungsi spektrofotometer dalam analisis DNA?",
    options: [
      { key: "A", text: "Menghancurkan jaringan." },
      { key: "B", text: "Memisahkan komponen sel." },
      { key: "C", text: "Memperbanyak DNA." },
      { key: "D", text: "Mengukur penyerapan cahaya oleh sampel." },
    ],
    correctAnswer: "D",
    explanation: "Spektrofotometer UV-Vis mengukur kuantitas absorbansi cahaya ultraviolet oleh cincin purin/pirimidin pada panjang gelombang spesifik (260 nm dan 280 nm) untuk menghitung konsentrasi dan rasio kemurnian sampel.",
  },
  {
    id: 5,
    question: "Mengapa DNA perlu dianalisis setelah proses isolasi?",
    options: [
      { key: "A", text: "Untuk mengetahui konsentrasi dan kemurnian DNA." },
      { key: "B", text: "Untuk mengubah DNA menjadi sel." },
      { key: "C", text: "Untuk menghilangkan seluruh komponen sel." },
      { key: "D", text: "Untuk memperbesar ukuran DNA." },
    ],
    correctAnswer: "A",
    explanation: "Analisis kuantitatif dan kualitatif pasca-isolasi sangat penting untuk memverifikasi konsentrasi (ng/µL) dan kemurnian (rasio A260/A280) sebelum sampel digunakan dalam PCR, sekuensing, atau kloning.",
  },
];

export const POSTTEST_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Pada saat jaringan tumbuhan dihancurkan, sampel berubah menjadi bubur. Apa tujuan tahap tersebut dalam isolasi DNA?",
    options: [
      { key: "A", text: "Memisahkan DNA berdasarkan konsentrasinya." },
      { key: "B", text: "Membantu membuka struktur jaringan agar komponen sel dapat dilepaskan." },
      { key: "C", text: "Mengukur kemurnian DNA." },
      { key: "D", text: "Mengendapkan DNA menggunakan sentrifugasi." },
    ],
    correctAnswer: "B",
    explanation: "Penghancuran mekanis menggunakan mortar dan alu merusak integritas dinding sel selulosa tumbuhan Allium cepa sehingga membran sel dan sitosol terbuka dan memudahkan penetrasi buffer lisis.",
  },
  {
    id: 2,
    question: "Setelah larutan lisis ditambahkan, membran sel mengalami kerusakan. Apa dampaknya terhadap proses isolasi DNA?",
    options: [
      { key: "A", text: "DNA dapat dilepaskan dari dalam sel." },
      { key: "B", text: "DNA langsung terukur oleh spektrofotometer." },
      { key: "C", text: "DNA berubah menjadi protein." },
      { key: "D", text: "DNA langsung terpisah berdasarkan ukurannya." },
    ],
    correctAnswer: "A",
    explanation: "Buffer lisis mengandung surfaktan atau deterjen (seperti SDS) yang melarutkan lipid bilayer membran sel dan membran inti sel, membebaskan kromatin DNA ke dalam larutan homogen.",
  },
  {
    id: 3,
    question: "Seorang praktikan menggunakan kecepatan sentrifugasi yang berbeda dari parameter pada simulasi. Apa yang perlu diperhatikan?",
    options: [
      { key: "A", text: "Warna tabung setelah digunakan." },
      { key: "B", text: "Jumlah tombol pada alat." },
      { key: "C", text: "Pengaruh perubahan kecepatan terhadap pemisahan komponen sampel." },
      { key: "D", text: "Bentuk luar sentrifugator." },
    ],
    correctAnswer: "C",
    explanation: "Perubahan kecepatan putar (RPM atau RCF) secara langsung menentukan gaya sentrifugal. Jika terlalu rendah debris tidak mengendap sempurna, jika terlalu tinggi tanpa kontrol dapat mendegradasi molekul atau merusak tabung.",
  },
  {
    id: 4,
    question: "Setelah sentrifugasi, terlihat endapan di bagian bawah tabung dan cairan di bagian atas. Pernyataan yang tepat adalah:",
    options: [
      { key: "A", text: "Seluruh endapan pasti merupakan DNA murni." },
      { key: "B", text: "Cairan di bagian atas pasti tidak mengandung DNA." },
      { key: "C", text: "Sentrifugasi telah memperbanyak DNA." },
      { key: "D", text: "Sampel telah mengalami pemisahan menjadi fraksi yang perlu diidentifikasi sesuai prosedur." },
    ],
    correctAnswer: "D",
    explanation: "Fraksinasi sentrifugasi menghasilkan pelet dan supernatan. Tergantung tahapan isolasi (pemisahan debris atau presipitasi etanol), praktikan harus mengidentifikasi fraksi mana yang mengandung DNA genom.",
  },
  {
    id: 5,
    question: "Mengapa praktikan harus berhati-hati ketika mengambil supernatan setelah sentrifugasi?",
    options: [
      { key: "A", text: "Agar tabung berubah warna." },
      { key: "B", text: "Agar endapan tidak tercampur kembali jika pemisahan fraksi perlu dipertahankan." },
      { key: "C", text: "Agar DNA dapat diperbanyak." },
      { key: "D", text: "Agar spektrofotometer bekerja lebih cepat." },
    ],
    correctAnswer: "B",
    explanation: "Resuspensi yang tidak disengaja terhadap endapan pelet dapat mengontaminasi kembali cairan supernatan yang sedang dipipet, menurunkan kemurnian DNA yang diisolasi.",
  },
  {
    id: 6,
    question: "Ketika menggunakan spektrofotometer, praktikan memperoleh hasil konsentrasi DNA yang berbeda dari percobaan sebelumnya. Apa tindakan yang tepat?",
    options: [
      { key: "A", text: "Langsung mengubah angka hasil pengukuran." },
      { key: "B", text: "Memilih hasil yang paling tinggi." },
      { key: "C", text: "Memeriksa prosedur pengukuran dan kondisi sampel." },
      { key: "D", text: "Mengabaikan seluruh hasil pengukuran." },
    ],
    correctAnswer: "C",
    explanation: "Sikap ilmiah menuntut evaluasi metodologis yang jujur: memeriksa ketepatan blanking, volume pipetting, kebersihan kuvet kuarsa, serta konsistensi pelarutan sampel DNA dalam buffer TE.",
  },
  {
    id: 7,
    question: "Mengapa pengukuran kemurnian DNA perlu dilakukan selain pengukuran konsentrasi?",
    options: [
      { key: "A", text: "Karena konsentrasi dan kemurnian menunjukkan aspek kualitas DNA yang berbeda." },
      { key: "B", text: "Karena konsentrasi tidak dapat diukur dengan spektrofotometer." },
      { key: "C", text: "Karena kemurnian menunjukkan jumlah tabung yang digunakan." },
      { key: "D", text: "Karena DNA murni tidak memiliki konsentrasi." },
    ],
    correctAnswer: "A",
    explanation: "Konsentrasi menunjukkan kuantitas massa DNA per satuan volume, sedangkan rasio kemurnian (A260 per A280) mendeteksi ada tidaknya kontaminan penghambat seperti protein, fenol, atau RNA.",
  },
  {
    id: 8,
    question: "Hasil pengukuran menunjukkan rasio A260 per A280 yang jauh dari nilai acuan DNA murni. Apa kemungkinan yang perlu dipertimbangkan?",
    options: [
      { key: "A", text: "Sentrifugator pasti rusak." },
      { key: "B", text: "DNA pasti tidak terdapat dalam sampel." },
      { key: "C", text: "Sampel pasti memiliki konsentrasi tinggi." },
      { key: "D", text: "Sampel mungkin mengalami kontaminasi atau terdapat gangguan pengukuran." },
    ],
    correctAnswer: "D",
    explanation: "Rasio kurang dari 1.6 mengindikasikan kontaminasi protein aromatik atau fenol sisa, sedangkan rasio lebih dari 2.0 mengindikasikan kontaminasi RNA atau residual reagen alkohol.",
  },
  {
    id: 9,
    question: "Dua kelompok melakukan isolasi DNA dengan massa jaringan awal yang berbeda. Mengapa konsentrasi DNA yang diperoleh dapat berbeda?",
    options: [
      { key: "A", text: "Karena semua sampel selalu menghasilkan konsentrasi sama." },
      { key: "B", text: "Karena massa jaringan awal, efisiensi isolasi, dan kondisi pengukuran dapat memengaruhi hasil." },
      { key: "C", text: "Karena spektrofotometer mengubah massa jaringan menjadi DNA." },
      { key: "D", text: "Karena sentrifugasi selalu menghilangkan seluruh DNA." },
    ],
    correctAnswer: "B",
    explanation: "Kuantitas DNA berbanding lurus dengan jumlah sel pada biomassa awal bawang bombai, dipengaruhi oleh efisiensi homogenisasi mekanis, kelarutan lisis, dan volume akhir buffer resuspensi.",
  },
  {
    id: 10,
    question: "Berdasarkan seluruh tahapan virtual lab, indikator yang paling tepat untuk mengevaluasi keberhasilan isolasi DNA adalah:",
    options: [
      { key: "A", text: "Banyaknya tombol yang ditekan selama simulasi." },
      { key: "B", text: "Lamanya praktikan menggunakan komputer." },
      { key: "C", text: "Hasil pemisahan sampel serta data konsentrasi dan kemurnian DNA." },
      { key: "D", text: "Warna tampilan antarmuka virtual lab." },
    ],
    correctAnswer: "C",
    explanation: "Keberhasilan isolasi DNA biologis dinilai secara holistik dari terbentuknya fraksi yang terpisah sempurna, rendemen konsentrasi (ng per µL yang memadai), dan rasio kemurnian A260 per A280 mendekati 1.8.",
  },
];
