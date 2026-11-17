-- Schema Database Turso / libSQL untuk SIMPEG Bapperida Lombok Barat

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  preferences TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  no_urut INTEGER NOT NULL DEFAULT 999,
  nip TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '',
  rank TEXT NOT NULL DEFAULT '',
  grade TEXT NOT NULL DEFAULT '',
  employment_type TEXT NOT NULL DEFAULT 'PNS',
  retirement_category TEXT NOT NULL DEFAULT 'administrasi',
  last_rank_tmt TEXT,
  last_kgb_tmt TEXT,
  base_salary REAL NOT NULL DEFAULT 0,
  tpp_basic REAL NOT NULL DEFAULT 0,
  job_class INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Aktif',
  is_demo INTEGER NOT NULL DEFAULT 0,
  jenis_jabatan TEXT NOT NULL DEFAULT '',
  jenjang_jabatan TEXT NOT NULL DEFAULT '',
  tmt_jabatan TEXT,
  pendidikan_terakhir TEXT NOT NULL DEFAULT '',
  diklat_struktural TEXT NOT NULL DEFAULT '',
  diklat_fungsional TEXT NOT NULL DEFAULT '',
  diklat_teknis TEXT NOT NULL DEFAULT '',
  unit_kerja TEXT NOT NULL DEFAULT '',
  unor_induk TEXT NOT NULL DEFAULT 'Bapperida',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  marital_status TEXT NOT NULL DEFAULT 'belum_menikah',
  is_asn INTEGER NOT NULL DEFAULT 0,
  is_working INTEGER NOT NULL DEFAULT 0,
  student_certificate INTEGER NOT NULL DEFAULT 0,
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS promotion_logs (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  effective_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kgb_logs (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  old_salary REAL NOT NULL DEFAULT 0,
  new_salary REAL NOT NULL DEFAULT 0,
  effective_date TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tpp_calculations (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  job_class INTEGER NOT NULL DEFAULT 1,
  base_amount REAL NOT NULL DEFAULT 0,
  productivity_weight REAL NOT NULL DEFAULT 60,
  productivity_rate REAL NOT NULL DEFAULT 100,
  attendance_weight REAL NOT NULL DEFAULT 40,
  attendance_rate REAL NOT NULL DEFAULT 100,
  gross_amount REAL NOT NULL DEFAULT 0,
  deduction_amount REAL NOT NULL DEFAULT 0,
  net_amount REAL NOT NULL DEFAULT 0,
  details TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS backup_logs (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  file_name TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO profiles (id, display_name, job_title) VALUES
('admin-bapperida-01', 'Administrator Bapperida', 'Pengelola Kepegawaian');

INSERT OR IGNORE INTO user_roles (id, user_id, role) VALUES
('role-01', 'admin-bapperida-01', 'admin');

INSERT OR REPLACE INTO employees (id, no_urut, nip, name, position, rank, grade, employment_type, retirement_category, last_rank_tmt, last_kgb_tmt, base_salary, tpp_basic, job_class, status, is_demo, jenis_jabatan, jenjang_jabatan, tmt_jabatan, pendidikan_terakhir, diklat_struktural, diklat_fungsional, diklat_teknis, unit_kerja, unor_induk) VALUES
('emp-1', 1, '197907262009011013', 'DENY ARIF NUGROHO, ST,ME', 'Kepala', 'Pembina Tingkat I', 'IV/b', 'PNS', 'pimpinan_tinggi', '2025-12-31', '2025-12-31', 5320000, 18500000, 14, 'Aktif', False, 'Setruktural', '', '2025-12-31', 'S2', '', '', '', 'Pimpinan', 'Bapperida'),
('emp-2', 2, '197607022001122002', 'YULINDA IRMAYANI, ST', 'Sekretaris', 'Pembina', 'IV/b', 'PNS', 'administrasi', '2026-01-05', '2026-01-05', 5320000, 11000000, 12, 'Aktif', False, 'Setruktural', 'III/a', '2026-01-05', 'S2', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-3', 3, '197610212008012007', 'AYU RISZA ANDARIROSI, ST', 'Kabid Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)', 'Pembina', 'IV/a', 'PNS', 'administrasi', '2026-01-05', '2026-01-05', 4750000, 11000000, 12, 'Aktif', False, 'Setruktural', 'III/b', '2026-01-05', 'S1', '', '', '', 'Bidang PSDAIK', 'Bapperida'),
('emp-4', 4, '198301042010012015', 'REVINA MADA YUDHANI, SIP.M.H', 'Kabid Pemerintahan dan Pembangunan Manusia (P2M )', 'Pembina', 'IV/a', 'PNS', 'administrasi', '2026-01-05', '2026-01-05', 4750000, 11000000, 12, 'Aktif', False, 'Setruktural', 'III/b', '2026-01-05', 'S2', '', '', '', 'Bidang P2M', 'Bapperida'),
('emp-5', 5, '198003242010011015', 'LALU  YUNUS, SP. Msi', 'Kabid Riset dan Inovasi Daerah ( BRIDA)', 'Pembina', 'IV/a', 'PNS', 'administrasi', '2026-01-05', '2026-01-05', 4750000, 11000000, 12, 'Aktif', False, 'Setruktural', 'III/b', '2026-01-05', 'S2', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-6', 6, '198205262005012011', 'DIANA FUJI LESTARI. S,St.Pi', 'Kabid Perencanaan, Evaluasi Pembangunan Daerah ( P2EPD )', 'Pembina', 'IV/a', 'PNS', 'administrasi', '2026-01-05', '2026-01-05', 4750000, 11000000, 12, 'Aktif', False, 'Setruktural', 'III/b', '2026-01-05', 'S2', '', '', '', 'Bidang P2EPD', 'Bapperida'),
('emp-7', 7, '196906192001121002', 'MUHAMMAD  DAWAM  MUZAKKI, S. Kom', 'Perencana Ahli Muda Pada Bidang Pemerintahan dan Pembangunan Manusia (P2M )', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2001-12-01', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', NULL, 'S1', '', '', '', 'Bidang P2M', 'Bapperida'),
('emp-8', 8, '197607062006041017', 'DANY FAOEZAN, ST', 'Perencana Ahli Muda Pada Bidang Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2006-04-01', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', NULL, 'S1', '', '', '', 'Bidang PSDAIK', 'Bapperida'),
('emp-9', 9, '197510132009011007', 'L. RAKHMAT INDRAJAYA, SE', 'Perencana Ahli Muda Pada Bidang Pemerintahan dan Pembangunan Manusia (P2M )', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2009-01-01', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', NULL, 'S1', '', '', '', 'Bidang P2M', 'Bapperida'),
('emp-10', 10, '197208012008012021', 'BAIQ ANDWENI SEKAR AGUSTINI,SE', 'Kasubbag Keuangan', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2008-01-01', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Setruktural', 'Ahli  Muda', NULL, 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-11', 11, '197705012010012015', 'LATIFAH MUKHSEN, ST', 'Perencana Ahli Muda Pada Bidang Perencanaan, Evaluasi Pembangunan Daerah ( P2EPD )', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2021-12-31', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', '2021-12-31', 'S1', '', '', '', 'Bidang P2EPD', 'Bapperida'),
('emp-12', 12, '198005022010011025', 'MOHAMMAD FACHRIZAL,S.P,M,Ak', 'Perencana Ahli Muda Pada Bidang  Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2021-12-31', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', '2021-12-31', 'S2', '', '', '', 'Bidang PSDAIK', 'Bapperida'),
('emp-13', 13, '197912202010012024', 'KUMALA SARTIKA, SE', 'Analis Kebijakan Ahli Muda Pada Bidang Riset dan Inovasi Daerah ( BRIDA)', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2021-12-31', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', '2021-12-31', 'S1', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-14', 14, '198208072009012006', 'ERRYAGUSTRIANI,S.T.M.T', 'Perencana Ahli Muda Pada Bidang Perencanaan, Evaluasi Pembangunan Daerah ( P2EPD )', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2023-01-02', '2024-04-01', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', '2023-01-02', 'S2', '', '', '', 'Bidang P2EPD', 'Bapperida'),
('emp-15', 15, '198605212010011006', 'TAUFIQURRAHMAN.A.Md.Gz', 'Kasubbag Program', 'Penata Muda Tingkat I', 'III/b', 'PNS', 'administrasi', '2026-02-06', '2026-02-06', 3550000, 6500000, 9, 'Aktif', False, 'Setruktural', 'Ahli  Muda', '2026-02-06', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-16', 16, '198206022012121005', 'ARI LESMANA, S.AB', 'Kasubbag Umum dan Kepegawaian', 'Penata Muda Tingkat I', 'III/b', 'PNS', 'administrasi', '2026-02-06', '2026-02-06', 3550000, 6500000, 9, 'Aktif', False, 'Setruktural', 'Ahli  Muda', '2026-02-06', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-17', 17, '198401242006042008', 'ARUM PADMARANI SWARNA AURAJATI,S,PI,M.Si', 'Perencana Ahli Muda Pada Bidang  Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)', 'Pembina', 'IV/a', 'PNS', 'administrasi', '2026-03-25', '2026-03-25', 4750000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', '2026-03-25', 'S2', '', '', '', 'Bidang PSDAIK', 'Bapperida'),
('emp-18', 18, '197811052008011009', 'MUHAMMAD ROSIHAN HABIBI', 'Perencana Ahli Muda Pada Bidang  Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)', 'Penata Tingkat I', 'III/d', 'PNS', 'administrasi', '2026-03-25', '2026-03-25', 4150000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', '2026-03-25', 'S1', '', '', '', 'Bidang PSDAIK', 'Bapperida'),
('emp-19', 19, '198208052008012017', 'LYSA AGUSTINA, S.Adm', 'Perencana Ahli Muda Pada Bidang Pemerintahan dan Pembangunan Manusia (P2M )', 'Penata', 'III/c', 'PNS', 'administrasi', '2021-12-31', '2024-04-01', 3820000, 6500000, 9, 'Aktif', False, 'Fungsional Tertentu', 'Ahli  Muda', '2021-12-31', 'S1', '', '', '', 'Bidang P2M', 'Bapperida'),
('emp-20', 20, '197008302007012019', 'BAIQ SRI SUYANTI,A.Md', 'Pengolah Data  dan Informasi Pada Bidang Riset dan Inovasi Daerah ( BRIDA)', 'Penata', 'III/c', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3820000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'D3', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-21', 21, '198410052010011023', 'GALIH DWI PRASOJO, S. AB', 'Penelaah Teknis dan Kebijakan', 'Penata', 'III/c', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3820000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'S1', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-22', 22, '197811152008011009', 'EKO PURWANTO,SP', 'Penata Layanan Operasional pada Bidang Perekonomian Sumber Daya Alam, Infrastuktur  dan Kewilayahan', 'Penata Muda Tingkat I', 'III/b', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3550000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'S1', '', '', '', 'Bidang PSDAIK', 'Bapperida'),
('emp-23', 23, '199812312021081000', 'MUHAMMAD SATRIO RAMADHAN', 'Penelaah Teknis dan Kebijakan', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-24', 24, '199604302025051002', 'APRIZAL HARYADI', 'Fasilitator Pemerintahan', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2026-03-25', '2026-03-25', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2026-03-25', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-25', 25, '197207162007011031', 'MUHAMMAD ZOHRI', 'Pengadministrasi Perkantoran', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-26', 26, '197411062007012021', 'SYLVIA NOVIETA HANAKO', 'Pengadministrasi Perkantoran', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-27', 27, '200209032026102001', 'HERDIAN ZURIAT KOMALASARI S.tr.I.P', 'Perencana Ahli Pertama', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2026-10-01', '2026-10-01', 3310000, 4800000, 8, 'Aktif', False, 'Fungsional Tertentu', 'Ahli Pertama', NULL, '', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-28', 28, '197412312007011104', 'SARIDIN,S.AB', 'Penata Layanan Operasional pada Bidang Perekonomian Sumber Daya Alam, Infrastuktur  dan Kewilayahan', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'S1', '', '', '', 'Bidang PSDAIK', 'Bapperida'),
('emp-29', 29, '197608012007012020', 'SRI MULIATIN', 'Pengadministrasi Perkantoran Pada Bidang Pemerintahan dan Pembangunan Manusia ( P2M)', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2025-06-02', '2025-06-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2025-06-02', 'SMA', '', '', '', 'Bidang P2M', 'Bapperida'),
('emp-30', 30, '197811082007012010', 'NURLAILI', 'Pengadministrasi Perkantoran', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-31', 31, '2001050220240920001', 'THERESYA WULANDANI PUTRI,S.Tr.I.P', 'Fasilitator Pemerintahan', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-01-09', '2024-04-01', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-01-09', 'S1', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-32', 32, '198201112009012007', 'SRI FUJI ASTUTI', 'Pengadministrasi Perkantoran', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-33', 33, '198012312009012019', 'SURIATI,S.Adm', 'Penata Layanan Operasional pada Bidang Perencanaan, Pengendalian dan Evaluasi Pembangunan Daerah (P2EPD )', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2025-06-02', '2025-06-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2025-06-02', 'S1', '', '', '', 'Bidang P2EPD', 'Bapperida'),
('emp-34', 34, '198407152010012007', 'DWI MELIASARI,S.AB', 'Penata Layanan Operasional pada Subbag Keuangan Sekretariat', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-35', 35, '198203022010011008', 'AHMAD ALFIAN', 'Pengadministrasi Perkantoran Pada Bidang Pemerintahan dan Pembangunan Manusia ( P2M)', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2025-06-02', '2025-06-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2025-06-02', 'SMA', '', '', '', 'Bidang P2M', 'Bapperida'),
('emp-36', 36, '198508082010012037', 'HALIMATUN SAKDIAH, S. AB', 'Penata Layanan Operasional pada Sibbag Program Sekretariat', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-37', 37, '197509302007012013', 'LALE NADIAH', 'Pengadministrasi Perkantoran Pada Subbagian Umum dan Kepegawaian', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2026-05-06', '2026-05-06', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2026-05-06', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-38', 38, '197401202010011001', 'AHMAD RIZALIHADI', 'Pengadministrasi Perkantoran pada Bidang Riset dan Inovasi Daerah (BRIDA )', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Bidang RIDA', 'Bapperida'),
('emp-39', 39, '197212312009012007', 'BAIQ KURNIAWATI', 'Pengadminstrasi Perkantoran pada Subbag Keuangan Sekretariat', 'Pengatur', 'II/c', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 2880000, 3200000, 6, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-40', 40, '198608082012121003', 'ARIA EKA PRASETIA', 'Pengadministrasi Perkantoran', 'Pengatur Muda Tingkat I', 'II/b', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 2680000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-41', 41, '197912312008012082', 'NIKMAH', 'Pengadministrasi Perkantoran', 'Pengatur Muda Tingkat I', 'II/b', 'PNS', 'administrasi', '2024-04-02', '2024-04-02', 2680000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2024-04-02', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-42', 42, '200103012025052003', 'NYOMAN ASTI PRIMASANTIKA, S.Ak', 'Analis Keuangan Pusat dan Daerah Ahli Pertama', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2025-05-01', '2025-05-01', 3310000, 4800000, 8, 'Aktif', False, 'Fungsional Tertentu', 'Ahli Pertama', '2025-05-01', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-43', 43, '199503162024211015', 'INDI MAHENRA, SE', 'Perencana Ahli Pertama', 'Penata Muda', 'III/a', 'PPPK', 'administrasi', '2024-04-04', '2024-04-04', 3310000, 4800000, 8, 'Aktif', False, 'Fungsional Tertentu', 'Ahli Pertama', '2024-04-04', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-44', 44, '198907272024212044', 'DWI HARDIANTI, A.md.Perp', 'Asiparis Terampil', 'Pengatur', 'II/c', 'PPPK', 'administrasi', '2024-04-04', '2024-04-04', 2880000, 3200000, 6, 'Aktif', False, 'Fungsional Tertentu', 'Terampil', '2024-04-04', 'D3', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-45', 45, '198305292025211027', 'LALU FARLAN WIDIYAN INDRIS, S.Kom', 'Penata Layanan Operasional', 'Penata Muda', 'III/a', 'PPPK', 'administrasi', '2025-05-01', '2025-05-01', 3310000, 3800000, 7, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2025-05-01', 'S1', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-46', 46, '198906142025211033', 'LALU DIDI SUDARMAJI', 'Pengadministrasi Perkantoran', 'Pengatur Muda', 'II/a', 'PPPK', 'administrasi', '2025-05-01', '2025-05-01', 2480000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'Pelaksana', '2025-05-01', 'SMA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-47', 47, '198710072026212002', 'MEMI SALVIANI, SE', 'Penata Layanan Operasional', 'PPPK', 'IX', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 3450000, 4800000, 8, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SARJANA (S1)', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-48', 48, '198508192026211002', 'LALU AGUS INDRAYADI,S.Adm', 'Penata Layanan Operasional', 'PPPK', 'IX', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 3450000, 4800000, 8, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SARJANA (S1)', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-49', 49, '198307272026211005', 'AHMAD HABIBI,S.Adm', 'Penata Layanan Operasional', 'PPPK', 'IX', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 3450000, 4800000, 8, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SARJANA (S1)', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-50', 50, '197602032026212001', 'NI LUH ADE YURYAWATI,SH', 'Penata Layanan Operasional', 'PPPK', 'IX', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 3450000, 4800000, 8, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SARJANA (S1)', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-51', 51, '197305202026211003', 'BUDI UTAMA, ST', 'Penata Layanan Operasional', 'PPPK', 'IX', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 3450000, 4800000, 8, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SARJANA (S1)', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-52', 52, '197305172026211002', 'MUNAWIR KHAIR, SH', 'Penata Layanan Operasional', 'PPPK', 'IX', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 3450000, 4800000, 8, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SARJANA (S1)', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-53', 53, '198104222026212001', 'MIFTAHUL AINI, S.I.P', 'Penata Layanan Operasional', 'PPPK', 'IX', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 3450000, 4800000, 8, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SARJANA (S1)', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-54', 54, '197807022026211001', 'LALU WAHYUDI ALAMSYAH', 'Operator Layanan Operasional', 'PPPK', 'V', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 2550000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SLTA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-55', 55, '198708312026211003', 'FAISAL TEMI SISWANTO', 'Operator Layanan Operasional', 'PPPK', 'V', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 2550000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SLTA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-56', 56, '198311072026211003', 'HASAN RAPI''I', 'Operator Layanan Operasional', 'PPPK', 'V', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 2550000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SLTA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-57', 57, '198802052026211002', 'KHALILURAHMANUDDIN', 'Operator Layanan Operasional', 'PPPK', 'V', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 2550000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SLTA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-58', 58, '198701052026211002', 'LALU SISWA MIHARJA', 'Operator Layanan Operasional', 'PPPK', 'V', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 2550000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SLTA', '', '', '', 'Sekretariat', 'Bapperida'),
('emp-59', 59, '198008152026211003', 'M.MANSUR', 'Operator Layanan Operasional', 'PPPK', 'V', 'PPPK', 'administrasi', '2026-01-01', '2026-01-01', 2550000, 2500000, 5, 'Aktif', False, 'Fungsional  Umum', 'PPPK PARUH WAKTU', NULL, 'SMP', '', '', '', 'Sekretariat', 'Bapperida');
