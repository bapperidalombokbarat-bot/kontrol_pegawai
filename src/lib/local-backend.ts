// Localhost-first offline database and auth engine for SIMPEG Bapperida Lombok Barat
// Stores and persists data directly in the browser's localStorage.

export interface LocalUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface LocalSession {
  user: LocalUser;
  access_token: string;
  token_type: string;
}

const STORAGE_KEYS = {
  DB: "simpeg_local_db_v2",
  SESSION: "simpeg_local_session_v1",
} as const;

export const DEFAULT_ADMIN_USER: LocalUser = {
  id: "admin-bapperida-01",
  email: "admin@bapperida.lombokbarat.go.id",
  user_metadata: {
    full_name: "Administrator Bapperida",
  },
};

const INITIAL_DEMO_DATA = {
  profiles: [
    {
      id: "admin-bapperida-01",
      display_name: "Administrator Bapperida",
      job_title: "Pengelola Sistem Kepegawaian",
      avatar_url: null,
      preferences: {},
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  user_roles: [
    {
      id: "role-01",
      user_id: "admin-bapperida-01",
      role: "admin",
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ],
        employees: [
      {
          "id": "emp-1",
          "no_urut": 1,
          "nip": "197907262009011013",
          "birth_date": "1979-07-26",
          "name": "DENY ARIF NUGROHO, ST,ME",
          "position": "Kepala",
          "rank": "Pembina Tingkat I",
          "grade": "IV/b",
          "employment_type": "PNS",
          "retirement_category": "pimpinan_tinggi",
          "last_rank_tmt": "2025-12-31",
          "last_kgb_tmt": "2025-12-31",
          "base_salary": 5320000,
          "tpp_basic": 18500000,
          "job_class": 14,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "",
          "tmt_jabatan": "2025-12-31",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Pimpinan",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-2",
          "no_urut": 2,
          "nip": "197607022001122002",
          "birth_date": "1976-07-02",
          "name": "YULINDA IRMAYANI, ST",
          "position": "Sekretaris",
          "rank": "Pembina",
          "grade": "IV/b",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-05",
          "last_kgb_tmt": "2026-01-05",
          "base_salary": 5320000,
          "tpp_basic": 11000000,
          "job_class": 12,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "III/a",
          "tmt_jabatan": "2026-01-05",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-3",
          "no_urut": 3,
          "nip": "197610212008012007",
          "birth_date": "1976-10-21",
          "name": "AYU RISZA ANDARIROSI, ST",
          "position": "Kabid Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)",
          "rank": "Pembina",
          "grade": "IV/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-05",
          "last_kgb_tmt": "2026-01-05",
          "base_salary": 4750000,
          "tpp_basic": 11000000,
          "job_class": 12,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "III/b",
          "tmt_jabatan": "2026-01-05",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang PSDAIK",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-4",
          "no_urut": 4,
          "nip": "198301042010012015",
          "birth_date": "1983-01-04",
          "name": "REVINA MADA YUDHANI, SIP.M.H",
          "position": "Kabid Pemerintahan dan Pembangunan Manusia (P2M )",
          "rank": "Pembina",
          "grade": "IV/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-05",
          "last_kgb_tmt": "2026-01-05",
          "base_salary": 4750000,
          "tpp_basic": 11000000,
          "job_class": 12,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "III/b",
          "tmt_jabatan": "2026-01-05",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2M",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-5",
          "no_urut": 5,
          "nip": "198003242010011015",
          "birth_date": "1980-03-24",
          "name": "LALU  YUNUS, SP. Msi",
          "position": "Kabid Riset dan Inovasi Daerah ( BRIDA)",
          "rank": "Pembina",
          "grade": "IV/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-05",
          "last_kgb_tmt": "2026-01-05",
          "base_salary": 4750000,
          "tpp_basic": 11000000,
          "job_class": 12,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "III/b",
          "tmt_jabatan": "2026-01-05",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-6",
          "no_urut": 6,
          "nip": "198205262005012011",
          "birth_date": "1982-05-26",
          "name": "DIANA FUJI LESTARI. S,St.Pi",
          "position": "Kabid Perencanaan, Evaluasi Pembangunan Daerah ( P2EPD )",
          "rank": "Pembina",
          "grade": "IV/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-05",
          "last_kgb_tmt": "2026-01-05",
          "base_salary": 4750000,
          "tpp_basic": 11000000,
          "job_class": 12,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "III/b",
          "tmt_jabatan": "2026-01-05",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2EPD",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-7",
          "no_urut": 7,
          "nip": "196906192001121002",
          "birth_date": "1969-06-19",
          "name": "MUHAMMAD  DAWAM  MUZAKKI, S. Kom",
          "position": "Perencana Ahli Muda Pada Bidang Pemerintahan dan Pembangunan Manusia (P2M )",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2001-12-01",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2M",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-8",
          "no_urut": 8,
          "nip": "197607062006041017",
          "birth_date": "1976-07-06",
          "name": "DANY FAOEZAN, ST",
          "position": "Perencana Ahli Muda Pada Bidang Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2006-04-01",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang PSDAIK",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-9",
          "no_urut": 9,
          "nip": "197510132009011007",
          "birth_date": "1975-10-13",
          "name": "L. RAKHMAT INDRAJAYA, SE",
          "position": "Perencana Ahli Muda Pada Bidang Pemerintahan dan Pembangunan Manusia (P2M )",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2009-01-01",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2M",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-10",
          "no_urut": 10,
          "nip": "197208012008012021",
          "birth_date": "1972-08-01",
          "name": "BAIQ ANDWENI SEKAR AGUSTINI,SE",
          "position": "Kasubbag Keuangan",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2008-01-01",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-11",
          "no_urut": 11,
          "nip": "197705012010012015",
          "birth_date": "1977-05-01",
          "name": "LATIFAH MUKHSEN, ST",
          "position": "Perencana Ahli Muda Pada Bidang Perencanaan, Evaluasi Pembangunan Daerah ( P2EPD )",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2021-12-31",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2021-12-31",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2EPD",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-12",
          "no_urut": 12,
          "nip": "198005022010011025",
          "birth_date": "1980-05-02",
          "name": "MOHAMMAD FACHRIZAL,S.P,M,Ak",
          "position": "Perencana Ahli Muda Pada Bidang  Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2021-12-31",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2021-12-31",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang PSDAIK",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-13",
          "no_urut": 13,
          "nip": "197912202010012024",
          "birth_date": "1979-12-20",
          "name": "KUMALA SARTIKA, SE",
          "position": "Analis Kebijakan Ahli Muda Pada Bidang Riset dan Inovasi Daerah ( BRIDA)",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2021-12-31",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2021-12-31",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-14",
          "no_urut": 14,
          "nip": "198208072009012006",
          "birth_date": "1982-08-07",
          "name": "ERRYAGUSTRIANI,S.T.M.T",
          "position": "Perencana Ahli Muda Pada Bidang Perencanaan, Evaluasi Pembangunan Daerah ( P2EPD )",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2023-01-02",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2023-01-02",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2EPD",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-15",
          "no_urut": 15,
          "nip": "198605212010011006",
          "birth_date": "1986-05-21",
          "name": "TAUFIQURRAHMAN.A.Md.Gz",
          "position": "Kasubbag Program",
          "rank": "Penata Muda Tingkat I",
          "grade": "III/b",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-02-06",
          "last_kgb_tmt": "2026-02-06",
          "base_salary": 3550000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2026-02-06",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-16",
          "no_urut": 16,
          "nip": "198206022012121005",
          "birth_date": "1982-06-02",
          "name": "ARI LESMANA, S.AB",
          "position": "Kasubbag Umum dan Kepegawaian",
          "rank": "Penata Muda Tingkat I",
          "grade": "III/b",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-02-06",
          "last_kgb_tmt": "2026-02-06",
          "base_salary": 3550000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Setruktural",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2026-02-06",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-17",
          "no_urut": 17,
          "nip": "198401242006042008",
          "birth_date": "1984-01-24",
          "name": "ARUM PADMARANI SWARNA AURAJATI,S,PI,M.Si",
          "position": "Perencana Ahli Muda Pada Bidang  Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)",
          "rank": "Pembina",
          "grade": "IV/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-03-25",
          "last_kgb_tmt": "2026-03-25",
          "base_salary": 4750000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2026-03-25",
          "pendidikan_terakhir": "S2",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang PSDAIK",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-18",
          "no_urut": 18,
          "nip": "197811052008011009",
          "birth_date": "1978-11-05",
          "name": "MUHAMMAD ROSIHAN HABIBI",
          "position": "Perencana Ahli Muda Pada Bidang  Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)",
          "rank": "Penata Tingkat I",
          "grade": "III/d",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-03-25",
          "last_kgb_tmt": "2026-03-25",
          "base_salary": 4150000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2026-03-25",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang PSDAIK",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-19",
          "no_urut": 19,
          "nip": "198208052008012017",
          "birth_date": "1982-08-05",
          "name": "LYSA AGUSTINA, S.Adm",
          "position": "Perencana Ahli Muda Pada Bidang Pemerintahan dan Pembangunan Manusia (P2M )",
          "rank": "Penata",
          "grade": "III/c",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2021-12-31",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 3820000,
          "tpp_basic": 6500000,
          "job_class": 9,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli  Muda",
          "tmt_jabatan": "2021-12-31",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2M",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-20",
          "no_urut": 20,
          "nip": "197008302007012019",
          "birth_date": "1970-08-30",
          "name": "BAIQ SRI SUYANTI,A.Md",
          "position": "Pengolah Data  dan Informasi Pada Bidang Riset dan Inovasi Daerah ( BRIDA)",
          "rank": "Penata",
          "grade": "III/c",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3820000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "D3",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-21",
          "no_urut": 21,
          "nip": "198410052010011023",
          "birth_date": "1984-10-05",
          "name": "GALIH DWI PRASOJO, S. AB",
          "position": "Penelaah Teknis dan Kebijakan",
          "rank": "Penata",
          "grade": "III/c",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3820000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-22",
          "no_urut": 22,
          "nip": "197811152008011009",
          "birth_date": "1978-11-15",
          "name": "EKO PURWANTO,SP",
          "position": "Penata Layanan Operasional pada Bidang Perekonomian Sumber Daya Alam, Infrastuktur  dan Kewilayahan",
          "rank": "Penata Muda Tingkat I",
          "grade": "III/b",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3550000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang PSDAIK",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-23",
          "no_urut": 23,
          "nip": "199812312021081000",
          "birth_date": "1998-12-31",
          "name": "MUHAMMAD SATRIO RAMADHAN",
          "position": "Penelaah Teknis dan Kebijakan",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-24",
          "no_urut": 24,
          "nip": "199604302025051002",
          "birth_date": "1996-04-30",
          "name": "APRIZAL HARYADI",
          "position": "Fasilitator Pemerintahan",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-03-25",
          "last_kgb_tmt": "2026-03-25",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2026-03-25",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-25",
          "no_urut": 25,
          "nip": "197207162007011031",
          "birth_date": "1972-07-16",
          "name": "MUHAMMAD ZOHRI",
          "position": "Pengadministrasi Perkantoran",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-26",
          "no_urut": 26,
          "nip": "197411062007012021",
          "birth_date": "1974-11-06",
          "name": "SYLVIA NOVIETA HANAKO",
          "position": "Pengadministrasi Perkantoran",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-27",
          "no_urut": 27,
          "nip": "200209032026102001",
          "birth_date": "2002-09-03",
          "name": "HERDIAN ZURIAT KOMALASARI S.tr.I.P",
          "position": "Perencana Ahli Pertama",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-10-01",
          "last_kgb_tmt": "2026-10-01",
          "base_salary": 3310000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli Pertama",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-28",
          "no_urut": 28,
          "nip": "197412312007011104",
          "birth_date": "1974-12-31",
          "name": "SARIDIN,S.AB",
          "position": "Penata Layanan Operasional pada Bidang Perekonomian Sumber Daya Alam, Infrastuktur  dan Kewilayahan",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang PSDAIK",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-29",
          "no_urut": 29,
          "nip": "197608012007012020",
          "birth_date": "1976-08-01",
          "name": "SRI MULIATIN",
          "position": "Pengadministrasi Perkantoran Pada Bidang Pemerintahan dan Pembangunan Manusia ( P2M)",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2025-06-02",
          "last_kgb_tmt": "2025-06-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2025-06-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2M",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-30",
          "no_urut": 30,
          "nip": "197811082007012010",
          "birth_date": "1978-11-08",
          "name": "NURLAILI",
          "position": "Pengadministrasi Perkantoran",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-31",
          "no_urut": 31,
          "nip": "200105022024092001",
          "birth_date": "2001-05-02",
          "name": "THERESYA WULANDANI PUTRI,S.Tr.I.P",
          "position": "Fasilitator Pemerintahan",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-01-09",
          "last_kgb_tmt": "2024-04-01",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-01-09",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-32",
          "no_urut": 32,
          "nip": "198201112009012007",
          "birth_date": "1982-01-11",
          "name": "SRI FUJI ASTUTI",
          "position": "Pengadministrasi Perkantoran",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-33",
          "no_urut": 33,
          "nip": "198012312009012019",
          "birth_date": "1980-12-31",
          "name": "SURIATI,S.Adm",
          "position": "Penata Layanan Operasional pada Bidang Perencanaan, Pengendalian dan Evaluasi Pembangunan Daerah (P2EPD )",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2025-06-02",
          "last_kgb_tmt": "2025-06-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2025-06-02",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2EPD",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-34",
          "no_urut": 34,
          "nip": "198407152010012007",
          "birth_date": "1984-07-15",
          "name": "DWI MELIASARI,S.AB",
          "position": "Penata Layanan Operasional pada Subbag Keuangan Sekretariat",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-35",
          "no_urut": 35,
          "nip": "198203022010011008",
          "birth_date": "1982-03-02",
          "name": "AHMAD ALFIAN",
          "position": "Pengadministrasi Perkantoran Pada Bidang Pemerintahan dan Pembangunan Manusia ( P2M)",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2025-06-02",
          "last_kgb_tmt": "2025-06-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2025-06-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang P2M",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-36",
          "no_urut": 36,
          "nip": "198508082010012037",
          "birth_date": "1985-08-08",
          "name": "HALIMATUN SAKDIAH, S. AB",
          "position": "Penata Layanan Operasional pada Sibbag Program Sekretariat",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-37",
          "no_urut": 37,
          "nip": "197509302007012013",
          "birth_date": "1975-09-30",
          "name": "LALE NADIAH",
          "position": "Pengadministrasi Perkantoran Pada Subbagian Umum dan Kepegawaian",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-05-06",
          "last_kgb_tmt": "2026-05-06",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2026-05-06",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-38",
          "no_urut": 38,
          "nip": "197401202010011001",
          "birth_date": "1974-01-20",
          "name": "AHMAD RIZALIHADI",
          "position": "Pengadministrasi Perkantoran pada Bidang Riset dan Inovasi Daerah (BRIDA )",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Bidang RIDA",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-39",
          "no_urut": 39,
          "nip": "197212312009012007",
          "birth_date": "1972-12-31",
          "name": "BAIQ KURNIAWATI",
          "position": "Pengadminstrasi Perkantoran pada Subbag Keuangan Sekretariat",
          "rank": "Pengatur",
          "grade": "II/c",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 2880000,
          "tpp_basic": 3200000,
          "job_class": 6,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-40",
          "no_urut": 40,
          "nip": "198608082012121003",
          "birth_date": "1986-08-08",
          "name": "ARIA EKA PRASETIA",
          "position": "Pengadministrasi Perkantoran",
          "rank": "Pengatur Muda Tingkat I",
          "grade": "II/b",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 2680000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-41",
          "no_urut": 41,
          "nip": "197912312008012082",
          "birth_date": "1979-12-31",
          "name": "NIKMAH",
          "position": "Pengadministrasi Perkantoran",
          "rank": "Pengatur Muda Tingkat I",
          "grade": "II/b",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-02",
          "last_kgb_tmt": "2024-04-02",
          "base_salary": 2680000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2024-04-02",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-42",
          "no_urut": 42,
          "nip": "200103012025052003",
          "birth_date": "2001-03-01",
          "name": "NYOMAN ASTI PRIMASANTIKA, S.Ak",
          "position": "Analis Keuangan Pusat dan Daerah Ahli Pertama",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PNS",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2025-05-01",
          "last_kgb_tmt": "2025-05-01",
          "base_salary": 3310000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli Pertama",
          "tmt_jabatan": "2025-05-01",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-43",
          "no_urut": 43,
          "nip": "199503162024211015",
          "birth_date": "1995-03-16",
          "name": "INDI MAHENRA, SE",
          "position": "Perencana Ahli Pertama",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-04",
          "last_kgb_tmt": "2024-04-04",
          "base_salary": 3310000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Ahli Pertama",
          "tmt_jabatan": "2024-04-04",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-44",
          "no_urut": 44,
          "nip": "198907272024212044",
          "birth_date": "1989-07-27",
          "name": "DWI HARDIANTI, A.md.Perp",
          "position": "Asiparis Terampil",
          "rank": "Pengatur",
          "grade": "II/c",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2024-04-04",
          "last_kgb_tmt": "2024-04-04",
          "base_salary": 2880000,
          "tpp_basic": 3200000,
          "job_class": 6,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional Tertentu",
          "jenjang_jabatan": "Terampil",
          "tmt_jabatan": "2024-04-04",
          "pendidikan_terakhir": "D3",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-45",
          "no_urut": 45,
          "nip": "198305292025211027",
          "birth_date": "1983-05-29",
          "name": "LALU FARLAN WIDIYAN INDRIS, S.Kom",
          "position": "Penata Layanan Operasional",
          "rank": "Penata Muda",
          "grade": "III/a",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2025-05-01",
          "last_kgb_tmt": "2025-05-01",
          "base_salary": 3310000,
          "tpp_basic": 3800000,
          "job_class": 7,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2025-05-01",
          "pendidikan_terakhir": "S1",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-46",
          "no_urut": 46,
          "nip": "198906142025211033",
          "birth_date": "1989-06-14",
          "name": "LALU DIDI SUDARMAJI",
          "position": "Pengadministrasi Perkantoran",
          "rank": "Pengatur Muda",
          "grade": "II/a",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2025-05-01",
          "last_kgb_tmt": "2025-05-01",
          "base_salary": 2480000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "Pelaksana",
          "tmt_jabatan": "2025-05-01",
          "pendidikan_terakhir": "SMA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-47",
          "no_urut": 47,
          "nip": "198710072026212002",
          "birth_date": "1987-10-07",
          "name": "MEMI SALVIANI, SE",
          "position": "Penata Layanan Operasional",
          "rank": "PPPK",
          "grade": "IX",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 3450000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SARJANA (S1)",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-48",
          "no_urut": 48,
          "nip": "198508192026211002",
          "birth_date": "1985-08-19",
          "name": "LALU AGUS INDRAYADI,S.Adm",
          "position": "Penata Layanan Operasional",
          "rank": "PPPK",
          "grade": "IX",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 3450000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SARJANA (S1)",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-49",
          "no_urut": 49,
          "nip": "198307272026211005",
          "birth_date": "1983-07-27",
          "name": "AHMAD HABIBI,S.Adm",
          "position": "Penata Layanan Operasional",
          "rank": "PPPK",
          "grade": "IX",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 3450000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SARJANA (S1)",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-50",
          "no_urut": 50,
          "nip": "197602032026212001",
          "birth_date": "1976-02-03",
          "name": "NI LUH ADE YURYAWATI,SH",
          "position": "Penata Layanan Operasional",
          "rank": "PPPK",
          "grade": "IX",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 3450000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SARJANA (S1)",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-51",
          "no_urut": 51,
          "nip": "197305202026211003",
          "birth_date": "1973-05-20",
          "name": "BUDI UTAMA, ST",
          "position": "Penata Layanan Operasional",
          "rank": "PPPK",
          "grade": "IX",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 3450000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SARJANA (S1)",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-52",
          "no_urut": 52,
          "nip": "197305172026211002",
          "birth_date": "1973-05-17",
          "name": "MUNAWIR KHAIR, SH",
          "position": "Penata Layanan Operasional",
          "rank": "PPPK",
          "grade": "IX",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 3450000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SARJANA (S1)",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-53",
          "no_urut": 53,
          "nip": "198104222026212001",
          "birth_date": "1981-04-22",
          "name": "MIFTAHUL AINI, S.I.P",
          "position": "Penata Layanan Operasional",
          "rank": "PPPK",
          "grade": "IX",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 3450000,
          "tpp_basic": 4800000,
          "job_class": 8,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SARJANA (S1)",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-54",
          "no_urut": 54,
          "nip": "197807022026211001",
          "birth_date": "1978-07-02",
          "name": "LALU WAHYUDI ALAMSYAH",
          "position": "Operator Layanan Operasional",
          "rank": "PPPK",
          "grade": "V",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 2550000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SLTA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-55",
          "no_urut": 55,
          "nip": "198708312026211003",
          "birth_date": "1987-08-31",
          "name": "FAISAL TEMI SISWANTO",
          "position": "Operator Layanan Operasional",
          "rank": "PPPK",
          "grade": "V",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 2550000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SLTA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-56",
          "no_urut": 56,
          "nip": "198311072026211003",
          "birth_date": "1983-11-07",
          "name": "HASAN RAPI'I",
          "position": "Operator Layanan Operasional",
          "rank": "PPPK",
          "grade": "V",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 2550000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SLTA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-57",
          "no_urut": 57,
          "nip": "198802052026211002",
          "birth_date": "1988-02-05",
          "name": "KHALILURAHMANUDDIN",
          "position": "Operator Layanan Operasional",
          "rank": "PPPK",
          "grade": "V",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 2550000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SLTA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-58",
          "no_urut": 58,
          "nip": "198701052026211002",
          "birth_date": "1987-01-05",
          "name": "LALU SISWA MIHARJA",
          "position": "Operator Layanan Operasional",
          "rank": "PPPK",
          "grade": "V",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 2550000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SLTA",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      },
      {
          "id": "emp-59",
          "no_urut": 59,
          "nip": "198008152026211003",
          "birth_date": "1980-08-15",
          "name": "M.MANSUR",
          "position": "Operator Layanan Operasional",
          "rank": "PPPK",
          "grade": "V",
          "employment_type": "PPPK",
          "retirement_category": "administrasi",
          "last_rank_tmt": "2026-01-01",
          "last_kgb_tmt": "2026-01-01",
          "base_salary": 2550000,
          "tpp_basic": 2500000,
          "job_class": 5,
          "status": "Aktif",
          "is_demo": false,
          "jenis_jabatan": "Fungsional  Umum",
          "jenjang_jabatan": "PPPK PARUH WAKTU",
          "tmt_jabatan": null,
          "pendidikan_terakhir": "SMP",
          "diklat_struktural": "",
          "diklat_fungsional": "",
          "diklat_teknis": "",
          "unit_kerja": "Sekretariat",
          "unor_induk": "Bapperida",
          "created_at": "2026-10-01T00:00:00.000Z",
          "updated_at": "2026-10-01T00:00:00.000Z"
      }
  ],
  family_members: [
    {
      id: "fam-1",
      employee_id: "emp-1",
      name: "Contoh Pasangan Fadli",
      relationship: "pasangan",
      birth_date: "1993-04-11",
      marital_status: "menikah",
      is_asn: false,
      is_working: false,
      student_certificate: false,
      is_demo: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "fam-2",
      employee_id: "emp-1",
      name: "Contoh Anak Fadli 1",
      relationship: "anak",
      birth_date: "2008-06-20",
      marital_status: "belum_menikah",
      is_asn: false,
      is_working: false,
      student_certificate: false,
      is_demo: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "fam-3",
      employee_id: "emp-1",
      name: "Contoh Anak Fadli 2",
      relationship: "anak",
      birth_date: "2004-01-16",
      marital_status: "belum_menikah",
      is_asn: false,
      is_working: false,
      student_certificate: true,
      is_demo: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "fam-4",
      employee_id: "emp-2",
      name: "Contoh Pasangan Sinta",
      relationship: "pasangan",
      birth_date: "1991-10-02",
      marital_status: "menikah",
      is_asn: true,
      is_working: true,
      student_certificate: false,
      is_demo: true,
      created_at: "2026-01-02T00:00:00.000Z",
    },
    {
      id: "fam-5",
      employee_id: "emp-2",
      name: "Contoh Anak Sinta",
      relationship: "anak",
      birth_date: "2001-09-25",
      marital_status: "belum_menikah",
      is_asn: false,
      is_working: false,
      student_certificate: true,
      is_demo: true,
      created_at: "2026-01-02T00:00:00.000Z",
    },
    {
      id: "fam-6",
      employee_id: "emp-3",
      name: "Contoh Pasangan Ahmad",
      relationship: "pasangan",
      birth_date: "1989-02-10",
      marital_status: "menikah",
      is_asn: false,
      is_working: false,
      student_certificate: false,
      is_demo: true,
      created_at: "2026-01-03T00:00:00.000Z",
    },
    {
      id: "fam-7",
      employee_id: "emp-3",
      name: "Contoh Anak Ahmad",
      relationship: "anak",
      birth_date: "2000-12-02",
      marital_status: "belum_menikah",
      is_asn: false,
      is_working: false,
      student_certificate: true,
      is_demo: true,
      created_at: "2026-01-03T00:00:00.000Z",
    },
  ],
  promotion_logs: [
    {
      id: "promo-1",
      employee_id: "emp-1",
      status: "Persiapan Berkas",
      effective_date: "2026-04-01",
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "promo-2",
      employee_id: "emp-2",
      status: "Pengusulan SIASN",
      effective_date: "2027-04-01",
      created_at: "2026-01-02T00:00:00.000Z",
    },
  ],
  kgb_logs: [
    {
      id: "kgb-1",
      employee_id: "emp-2",
      old_salary: 3210000,
      new_salary: 3350000,
      effective_date: "2024-06-01",
      status: "Draft",
      created_at: "2024-06-01T00:00:00.000Z",
    },
  ],
  tpp_calculations: [
    {
      id: "tpp-1",
      employee_id: "emp-1",
      period: "2026-01",
      job_class: 10,
      base_amount: 5600000,
      productivity_weight: 60,
      productivity_rate: 100,
      attendance_weight: 40,
      attendance_rate: 100,
      gross_amount: 5600000,
      deduction_amount: 560000,
      net_amount: 5040000,
      details: { tax: 280000, bpjs: 280000, zakat: 0 },
      created_at: "2026-01-31T00:00:00.000Z",
    },
  ],
  backup_logs: [],
};

type TableName = keyof typeof INITIAL_DEMO_DATA;

function getStore(): Record<string, any[]> {
  if (typeof window === "undefined") {
    return JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
  }
  const raw = window.localStorage.getItem(STORAGE_KEYS.DB);
  if (!raw) {
    const initial = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const initial = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(initial));
    return initial;
  }
}

function saveStore(store: Record<string, any[]>) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(store));
  }
}

function getLocalSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLocalSession(session: LocalSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    window.localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }
}

type AuthCallback = (event: "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED", session: LocalSession | null) => void;
const authListeners = new Set<AuthCallback>();

function emitAuth(event: "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED", session: LocalSession | null) {
  authListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (e) {
      console.error(e);
    }
  });
}

class QueryBuilder {
  private table: string;
  private operation: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private filters: Array<(row: any) => boolean> = [];
  private orderField?: string;
  private orderAscending = true;
  private limitCount?: number;
  private mutationData: any = null;
  private mutationOptions?: { onConflict?: string };

  constructor(table: string) {
    this.table = table;
  }

  select(fields?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  in(column: string, values: any[]) {
    const set = new Set(values);
    this.filters.push((row) => set.has(row[column]));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(data: any | any[]) {
    this.operation = "insert";
    this.mutationData = data;
    return this;
  }

  update(payload: any) {
    this.operation = "update";
    this.mutationData = payload;
    return this;
  }

  upsert(data: any | any[], options?: { onConflict?: string }) {
    this.operation = "upsert";
    this.mutationData = data;
    this.mutationOptions = options;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  private execute(): { data: any; error: any } {
    const store = getStore();

    if (this.operation === "select") {
      let rows = (store[this.table] ?? []) as any[];
      for (const filter of this.filters) {
        rows = rows.filter(filter);
      }
      if (this.orderField) {
        const field = this.orderField;
        const asc = this.orderAscending;
        rows = [...rows].sort((a, b) => {
          const valA = a[field] ?? "";
          const valB = b[field] ?? "";
          if (typeof valA === "number" && typeof valB === "number") {
            return asc ? valA - valB : valB - valA;
          }
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }
      if (typeof this.limitCount === "number") {
        rows = rows.slice(0, this.limitCount);
      }
      return { data: JSON.parse(JSON.stringify(rows)), error: null };
    }

    if (this.operation === "insert") {
      const rows = store[this.table] ?? [];
      const items = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      const inserted = items.map((item) => ({
        id: item.id || `loc-${Math.random().toString(36).slice(2, 9)}`,
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }));
      store[this.table] = [...rows, ...inserted];
      saveStore(store);
      const res = Array.isArray(this.mutationData) ? inserted : inserted[0];
      return { data: JSON.parse(JSON.stringify(res)), error: null };
    }

    if (this.operation === "update") {
      let rows = store[this.table] ?? [];
      const updatedRows: any[] = [];
      rows = rows.map((row) => {
        const matches = this.filters.length === 0 || this.filters.every((f) => f(row));
        if (matches) {
          const updated = { ...row, ...this.mutationData, updated_at: new Date().toISOString() };
          updatedRows.push(updated);
          return updated;
        }
        return row;
      });
      store[this.table] = rows;
      saveStore(store);
      const res = updatedRows.length === 1 ? updatedRows[0] : updatedRows;
      return { data: JSON.parse(JSON.stringify(res)), error: null };
    }

    if (this.operation === "upsert") {
      const rows = store[this.table] ?? [];
      const conflictCol = this.mutationOptions?.onConflict || "id";
      const items = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      const results: any[] = [];
      for (const item of items) {
        const index = rows.findIndex((r) => r[conflictCol] === item[conflictCol]);
        if (index >= 0) {
          rows[index] = { ...rows[index], ...item, updated_at: new Date().toISOString() };
          results.push(rows[index]);
        } else {
          const newItem = {
            id: item.id || `loc-${Math.random().toString(36).slice(2, 9)}`,
            created_at: item.created_at || new Date().toISOString(),
            ...item,
          };
          rows.push(newItem);
          results.push(newItem);
        }
      }
      store[this.table] = rows;
      saveStore(store);
      const res = Array.isArray(this.mutationData) ? results : results[0];
      return { data: JSON.parse(JSON.stringify(res)), error: null };
    }

    if (this.operation === "delete") {
      let rows = store[this.table] ?? [];
      rows = rows.filter((row) => !this.filters.every((f) => f(row)));
      store[this.table] = rows;
      saveStore(store);
      return { data: null, error: null };
    }

    return { data: null, error: new Error(`Unknown operation: ${this.operation}`) };
  }

  then(resolve: (value: { data: any; error: any }) => void, reject?: (reason: any) => void) {
    const res = this.execute();
    resolve(res);
  }

  async single() {
    this.limitCount = 1;
    const { data, error } = this.execute();
    if (error) return { data: null, error };
    if (Array.isArray(data)) {
      if (data.length === 0) return { data: null, error: new Error("Record not found") };
      return { data: data[0], error: null };
    }
    return { data: data ?? null, error: data ? null : new Error("Record not found") };
  }

  async maybeSingle() {
    this.limitCount = 1;
    const { data, error } = this.execute();
    if (error) return { data: null, error };
    if (Array.isArray(data)) {
      return { data: data[0] ?? null, error: null };
    }
    return { data: data ?? null, error: null };
  }
}

export const localBackend = {
  isLocalhost: true,
  from(table: string) {
    return new QueryBuilder(table);
  },
  auth: {
    async getSession() {
      const session = getLocalSession();
      return { data: { session }, error: null };
    },
    onAuthStateChange(callback: AuthCallback) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      const cleanEmail = email.trim();
      const name = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
      const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : "Administrator";

      const user: LocalUser = {
        id: "admin-bapperida-01",
        email: cleanEmail,
        user_metadata: { full_name: formattedName },
      };

      const session: LocalSession = {
        user,
        access_token: "local-token-" + Date.now(),
        token_type: "bearer",
      };

      setLocalSession(session);

      // Ensure user role is admin in local store
      const store = getStore();
      if (!store.user_roles) store.user_roles = [];
      if (!store.user_roles.some((r) => r.user_id === user.id && r.role === "admin")) {
        store.user_roles.push({
          id: "role-" + user.id,
          user_id: user.id,
          role: "admin",
          created_at: new Date().toISOString(),
        });
      }
      if (!store.profiles) store.profiles = [];
      if (!store.profiles.some((p) => p.id === user.id)) {
        store.profiles.push({
          id: user.id,
          display_name: formattedName,
          job_title: "Administrator Kepegawaian",
          avatar_url: null,
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      saveStore(store);

      emitAuth("SIGNED_IN", session);
      return { data: { user, session }, error: null };
    },
    async signInOAuth(provider: "google" | "lovable") {
      const email = provider === "google" ? "admin.google@bapperida.lombokbarat.go.id" : "admin.lovable@bapperida.lombokbarat.go.id";
      const name = provider === "google" ? "Admin Google Bapperida" : "Admin Lovable Bapperida";

      const user: LocalUser = {
        id: "admin-bapperida-01",
        email,
        user_metadata: { full_name: name },
      };

      const session: LocalSession = {
        user,
        access_token: "local-oauth-token-" + Date.now(),
        token_type: "bearer",
      };

      setLocalSession(session);

      const store = getStore();
      if (!store.user_roles) store.user_roles = [];
      if (!store.user_roles.some((r) => r.user_id === user.id && r.role === "admin")) {
        store.user_roles.push({
          id: "role-" + user.id,
          user_id: user.id,
          role: "admin",
          created_at: new Date().toISOString(),
        });
      }
      saveStore(store);

      emitAuth("SIGNED_IN", session);
      return { data: { user, session }, error: null };
    },
    async signUp({ email, password, options }: { email: string; password?: string; options?: any }) {
      return this.signInWithPassword({ email, password });
    },
    async signOut() {
      setLocalSession(null);
      emitAuth("SIGNED_OUT", null);
      return { error: null };
    },
  },
  resetDatabase() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.DB);
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  },
};
