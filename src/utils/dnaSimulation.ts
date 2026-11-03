/**
 * DNA Isolation Physics & Biochemistry Calculation Engine
 * Accurately models the biochemical and physical dynamics of
 * Allium cepa DNA extraction via centrifugation and UV-Vis spectrophotometry.
 */

export interface SimulationParams {
  massaBawang: number; // grams
  volumeLisis: number; // mL
  jumlahPenghancuran: number; // hits
  waktuPenghancuran: number; // minutes
  waktuInkubasi: number; // minutes
  kecepatanSentrifugasi: number; // RPM
  waktuSentrifugasi: number; // minutes
  volumeEtanol: number; // mL
  volumeBufferTE: number; // mL
}

export interface SimulationResult {
  volumeEkstraksi: number; // mL
  absorbansi260: number; // A260
  absorbansi280: number; // A280
  rasioKemurnian: number; // A260 / A280
  konsentrasiDNA: number; // ng/µL (or µg/mL)
  totalDNA: number; // µg
  interpretasiKemurnian: string;
  evaluasiTahapan: {
    penghancuran: string;
    lisis: string;
    sentrifugasi: string;
    presipitasi: string;
  };
}

export function calculateDnaResults(params: Partial<SimulationParams>): SimulationResult {
  const mass = Math.max(0.5, params.massaBawang ?? 15.0);
  const lysisVol = Math.max(0.5, params.volumeLisis ?? 15.0);
  const hits = Math.max(1, params.jumlahPenghancuran ?? 30);
  const rpm = Math.max(1000, params.kecepatanSentrifugasi ?? 8000);
  const centTime = Math.max(1, params.waktuSentrifugasi ?? 10);
  const ethanolVol = Math.max(0.2, params.volumeEtanol ?? 2.0);
  const teVol = Math.max(0.1, params.volumeBufferTE ?? 0.5);

  // 1. Filtrate Volume Estimation
  // Onion juice release ~ 80% of mass + ~70% of lysis buffer recovered after filtration
  const volumeEkstraksi = Math.round((mass * 0.78 + lysisVol * 0.72) * 10) / 10;

  // 2. Mechanical Crushing Efficiency (Cell Wall Breakdown)
  // Plant cell walls of Allium cepa require sufficient mechanical disruption.
  let fCrush = 1.0;
  let evalPenghancuran = 'Penghancuran optimal, dinding sel pecah sempurna.';
  if (hits < 15) {
    fCrush = 0.35 + (hits / 15) * 0.35; // 0.35 - 0.70
    evalPenghancuran = 'Penumbukan terlalu sedikit (<15 kali), banyak sel belum pecah sehingga rendemen DNA rendah.';
  } else if (hits <= 45) {
    fCrush = 0.95 + (hits / 45) * 0.05; // ~1.0
    evalPenghancuran = 'Penumbukan optimal (15-45 kali), dinding sel lisis tanpa merusak integritas untai DNA.';
  } else {
    // Excessive crushing shears high-molecular weight DNA
    fCrush = Math.max(0.70, 1.0 - ((hits - 45) / 100) * 0.35);
    evalPenghancuran = 'Penumbukan berlebih (>45 kali), terjadi mechanical shearing (pemotongan fisik rantai ganda DNA).';
  }

  // 3. Chemical Lysis Buffer Ratio (Detergent & Salt Efficiency)
  // Optimal ratio is ~1 mL lysis buffer per 1 g onion
  const ratioLysisToMass = lysisVol / mass;
  let fLysis = 1.0;
  let evalLisis = 'Buffer lisis proporsional, membran fosfolipid terlarut baik.';
  if (ratioLysisToMass < 0.5) {
    fLysis = 0.55;
    evalLisis = 'Volume buffer lisis terlalu sedikit (<0.5 mL/g), solubilisasi membran inti tidak tuntas.';
  } else if (ratioLysisToMass > 2.5) {
    fLysis = 0.80; // Dilution effect
    evalLisis = 'Volume buffer lisis berlebih (>2.5 mL/g), larutan terlalu encer menurunkan efisiensi presipitasi.';
  } else {
    fLysis = 1.0;
  }

  // 4. Centrifugation Efficiency & Protein Clearance
  // RPM below 5000 cannot pellet denatured protein complexes effectively.
  let fCentrifuge = 1.0;
  let proteinContaminationA280 = 0.0;
  let evalSentrifugasi = 'Pemisahan sentrifugasi optimal, pelet padat dan supernatan jernih.';

  if (rpm < 4000) {
    fCentrifuge = 0.65;
    proteinContaminationA280 = 0.28 + ((4000 - rpm) / 4000) * 0.25; // Large A280 inflation
    evalSentrifugasi = `Kecepatan sentrifugasi sangat rendah (${rpm} RPM), debris sel & protein tidak mengendap sempurna (supernatan keruh).`;
  } else if (rpm < 7000) {
    fCentrifuge = 0.85;
    proteinContaminationA280 = 0.10 + ((7000 - rpm) / 3000) * 0.15;
    evalSentrifugasi = `Kecepatan sentrifugasi sedang (${rpm} RPM), masih terdapat sedikit residu protein terlarut.`;
  } else if (rpm <= 10000) {
    fCentrifuge = 1.0;
    proteinContaminationA280 = 0.0;
    evalSentrifugasi = `Kecepatan sentrifugasi ideal (${rpm} RPM selama ${centTime} menit), pelet protein terpisah sempurna.`;
  } else {
    // Very high speed >10,000 RPM
    fCentrifuge = 0.96;
    proteinContaminationA280 = 0.0;
    evalSentrifugasi = `Kecepatan sentrifugasi tinggi (${rpm} RPM), pelet sangat padat, pemisahan bersih.`;
  }

  // Time penalty if centrifuging < 5 minutes
  if (centTime < 5) {
    proteinContaminationA280 += 0.12 * ((5 - centTime) / 5);
    fCentrifuge *= 0.80;
  }

  // 5. Ethanol Precipitation
  // DNA precipitates optimally with ~2 volumes of chilled 95% ethanol
  let fPrecip = 1.0;
  let evalPresipitasi = 'Presipitasi etanol dingin optimal, benang-benang DNA terbentuk jelas.';
  if (ethanolVol < 1.0) {
    fPrecip = 0.45;
    evalPresipitasi = 'Volume etanol dingin terlalu sedikit (<1.0 mL), konstanta dielektrik belum cukup turun untuk mengendapkan DNA.';
  } else if (ethanolVol >= 1.5 && ethanolVol <= 3.5) {
    fPrecip = 1.0;
  } else {
    fPrecip = 0.95;
  }

  // 6. Base DNA Yield & Absorbances
  // Theoretical onion DNA yield: ~25 - 35 µg per 15 g fresh tissue under perfect conditions
  const theoreticalYieldPerGram = 1.8; // µg DNA / g tissue
  const rawYield = mass * theoreticalYieldPerGram * fCrush * fLysis * fCentrifuge * fPrecip;
  const totalDNA = Math.max(0.5, Math.round(rawYield * 10) / 10); // in µg

  // Concentration in ng/µL (equivalent to µg/mL):
  // concentration = totalDNA (µg) / teVol (mL)
  const konsentrasiDNA = Math.max(1.0, Math.round((totalDNA / teVol) * 10) / 10);

  // Beer-Lambert Law for double stranded DNA:
  // 1.0 A260 unit = 50 ng/µL (or 50 µg/mL) of pure dsDNA with 1 cm path length
  const idealA260 = konsentrasiDNA / 50;
  const absorbansi260 = Math.max(0.02, Math.round(idealA260 * 1000) / 1000);

  // Ideal pure DNA has A260 / A280 = 1.82
  // With protein contamination, A280 increases significantly
  const idealA280 = absorbansi260 / 1.82;
  const absorbansi280 = Math.max(0.015, Math.round((idealA280 + proteinContaminationA280) * 1000) / 1000);

  const rasioKemurnian = Math.round((absorbansi260 / absorbansi280) * 100) / 100;

  // Interpretasi
  let interpretasiKemurnian = '';
  if (rasioKemurnian >= 1.75 && rasioKemurnian <= 1.95) {
    interpretasiKemurnian = 'DNA Murni Sangat Baik (A260/A280 ~1.8). Bebas dari kontaminasi protein atau pelarut organik berlebih, sangat sesuai untuk analisis PCR dan sekuensing genetik.';
  } else if (rasioKemurnian < 1.75) {
    interpretasiKemurnian = `Kemurnian Rendah (Rasio ${rasioKemurnian.toFixed(2)} < 1.75). Terdeteksi kontaminasi residu protein atau fenol akibat pemisahan sentrifugasi yang kurang optimal.`;
  } else {
    interpretasiKemurnian = `Kemurnian Menyimpang (Rasio ${rasioKemurnian.toFixed(2)} > 1.95). Terindikasi kontaminasi residual RNA atau sisa alkohol/etanol dalam suspensi DNA.`;
  }

  return {
    volumeEkstraksi,
    absorbansi260,
    absorbansi280,
    rasioKemurnian,
    konsentrasiDNA,
    totalDNA,
    interpretasiKemurnian,
    evaluasiTahapan: {
      penghancuran: evalPenghancuran,
      lisis: evalLisis,
      sentrifugasi: evalSentrifugasi,
      presipitasi: evalPresipitasi,
    },
  };
}
