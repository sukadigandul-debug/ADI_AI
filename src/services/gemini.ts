import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  // Use process.env.GEMINI_API_KEY which is defined in vite.config.ts
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  if (!apiKey) {
    throw new Error("API Key belum dikonfigurasi. Silakan klik tombol 'Set API Key' di sidebar.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const generateMateri = async (subject: string, chapter: string, religion?: string) => {
  const ai = getAI();
  const subjectName = subject === "Pendidikan Agama" ? `Pendidikan Agama ${religion}` : subject;
  const prompt = `Buatkan materi pelajaran yang lengkap dan komprehensif untuk mata pelajaran ${subjectName}, Bab: ${chapter}. 
  Struktur materi harus terdiri dari:
  1. Judul Bab
  2. Pendahuluan
  3. Pembahasan Materi (beberapa sub-bab)
  4. Kesimpulan
  5. Referensi singkat.
  Gunakan format Markdown. Berikan penjelasan yang mendalam namun mudah dipahami.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    if (!response.text) {
      throw new Error("Model tidak mengembalikan teks. Periksa kuota atau saldo API Anda.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("Model tidak ditemukan atau API Key tidak valid untuk model ini. Pastikan Anda menggunakan API Key dari proyek Google Cloud dengan billing aktif.");
    }
    throw error;
  }
};

export const generateModulAjar = async (identitas: any, cp: string, atp: string) => {
  const ai = getAI();
  const prompt = `Berdasarkan data berikut, buatkan Modul Ajar yang lengkap:
  Identitas:
  - Nama Penyusun: ${identitas.nama}
  - Satuan Pendidikan: ${identitas.sekolah}
  - Fase/Kelas: ${identitas.fase}
  - Mata Pelajaran: ${identitas.mapel}
  - Alokasi Waktu: ${identitas.waktu}
  
  Capaian Pembelajaran (CP): ${cp}
  Alur Tujuan Pembelajaran (ATP): ${atp}
  
  Profil Lulusan (Dimensi): ${identitas.profil.join(", ")}
  
  Struktur Modul Ajar harus mencakup:
  1. Identitas Modul
  2. Kompetensi Awal
  3. Profil Pelajar Pancasila
  4. Sarana dan Prasarana
  5. Target Peserta Didik
  6. Model Pembelajaran
  7. Tujuan Pembelajaran
  8. Pemahaman Bermakna
  9. Pertanyaan Pemantik
  10. Kegiatan Pembelajaran (Pendahuluan, Inti, Penutup)
  11. Asesmen
  12. Pengayaan dan Remedial
  
  Gunakan format Markdown yang rapi.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    if (!response.text) {
      throw new Error("Model tidak mengembalikan teks.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateAsesmen = async (config: any) => {
  const ai = getAI();
  const { subject, religion, type, level, questionType, count, optionsCount } = config;
  const subjectName = subject === "Pendidikan Agama" ? `Pendidikan Agama ${religion}` : subject;
  
  let formatPrompt = "";
  if (questionType === "Pilihan Ganda") {
    formatPrompt = `Buatlah ${count} soal pilihan ganda dengan ${optionsCount} pilihan jawaban. Berikan kunci jawaban di bagian akhir.`;
  } else if (questionType === "Menjodohkan") {
    formatPrompt = `Buatlah ${count} soal menjodohkan. Berikan kunci jawaban di bagian akhir.`;
  } else {
    formatPrompt = `Buatlah ${count} soal isian singkat. Berikan kunci jawaban di bagian akhir.`;
  }

  const prompt = `Buatlah soal asesmen ${type} untuk mata pelajaran ${subjectName}.
  Level Taksonomi: ${level}
  Tingkat Kesulitan: ${config.difficulty || "Sedang"}
  ${formatPrompt}
  
  Kembalikan dalam format JSON dengan struktur:
  {
    "questions": [
      {
        "id": 1,
        "question": "teks soal",
        "options": ["A", "B", "C", "D"], // jika pilihan ganda
        "answer": "jawaban benar",
        "matchPairs": [{"left": "A", "right": "1"}] // jika menjodohkan
      }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("Model tidak mengembalikan data soal.");
    }

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
