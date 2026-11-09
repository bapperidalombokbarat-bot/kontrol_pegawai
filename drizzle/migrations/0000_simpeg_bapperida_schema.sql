CREATE TYPE public.simpeg_app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  job_title text NOT NULL DEFAULT '',
  avatar_url text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.simpeg_app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT _user_id = (SELECT auth.uid()) AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

CREATE FUNCTION public.handle_new_simpeg_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  assigned_role public.simpeg_app_role;
BEGIN
  PERFORM pg_advisory_xact_lock(93845017);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    assigned_role := 'user';
  ELSE
    assigned_role := 'admin';
  END IF;
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role) ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_simpeg_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_simpeg_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_simpeg_user();

CREATE POLICY "profiles_read_self_or_admin" ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "user_roles_read_self_or_admin" ON public.user_roles FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'));

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nip text NOT NULL UNIQUE CHECK (nip ~ '^[0-9]{18}$'),
  name text NOT NULL,
  position text NOT NULL DEFAULT '',
  rank text NOT NULL DEFAULT '',
  grade text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT 'PNS' CHECK (employment_type IN ('PNS', 'PPPK')),
  retirement_category text NOT NULL DEFAULT 'administrasi' CHECK (retirement_category IN ('administrasi', 'pimpinan_tinggi', 'ahli_madya', 'ahli_utama')),
  last_rank_tmt date,
  last_kgb_tmt date,
  base_salary numeric(14,2) NOT NULL DEFAULT 0 CHECK (base_salary >= 0),
  tpp_basic numeric(14,2) NOT NULL DEFAULT 0 CHECK (tpp_basic >= 0),
  job_class integer NOT NULL DEFAULT 1 CHECK (job_class BETWEEN 1 AND 15),
  status text NOT NULL DEFAULT 'Aktif',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_admin_all" ON public.employees FOR ALL TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin')) WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));
CREATE INDEX employees_name_idx ON public.employees (name);

CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL CHECK (relationship IN ('pasangan', 'anak')),
  birth_date date NOT NULL,
  marital_status text NOT NULL DEFAULT 'belum_menikah',
  is_asn boolean NOT NULL DEFAULT false,
  is_working boolean NOT NULL DEFAULT false,
  student_certificate boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_members_admin_all" ON public.family_members FOR ALL TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin')) WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));
CREATE INDEX family_members_employee_idx ON public.family_members (employee_id);

CREATE TABLE public.promotion_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('Persiapan Berkas', 'Pengusulan SIASN', 'SK Terbit')),
  effective_date date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotion_logs TO authenticated;
GRANT ALL ON public.promotion_logs TO service_role;
ALTER TABLE public.promotion_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotion_logs_admin_all" ON public.promotion_logs FOR ALL TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin')) WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

CREATE TABLE public.kgb_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  old_salary numeric(14,2) NOT NULL DEFAULT 0,
  new_salary numeric(14,2) NOT NULL DEFAULT 0,
  effective_date date,
  status text NOT NULL DEFAULT 'Draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kgb_logs TO authenticated;
GRANT ALL ON public.kgb_logs TO service_role;
ALTER TABLE public.kgb_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kgb_logs_admin_all" ON public.kgb_logs FOR ALL TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin')) WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

CREATE TABLE public.tpp_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period text NOT NULL,
  job_class integer NOT NULL CHECK (job_class BETWEEN 1 AND 15),
  base_amount numeric(14,2) NOT NULL DEFAULT 0,
  productivity_weight numeric(5,2) NOT NULL DEFAULT 60,
  productivity_rate numeric(5,2) NOT NULL DEFAULT 100,
  attendance_weight numeric(5,2) NOT NULL DEFAULT 40,
  attendance_rate numeric(5,2) NOT NULL DEFAULT 100,
  gross_amount numeric(14,2) NOT NULL DEFAULT 0,
  deduction_amount numeric(14,2) NOT NULL DEFAULT 0,
  net_amount numeric(14,2) NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tpp_calculations TO authenticated;
GRANT ALL ON public.tpp_calculations TO service_role;
ALTER TABLE public.tpp_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tpp_calculations_admin_all" ON public.tpp_calculations FOR ALL TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin')) WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

CREATE TABLE public.backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL CHECK (operation IN ('ekspor', 'pemulihan')),
  file_name text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.backup_logs TO authenticated;
GRANT ALL ON public.backup_logs TO service_role;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backup_logs_admin_read" ON public.backup_logs FOR SELECT TO authenticated USING (public.has_role((SELECT auth.uid()), 'admin'));
CREATE POLICY "backup_logs_admin_insert" ON public.backup_logs FOR INSERT TO authenticated WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

INSERT INTO public.employees (nip, name, position, rank, grade, employment_type, retirement_category, last_rank_tmt, last_kgb_tmt, base_salary, tpp_basic, job_class, is_demo) VALUES
('199005092019031001', 'Fadli Rahman (Contoh)', 'Perencana Ahli Muda', 'Penata', 'III/c', 'PNS', 'administrasi', '2022-04-01', '2025-04-01', 3540000, 5600000, 10, true),
('199211122020072002', 'Sinta Maharani (Contoh)', 'Analis Perencanaan', 'Penata Muda', 'III/a', 'PNS', 'administrasi', '2023-04-01', '2024-06-01', 3210000, 5100000, 9, true),
('198711152011041003', 'Ahmad Fauzi (Contoh)', 'Perencana Ahli Madya', 'Pembina', 'IV/a', 'PNS', 'ahli_madya', '2022-08-01', '2025-06-01', 4320000, 7200000, 12, true),
('199903302021062004', 'Nurul Aini (Contoh)', 'Analis Kebijakan', 'PPPK', 'IX', 'PPPK', 'administrasi', NULL, NULL, 3760000, 4800000, 8, true),
('196812202006021005', 'Lalu Wirawan (Contoh)', 'Kepala Subbagian', 'Pembina Tingkat I', 'IV/b', 'PNS', 'administrasi', '2023-02-01', '2025-02-01', 4980000, 8000000, 11, true);

INSERT INTO public.family_members (employee_id, name, relationship, birth_date, marital_status, is_asn, is_working, student_certificate, is_demo)
SELECT e.id, f.name, f.relationship, f.birth_date::date, f.marital_status, f.is_asn, f.is_working, f.student_certificate, true
FROM (VALUES
('199005092019031001', 'Contoh Pasangan Fadli', 'pasangan', '1993-04-11', 'menikah', false, false, false),
('199005092019031001', 'Contoh Anak Fadli 1', 'anak', '2008-06-20', 'belum_menikah', false, false, false),
('199005092019031001', 'Contoh Anak Fadli 2', 'anak', '2004-01-16', 'belum_menikah', false, false, true),
('199211122020072002', 'Contoh Pasangan Sinta', 'pasangan', '1991-10-02', 'menikah', true, true, false),
('199211122020072002', 'Contoh Anak Sinta', 'anak', '2001-09-25', 'belum_menikah', false, false, true),
('198711152011041003', 'Contoh Pasangan Ahmad', 'pasangan', '1989-02-10', 'menikah', false, false, false),
('198711152011041003', 'Contoh Anak Ahmad', 'anak', '2000-12-02', 'belum_menikah', false, false, true)
) AS f(nip, name, relationship, birth_date, marital_status, is_asn, is_working, student_certificate)
JOIN public.employees e ON e.nip = f.nip;