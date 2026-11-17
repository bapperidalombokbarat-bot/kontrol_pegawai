import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Cloud,
  Database,
  FileCheck2,
  FileDown,
  FileKey2,
  FilePlus2,
  FileSpreadsheet,
  Filter,
  Fingerprint,
  Heart,
  KeyRound,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db as supabase, isTursoEnabled } from "@/lib/database";
import {
  ageParts,
  BIDANG_LIST,
  birthdayWithinDays,
  calculateTpp,
  familyBenefitSummary,
  getEmployeeBidang,
  idDate,
  isChildEligible,
  kgbDueDate,
  nextPromotionDate,
  parseNip,
  pensionWarning,
  retirementDate,
  retirementAge,
  rupiah,
  type FamilyMember as FamilyRuleMember,
} from "@/lib/simpeg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Employee = {
  id: string;
  no_urut?: number;
  nip: string;
  birth_date?: string | null;
  name: string;
  position: string;
  rank: string;
  grade: string;
  employment_type: "PNS" | "PPPK";
  retirement_category: string;
  last_rank_tmt: string | null;
  last_kgb_tmt: string | null;
  base_salary: number;
  tpp_basic: number;
  job_class: number;
  status: string;
  is_demo: boolean;
  jenis_jabatan?: string;
  jenjang_jabatan?: string;
  tmt_jabatan?: string | null;
  pendidikan_terakhir?: string;
  diklat_struktural?: string;
  diklat_fungsional?: string;
  diklat_teknis?: string;
  unit_kerja?: string;
  unor_induk?: string;
  created_at?: string;
};

type Member = {
  id: string;
  employee_id: string;
  name: string;
  relationship: "pasangan" | "anak";
  birth_date: string;
  marital_status: string;
  is_asn: boolean;
  is_working: boolean;
  student_certificate: boolean;
  is_demo: boolean;
};

type PromotionLog = {
  employee_id: string;
  status: string;
  effective_date: string | null;
};

type KgbLog = {
  employee_id: string;
  new_salary: number;
  effective_date: string | null;
  status: string;
};

type TppLog = {
  id: string;
  employee_id: string;
  period: string;
  gross_amount: number;
  net_amount: number;
  created_at: string;
};

type Profile = { id: string; display_name: string; job_title: string; avatar_url: string | null };
type ViewKey = "ringkasan" | "pegawai" | "pangkat" | "kgb" | "kp4" | "tpp" | "cadangan";
type DialogKind = "employee" | "family" | "profile" | "backup" | "restore" | null;

const EMPTY_EMPLOYEE: Omit<Employee, "id" | "is_demo"> = {
  no_urut: 999,
  nip: "",
  birth_date: null,
  name: "",
  position: "",
  rank: "",
  grade: "III/a",
  employment_type: "PNS",
  retirement_category: "administrasi",
  last_rank_tmt: null,
  last_kgb_tmt: null,
  base_salary: 0,
  tpp_basic: 0,
  job_class: 1,
  status: "Aktif",
  jenis_jabatan: "Struktural",
  jenjang_jabatan: "",
  tmt_jabatan: null,
  pendidikan_terakhir: "S1",
  diklat_struktural: "",
  diklat_fungsional: "",
  diklat_teknis: "",
  unit_kerja: "",
  unor_induk: "Bapperida",
};

const TODAY = () => new Date().toISOString().slice(0, 10);
const PAGE_NAMES: Record<ViewKey, string> = {
  ringkasan: "Ringkasan",
  pegawai: "Data pegawai",
  pangkat: "Kenaikan pangkat",
  kgb: "Gaji berkala",
  kp4: "Tunjangan keluarga",
  tpp: "Simulasi TPP",
  cadangan: "Cadangan data",
};

const navigation: { key: ViewKey; label: string; icon: typeof Activity }[] = [
  { key: "ringkasan", label: "Ringkasan", icon: Activity },
  { key: "pegawai", label: "Data pegawai", icon: UsersRound },
  { key: "pangkat", label: "Kenaikan pangkat", icon: ArrowUpRight },
  { key: "kgb", label: "Gaji berkala", icon: WalletCards },
  { key: "kp4", label: "Tunjangan keluarga", icon: Heart },
  { key: "tpp", label: "Simulasi TPP", icon: FileSpreadsheet },
];

function todayFormatted() {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  return idDate(date);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kendala. Silakan coba kembali.";
}

function familyRule(member: Member): FamilyRuleMember {
  return {
    relationship: member.relationship,
    birthDate: member.birth_date,
    maritalStatus: member.marital_status,
    isAsn: member.is_asn,
    isWorking: member.is_working,
    studentCertificate: member.student_certificate,
  };
}

function Notice({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "warning" | "danger" | "success" }) {
  return <div className={`notice notice-${tone}`}>{children}</div>;
}

function StatusPill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

function Metric({ label, value, foot, icon: Icon, tone = "blue" }: { label: string; value: string | number; foot: string; icon: typeof Activity; tone?: string }) {
  return (
    <div className="metric">
      <div className={`metric-icon tone-${tone}`}><Icon size={18} strokeWidth={1.8} /></div>
      <p className="metric-label">{label}</p>
      <div className="metric-value">{value}</div>
      <div className="metric-foot">{foot}</div>
    </div>
  );
}

export function SimpegApp() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"masuk" | "daftar">("masuk");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [promotionLogs, setPromotionLogs] = useState<PromotionLog[]>([]);
  const [kgbLogs, setKgbLogs] = useState<KgbLog[]>([]);
  const [tppLogs, setTppLogs] = useState<TppLog[]>([]);
  const [view, setView] = useState<ViewKey>("ringkasan");
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState({ ...EMPTY_EMPLOYEE });
  const [familyForm, setFamilyForm] = useState({ employee_id: "", name: "", relationship: "anak" as "pasangan" | "anak", birth_date: "", marital_status: "belum_menikah", is_asn: false, is_working: false, student_certificate: false });
  const [profileForm, setProfileForm] = useState({ display_name: "", job_title: "" });
  const [search, setSearch] = useState("");
  const [selectedBidang, setSelectedBidang] = useState<string>("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pageError, setPageError] = useState("");
  const [success, setSuccess] = useState("");
  const [tppEmployeeId, setTppEmployeeId] = useState("");
  const [productivityWeight, setProductivityWeight] = useState(60);
  const [productivityRate, setProductivityRate] = useState(100);
  const [attendanceWeight, setAttendanceWeight] = useState(40);
  const [attendanceRate, setAttendanceRate] = useState(100);
  const [zakatEnabled, setZakatEnabled] = useState(false);
  const [tppPeriod, setTppPeriod] = useState(TODAY().slice(0, 7));
  const [backupPassphrase, setBackupPassphrase] = useState("");
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async (userId: string) => {
    setPageError("");
    const [roleResult, profileResult, employeesResult, membersResult, promotionsResult, kgbResult, tppResult] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("id, display_name, job_title, avatar_url").eq("id", userId).maybeSingle(),
      supabase.from("employees").select("*").order("no_urut", { ascending: true }),
      supabase.from("family_members").select("*").order("birth_date"),
      supabase.from("promotion_logs").select("employee_id, status, effective_date").order("created_at", { ascending: false }),
      supabase.from("kgb_logs").select("employee_id, new_salary, effective_date, status").order("created_at", { ascending: false }),
      supabase.from("tpp_calculations").select("id, employee_id, period, gross_amount, net_amount, created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    const error = roleResult.error ?? profileResult.error ?? employeesResult.error ?? membersResult.error ?? promotionsResult.error ?? kgbResult.error ?? tppResult.error;
    if (error) {
      setPageError(error.message);
      return;
    }
    setIsAdmin((roleResult.data ?? []).some((entry) => entry.role === "admin"));
    setProfile((profileResult.data as Profile | null) ?? null);
    setProfileForm({ display_name: profileResult.data?.display_name ?? "", job_title: profileResult.data?.job_title ?? "" });
    setEmployees(((employeesResult.data ?? []) as Employee[]).sort((a, b) => (a.no_urut ?? 999) - (b.no_urut ?? 999)));
    setMembers((membersResult.data ?? []) as Member[]);
    setPromotionLogs((promotionsResult.data ?? []) as PromotionLog[]);
    setKgbLogs((kgbResult.data ?? []) as KgbLog[]);
    setTppLogs((tppResult.data ?? []) as TppLog[]);
  }, []);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) void loadData(data.session.user.id);
      setAuthReady(true);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        void loadData(nextSession.user.id);
      }
      if (event === "SIGNED_OUT") {
        setEmployees([]); setMembers([]); setProfile(null); setIsAdmin(false);
      }
    });
    return () => { mounted = false; authListener.subscription.unsubscribe(); };
  }, [loadData]);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setView("pegawai");
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (event.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const employeeBirth = employeeForm.nip.length === 18 ? parseNip(employeeForm.nip) : null;
  const activeEmployees = useMemo(() => employees.filter((employee) => employee.status === "Aktif"), [employees]);
  const memberCounts = useMemo(() => {
    const today = TODAY();
    const birthdays = activeEmployees.flatMap((employee) => {
      const birthDate = employee.birth_date || parseNip(employee.nip)?.birthDate || (employee.nip.length >= 8 ? `${employee.nip.slice(0, 4)}-${employee.nip.slice(4, 6)}-${employee.nip.slice(6, 8)}` : null);
      if (!birthDate) return [];
      const upcoming = birthdayWithinDays(birthDate, today, 60);
      return upcoming ? [{ employee, birthDate, upcoming }] : [];
    }).sort((a, b) => a.upcoming.distance - b.upcoming.distance);
    const pensionList = activeEmployees.flatMap((employee) => {
      const parsed = parseNip(employee.nip);
      if (!parsed) return [];
      const date = retirementDate(parsed.birthDate, employee.retirement_category);
      const tone = pensionWarning(date, today);
      return tone === "Aman" ? [] : [{ employee, date, tone }];
    }).sort((a, b) => a.date.localeCompare(b.date));
    const promotionList = activeEmployees.flatMap((employee) => {
      if (!employee.last_rank_tmt) return [];
      const date = nextPromotionDate(employee.last_rank_tmt, today);
      const days = Math.ceil((new Date(`${date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000);
      return days > 0 && days <= 183 ? [{ employee, date, days }] : [];
    }).sort((a, b) => a.date.localeCompare(b.date));
    const kgbList = activeEmployees.flatMap((employee) => {
      const date = kgbDueDate(employee.last_kgb_tmt);
      if (!date) return [];
      const days = Math.ceil((new Date(`${date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000);
      return days >= 0 && days <= 90 ? [{ employee, date, days }] : [];
    }).sort((a, b) => a.date.localeCompare(b.date));
    return { birthdays, pensionList, promotionList, kgbList };
  }, [activeEmployees]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("id-ID");
    let result = employees;

    if (selectedBidang && selectedBidang !== "all") {
      result = result.filter((employee) => getEmployeeBidang(employee) === selectedBidang);
    }

    if (q) {
      result = result.filter((employee) =>
        `${employee.name} ${employee.nip} ${employee.position} ${employee.grade} ${employee.unit_kerja ?? ""} ${employee.jenis_jabatan ?? ""} ${employee.pendidikan_terakhir ?? ""}`
          .toLocaleLowerCase("id-ID")
          .includes(q)
      );
    }

    return result;
  }, [employees, search, selectedBidang]);

  const selectedTppEmployee = employees.find((employee) => employee.id === tppEmployeeId) ?? employees[0] ?? null;
  const tppResult = selectedTppEmployee ? calculateTpp({
    base: Number(selectedTppEmployee.tpp_basic), productivityWeight, productivityRate, attendanceWeight, attendanceRate,
    grade: selectedTppEmployee.grade, zakatEnabled,
  }) : null;

  function notify(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 3800);
  }

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setAuthError(""); setAuthNotice("");
    const result = authMode === "masuk"
      ? await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword })
      : await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword, options: { emailRedirectTo: window.location.origin, data: { full_name: authName.trim() } } });
    setBusy(false);
    if (result.error) { setAuthError(result.error.message); return; }
    if (authMode === "daftar" && !result.data.session) {
      setAuthNotice("Pendaftaran berhasil. Buka tautan konfirmasi yang kami kirim ke email Anda untuk mengaktifkan akun.");
      return;
    }
    if (authMode === "masuk" && result.data.user) void loadData(result.data.user.id);
  }

  async function signInSocial(provider: "google" | "lovable") {
    setAuthError("");
    const result = await supabase.auth.signInOAuth(provider);
    if (result.error) setAuthError(result.error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setView("ringkasan"); setDialog(null);
  }

  function openNewEmployee() {
    setSelectedEmployee(null);
    setEmployeeForm({ ...EMPTY_EMPLOYEE, no_urut: employees.length + 1 });
    setDialog("employee");
  }

  function openEditEmployee(employee: Employee) {
    setSelectedEmployee(employee);
    let initialNip = employee.nip.replace(/\D/g, "");
    if (initialNip.length === 19 && initialNip.endsWith("0001")) {
      initialNip = initialNip.slice(0, 15) + "001";
    }
    let initialBirthDate = employee.birth_date;
    if (!initialBirthDate && initialNip.length >= 8) {
      initialBirthDate = `${initialNip.slice(0, 4)}-${initialNip.slice(4, 6)}-${initialNip.slice(6, 8)}`;
    }
    setEmployeeForm({
      no_urut: employee.no_urut ?? 999,
      nip: initialNip, birth_date: initialBirthDate, name: employee.name, position: employee.position, rank: employee.rank, grade: employee.grade,
      employment_type: employee.employment_type, retirement_category: employee.retirement_category,
      last_rank_tmt: employee.last_rank_tmt, last_kgb_tmt: employee.last_kgb_tmt,
      base_salary: Number(employee.base_salary), tpp_basic: Number(employee.tpp_basic), job_class: employee.job_class, status: employee.status,
      jenis_jabatan: employee.jenis_jabatan ?? "Struktural",
      jenjang_jabatan: employee.jenjang_jabatan ?? "",
      tmt_jabatan: employee.tmt_jabatan ?? null,
      pendidikan_terakhir: employee.pendidikan_terakhir ?? "S1",
      diklat_struktural: employee.diklat_struktural ?? "",
      diklat_fungsional: employee.diklat_fungsional ?? "",
      diklat_teknis: employee.diklat_teknis ?? "",
      unit_kerja: employee.unit_kerja ?? "",
      unor_induk: employee.unor_induk ?? "Bapperida",
    });
    setDialog("employee");
  }

  async function saveEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setPageError("");
    try {
      let cleanNip = employeeForm.nip.replace(/\D/g, "");
      if (cleanNip.length === 19 && cleanNip.endsWith("0001")) {
        cleanNip = cleanNip.slice(0, 15) + "001";
      }
      let birthDate = employeeForm.birth_date;
      if (!birthDate && cleanNip.length >= 8) {
        birthDate = `${cleanNip.slice(0, 4)}-${cleanNip.slice(4, 6)}-${cleanNip.slice(6, 8)}`;
      }
      const payload = {
        ...employeeForm,
        birth_date: birthDate,
        no_urut: employeeForm.no_urut ? Number(employeeForm.no_urut) : undefined,
        nip: cleanNip,
        base_salary: Number(employeeForm.base_salary),
        tpp_basic: Number(employeeForm.tpp_basic),
        job_class: Number(employeeForm.job_class),
        updated_at: new Date().toISOString(),
        ...(selectedEmployee ? {} : { is_demo: false }),
      };
      const result = selectedEmployee
        ? await supabase.from("employees").update(payload).eq("id", selectedEmployee.id).select().single()
        : await supabase.from("employees").insert(payload).select().single();
      if (result.error) {
        setPageError(result.error.message || String(result.error));
        return;
      }
      setEmployees((current) =>
        (selectedEmployee
          ? current.map((entry) => (entry.id === selectedEmployee.id ? (result.data as Employee) : entry))
          : [...current, result.data as Employee]
        ).sort((a, b) => (a.no_urut ?? 999) - (b.no_urut ?? 999))
      );
      setDialog(null);
      notify(selectedEmployee ? "Data pegawai berhasil diperbarui." : "Pegawai berhasil ditambahkan.");
    } catch (err: any) {
      setPageError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  async function deleteEmployee(employee: Employee) {
    if (!window.confirm(`Hapus data ${employee.name} beserta catatan terkait? Tindakan ini tidak dapat dibatalkan.`)) return;
    const result = await supabase.from("employees").delete().eq("id", employee.id);
    if (result.error) { setPageError(result.error.message); return; }
    setEmployees((current) => current.filter((entry) => entry.id !== employee.id));
    setMembers((current) => current.filter((entry) => entry.employee_id !== employee.id));
    notify("Data pegawai berhasil dihapus.");
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!session?.user) return;
    setBusy(true);
    const result = await supabase.from("profiles").upsert({ id: session.user.id, ...profileForm, updated_at: new Date().toISOString() }).select("id, display_name, job_title, avatar_url").single();
    setBusy(false);
    if (result.error) { setPageError(result.error.message); return; }
    setProfile(result.data as Profile); setDialog(null); notify("Profil berhasil disimpan.");
  }

  function openFamily(employee?: Employee) {
    const target = employee ?? employees[0];
    setFamilyForm({ employee_id: target?.id ?? "", name: "", relationship: "anak", birth_date: "", marital_status: "belum_menikah", is_asn: false, is_working: false, student_certificate: false });
    setDialog("family");
  }

  async function saveFamily(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const result = await supabase.from("family_members").insert({ ...familyForm, is_demo: false }).select().single();
    setBusy(false);
    if (result.error) { setPageError(result.error.message); return; }
    setMembers((current) => [...current, result.data as Member]); setDialog(null); notify("Tanggungan berhasil ditambahkan.");
  }

  async function updatePromotion(employee: Employee) {
    const currentLog = promotionLogs.find((log) => log.employee_id === employee.id);
    const stages = ["Persiapan Berkas", "Pengusulan SIASN", "SK Terbit"];
    const next = stages[(stages.indexOf(currentLog?.status ?? "") + 1) % stages.length];
    if (!next) return;
    const result = await supabase.from("promotion_logs").insert({ employee_id: employee.id, status: next, effective_date: next === "SK Terbit" ? nextPromotionDate(employee.last_rank_tmt ?? TODAY(), TODAY()) : null });
    if (result.error) { setPageError(result.error.message); return; }
    const row = { employee_id: employee.id, status: next, effective_date: next === "SK Terbit" ? nextPromotionDate(employee.last_rank_tmt ?? TODAY(), TODAY()) : null };
    setPromotionLogs((current) => [row, ...current.filter((log) => log.employee_id !== employee.id)]);
    notify(`Tahap pangkat ${employee.name} diperbarui.`);
  }

  async function saveTpp() {
    if (!selectedTppEmployee || !tppResult) return;
    setBusy(true);
    const result = await supabase.from("tpp_calculations").insert({
      employee_id: selectedTppEmployee.id, period: tppPeriod, job_class: selectedTppEmployee.job_class,
      base_amount: selectedTppEmployee.tpp_basic, productivity_weight: productivityWeight, productivity_rate: productivityRate,
      attendance_weight: attendanceWeight, attendance_rate: attendanceRate, gross_amount: tppResult.gross,
      deduction_amount: tppResult.deductions, net_amount: tppResult.net,
      details: { tax: tppResult.tax, bpjs: tppResult.bpjs, zakat: tppResult.zakat },
    }).select("id, employee_id, period, gross_amount, net_amount, created_at").single();
    setBusy(false);
    if (result.error) { setPageError(result.error.message); return; }
    setTppLogs((current) => [result.data as TppLog, ...current]); notify("Simulasi TPP tersimpan pada rekap bulanan.");
  }

  async function recordKgb(employee: Employee, salaryInput: string) {
    const salary = Number(salaryInput);
    if (!Number.isFinite(salary) || salary < 0) return;
    setBusy(true);
    const dueDate = kgbDueDate(employee.last_kgb_tmt);
    const result = await supabase.from("kgb_logs").insert({ employee_id: employee.id, old_salary: employee.base_salary, new_salary: salary, effective_date: dueDate, status: "Draft" });
    setBusy(false);
    if (result.error) { setPageError(result.error.message); return; }
    setKgbLogs((current) => [{ employee_id: employee.id, new_salary: salary, effective_date: dueDate, status: "Draft" }, ...current]); notify("Draft pemberitahuan KGB tersimpan.");
  }

  async function saveEncryptedBackup() {
    if (backupPassphrase.trim().length < 12) { setPageError("Gunakan frasa sandi cadangan sedikitnya 12 karakter."); return; }
    setBackupBusy(true); setPageError("");
    try {
      const [employeeRows, familyRows, promotionRows, kgbRows, tppRows, profileRow] = await Promise.all([
        supabase.from("employees").select("*"), supabase.from("family_members").select("*"),
        supabase.from("promotion_logs").select("*"), supabase.from("kgb_logs").select("*"),
        supabase.from("tpp_calculations").select("*"),
        session?.user ? supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ]);
      const error = employeeRows.error ?? familyRows.error ?? promotionRows.error ?? kgbRows.error ?? tppRows.error ?? profileRow.error;
      if (error) throw error;
      const payload = JSON.stringify({
        format: "SIMPEG-BAPPERIDA-BACKUP", version: 1, createdAt: new Date().toISOString(),
        profile: profileRow.data ? { ...profileRow.data, id: session?.user.id } : null,
        employees: employeeRows.data ?? [], family_members: familyRows.data ?? [],
        promotion_logs: promotionRows.data ?? [], kgb_logs: kgbRows.data ?? [], tpp_calculations: tppRows.data ?? [],
      });
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(backupPassphrase), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(payload));
      const envelope = {
        format: "SIMPEG-BAPPERIDA-ENCRYPTED", version: 1, algorithm: "AES-256-GCM", kdf: "PBKDF2-SHA-256",
        iterations: 310_000, salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(encrypted)),
      };
      const date = TODAY();
      downloadFile(JSON.stringify(envelope, null, 2), `backup_kepegawaian_bapperida_${date}.json`, "application/json");
      await supabase.from("backup_logs").insert({ operation: "ekspor", file_name: `backup_kepegawaian_bapperida_${date}.json`, details: { employee_count: employeeRows.data?.length ?? 0 } });
      setBackupPassphrase(""); setDialog(null); notify("Cadangan terenkripsi berhasil diunduh.");
    } catch (error) { setPageError(errorMessage(error)); }
    setBackupBusy(false);
  }

  async function restoreEncryptedBackup() {
    if (!backupFile || backupPassphrase.trim().length < 12) { setPageError("Pilih berkas cadangan dan masukkan frasa sandi minimal 12 karakter."); return; }
    setBackupBusy(true); setPageError("");
    try {
      const envelope = JSON.parse(await backupFile.text()) as Record<string, unknown>;
      if (envelope["format"] !== "SIMPEG-BAPPERIDA-ENCRYPTED" || envelope["version"] !== 1 || envelope["algorithm"] !== "AES-256-GCM" || typeof envelope["salt"] !== "string" || typeof envelope["iv"] !== "string" || typeof envelope["ciphertext"] !== "string") throw new Error("Format berkas cadangan tidak dikenali.");
      const salt = base64ToBytes(envelope["salt"]); const iv = base64ToBytes(envelope["iv"]); const ciphertext = base64ToBytes(envelope["ciphertext"]);
      const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(backupPassphrase), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
      const backup = JSON.parse(new TextDecoder().decode(plaintext)) as Record<string, unknown>;
      if (backup["format"] !== "SIMPEG-BAPPERIDA-BACKUP" || backup["version"] !== 1) throw new Error("Isi berkas cadangan tidak cocok dengan aplikasi.");
      const tables = ["employees", "family_members", "promotion_logs", "kgb_logs", "tpp_calculations"] as const;
      for (const table of tables) {
        const rows = backup[table];
        if (!Array.isArray(rows)) throw new Error(`Data ${table} pada berkas cadangan tidak valid.`);
        if (rows.length === 0) continue;
        const result = await supabase.from(table).upsert(rows as never[], { onConflict: "id" });
        if (result.error) throw result.error;
      }
      if (session?.user && backup["profile"] && typeof backup["profile"] === "object") {
        const savedProfile = backup["profile"] as Record<string, unknown>;
        const profileResult = await supabase.from("profiles").upsert({ id: session.user.id, display_name: String(savedProfile["display_name"] ?? ""), job_title: String(savedProfile["job_title"] ?? "") });
        if (profileResult.error) throw profileResult.error;
      }
      await supabase.from("backup_logs").insert({ operation: "pemulihan", file_name: backupFile.name, details: typeof backup["createdAt"] === "string" ? { created_at: backup["createdAt"] } : {} });
      if (session?.user) await loadData(session.user.id);
      setBackupPassphrase(""); setBackupFile(null); setDialog(null); notify("Pemulihan selesai. Data cadangan telah digabungkan dengan data saat ini.");
    } catch (error) {
      setPageError(error instanceof DOMException ? "Frasa sandi salah atau berkas cadangan rusak." : errorMessage(error));
    }
    setBackupBusy(false);
  }

  function clearDemoData() {
    if (!window.confirm("Hapus lima pegawai contoh beserta tanggungan terkait? Pegawai yang Anda tambahkan sendiri tidak akan dihapus.")) return;
    void (async () => {
      const demoIds = employees.filter((employee) => employee.is_demo).map((employee) => employee.id);
      if (demoIds.length === 0) { notify("Data contoh sudah tidak ada."); return; }
      const result = await supabase.from("employees").delete().in("id", demoIds);
      if (result.error) { setPageError(result.error.message); return; }
      setEmployees((current) => current.filter((employee) => !employee.is_demo));
      setMembers((current) => current.filter((member) => !member.is_demo));
      notify("Data pegawai contoh berhasil dihapus.");
    })();
  }

  if (!authReady) {
    return <main className="auth-loading"><span className="brand-mark"><Fingerprint size={24} /></span><p>Menyiapkan ruang kerja Anda…</p></main>;
  }

  if (!session) {
    return (
      <main className="auth-layout">
        <section className="auth-brand-panel">
          <div className="auth-brand"><span className="brand-mark"><Fingerprint size={23} /></span><span>BAPPERIDA <span>LOMBOK BARAT</span></span></div>
          <div className="auth-story">
            <span className="eyebrow"><span className="eyebrow-dot" /> RUANG KERJA KEPEGAWAIAN</span>
            <h1>Lebih teratur,<br />lebih terjaga.</h1>
            <p>Pantau perjalanan kepegawaian, tanggungan keluarga, dan perencanaan TPP dalam satu ruang kerja.</p>
            <div className="auth-illustration" aria-hidden="true">
              <div className="illustration-orbit orbit-one" /><div className="illustration-orbit orbit-two" />
              <div className="illustration-ring"><span><UsersRound size={30} /></span></div>
              <div className="floating-note note-a"><CalendarDays size={15} /><span>Jadwal tertata</span></div>
              <div className="floating-note note-b"><ShieldCheck size={15} /><span>Data terlindungi</span></div>
              <div className="illustration-dots" />
            </div>
          </div>
          <div className="auth-footer"><span>BADAN PERENCANAAN PEMBANGUNAN, RISET DAN INOVASI DAERAH</span><span>© 2026 · LOMBOK BARAT</span></div>
        </section>
        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-overline">AKSES TERBATAS · {isTursoEnabled ? "TURSO DB ONLINE" : "MODE LOCALHOST"}</div>
            <h2>{authMode === "masuk" ? "Selamat datang" : "Buat akun Anda"}</h2>
            <p className="auth-subtitle">{authMode === "masuk" ? (isTursoEnabled ? "Masuk ke ruang kerja terhubung Turso Cloud Database." : "Masuk ke ruang kerja administrasi kepegawaian (Mode Mandiri/Localhost).") : "Daftarkan email kedinasan untuk memulai."}</p>
            <div style={{ marginBottom: "1rem" }}>
              <Button
                type="button"
                size="lg"
                style={{ width: "100%", backgroundColor: "#047857", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                onClick={() => void supabase.auth.signInWithPassword({ email: "admin@bapperida.lombokbarat.go.id" })}
              >
                <ShieldCheck size={18} />
                <span>Masuk Cepat sebagai Admin</span>
              </Button>
            </div>
            <div className="auth-divider"><span />atau masukkan akun<span /></div>
            <form className="auth-fields" onSubmit={signIn}>
              <div className="field"><Label htmlFor="auth-email">Alamat email</Label><Input id="auth-email" type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required placeholder="nama@instansi.go.id" /></div>
              <div className="field"><div className="field-label-row"><Label htmlFor="auth-password">Kata sandi</Label><KeyRound size={14} /></div><Input id="auth-password" type="password" autoComplete="current-password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required placeholder="Masukkan kata sandi" /></div>
              {authError && <Notice tone="danger">{authError}</Notice>}
              {authNotice && <Notice tone="success">{authNotice}</Notice>}
              <Button type="submit" size="lg" className="auth-submit" disabled={busy}>{busy ? "Mohon tunggu…" : "Masuk ke ruang kerja"}<ArrowRight size={16} /></Button>
            </form>
            <div className="auth-divider"><span />atau masuk dengan<span /></div>
            <div className="social-buttons">
              <Button type="button" variant="outline" className="social-button" onClick={() => void signInSocial("google")}><GoogleMark />Masuk dengan Google</Button>
              <Button type="button" variant="outline" className="social-button" onClick={() => void signInSocial("lovable")}><span className="lovable-mark"><Sparkles size={16} /></span>Masuk dengan Lovable</Button>
            </div>
            <div className="auth-security"><ShieldCheck size={16} /><span>Mode Localhost: Data tersimpan secara mandiri &amp; aman di browser lokal.</span></div>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="access-pending">
        <div className="pending-card"><span className="brand-mark"><ShieldCheck size={23} /></span><h1>Akun menunggu akses</h1><p>Akun Anda sudah aktif, tetapi belum diberi wewenang untuk melihat data kepegawaian. Silakan hubungi administrator Bapperida Lombok Barat.</p><Button variant="outline" onClick={() => void signOut()}><LogOut size={16} /> Keluar dari akun</Button></div>
      </main>
    );
  }

  const today = TODAY();
  const birthdaysToday = memberCounts.birthdays.filter((item) => item.upcoming.distance === 0);
  const recentEmployees = [...employees].sort((a, b) => b.created_at?.localeCompare(a.created_at ?? "") ?? 0).slice(0, 5);
  const sectionClass = "page-content";

  return (
    <div className="app-frame">
      {mobileNavOpen && <button type="button" className="mobile-scrim" aria-label="Tutup menu" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`app-sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><span className="brand-mark"><Fingerprint size={22} /></span><div><strong>SIMPEG</strong><small>BAPPERIDA LOBAR</small></div><Button variant="ghost" size="icon" className="sidebar-close" aria-label="Tutup menu" onClick={() => setMobileNavOpen(false)}><X /></Button></div>
        <div className="sidebar-caption">MENU UTAMA</div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {navigation.map(({ key, label, icon: Icon }) => (
            <button type="button" key={key} className={`nav-item ${view === key ? "nav-item-active" : ""}`} onClick={() => { setView(key); setMobileNavOpen(false); }} aria-current={view === key ? "page" : undefined}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{key === "ringkasan" && memberCounts.pensionList.length > 0 && <span className="nav-count">{memberCounts.pensionList.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-separator" />
        <button type="button" className={`nav-item ${view === "cadangan" ? "nav-item-active" : ""}`} onClick={() => { setView("cadangan"); setMobileNavOpen(false); }}><Database size={18} strokeWidth={1.8} /><span>Cadangan data</span></button>
        <div className="sidebar-spacer" />
        <div className="sidebar-security"><span className="security-icon"><ShieldCheck size={16} /></span><div><strong>{isTursoEnabled ? "Turso DB Online" : "Mode Localhost"}</strong><small>{isTursoEnabled ? "Cloud libSQL Connected" : "Penyimpanan Lokal"}</small></div><span className="online-dot" /></div>
        <div className="sidebar-profile">
          <div className="profile-avatar">{(profile?.display_name || session.user.email || "A").slice(0, 1).toUpperCase()}</div>
          <div className="profile-copy"><strong>{profile?.display_name || session.user.email?.split("@")[0]}</strong><small>{profile?.job_title || "Administrator kepegawaian"}</small></div>
          <Button variant="ghost" size="icon" className="profile-menu" aria-label="Buka profil" onClick={() => setDialog("profile")}><MoreHorizontal size={18} /></Button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <Button variant="ghost" size="icon" className="mobile-menu" aria-label="Buka menu" onClick={() => setMobileNavOpen(true)}><Menu /></Button>
          <div className="breadcrumb"><span>SIMPEG</span><span className="breadcrumb-slash">/</span><strong>{PAGE_NAMES[view]}</strong></div>
          <div className="topbar-tools">
            {view === "pegawai" && (
              <>
                <div className="topbar-filter">
                  <Filter size={15} />
                  <select
                    value={selectedBidang}
                    onChange={(event) => setSelectedBidang(event.target.value)}
                    aria-label="Filter per bidang"
                  >
                    <option value="all">Semua Bidang ({employees.length})</option>
                    {BIDANG_LIST.map((bidang) => {
                      const count = employees.filter((e) => getEmployeeBidang(e) === bidang).length;
                      return (
                        <option key={bidang} value={bidang}>
                          {bidang} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="global-search">
                  <Search size={16} />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari pegawai atau NIP"
                    aria-label="Cari pegawai atau NIP"
                  />
                  <kbd>Ctrl K</kbd>
                </div>
              </>
            )}
            <Button variant="outline" size="sm" className="backup-quick" onClick={() => { setBackupPassphrase(""); setDialog("backup"); }}><ArrowDownToLine size={15} /><span>Cadangkan</span></Button>
            <Button variant="ghost" size="icon" className="topbar-avatar" aria-label="Buka profil" onClick={() => setDialog("profile")}><span>{(profile?.display_name || session.user.email || "A").slice(0, 1).toUpperCase()}</span></Button>
          </div>
        </header>

        <main className={sectionClass}>
          {(pageError || success) && <div className="page-feedback">{pageError && <Notice tone="danger">{pageError}<Button variant="ghost" size="icon" aria-label="Tutup pesan" onClick={() => setPageError("")}><X size={15} /></Button></Notice>}{success && <Notice tone="success"><Check size={16} />{success}</Notice>}</div>}

          {view === "ringkasan" && (
            <>
              <div className="page-heading dashboard-heading"><div><div className="date-kicker"><CalendarDays size={15} />{todayFormatted()}</div><h1>Selamat bekerja{profile?.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}.</h1><p>Ringkasan administrasi kepegawaian Bapperida Lombok Barat.</p></div><Button onClick={openNewEmployee}><Plus size={17} />Tambah pegawai</Button></div>
              <div className="metric-grid">
                <Metric label="Pegawai aktif" value={activeEmployees.length} foot={`${employees.filter((employee) => employee.employment_type === "PNS").length} PNS · ${employees.filter((employee) => employee.employment_type === "PPPK").length} PPPK`} icon={UsersRound} tone="blue" />
                <Metric label="Usul pangkat dekat" value={memberCounts.promotionList.length} foot="Dalam 6 bulan mendatang" icon={ArrowUpRight} tone="teal" />
                <Metric label="KGB segera jatuh tempo" value={memberCounts.kgbList.length} foot="Dalam 90 hari mendatang" icon={WalletCards} tone="amber" />
                <Metric label="Mendekati pensiun" value={memberCounts.pensionList.length} foot="Persiapan atau kritis" icon={Bell} tone="rose" />
              </div>

              <div className="dashboard-grid">
                <section className="panel warning-panel">
                  <div className="panel-heading"><div><span className="section-kicker">PERLU PERHATIAN</span><h2>Pusat pengingat</h2></div><span className="panel-date">Hari ini · {formatDate(today).split(",").slice(1).join(",").trim()}</span></div>
                  <Tabs defaultValue="pensiun" className="warning-tabs">
                    <TabsList className="warning-tab-list"><TabsTrigger value="pensiun">Pensiun <span>{memberCounts.pensionList.length}</span></TabsTrigger><TabsTrigger value="kgb">KGB <span>{memberCounts.kgbList.length}</span></TabsTrigger><TabsTrigger value="pangkat">Pangkat <span>{memberCounts.promotionList.length}</span></TabsTrigger><TabsTrigger value="ulang-tahun">Ulang tahun <span>{memberCounts.birthdays.length}</span></TabsTrigger></TabsList>
                    <div className="warning-list">{memberCounts.pensionList.slice(0, 4).map(({ employee, date, tone }) => <div className="warning-row" key={employee.id}><span className={`warning-marker marker-${tone.toLowerCase()}`} /><div className="warning-main"><strong>{employee.name}</strong><span>{employee.position || employee.rank} · {formatDate(date)}</span></div><StatusPill tone={tone === "Kritis" ? "danger" : "warning"}>{tone}</StatusPill></div>)}{memberCounts.pensionList.length === 0 && <EmptyState icon={ShieldCheck} title="Belum ada pengingat pensiun" detail="Pegawai dengan jadwal pensiun dekat akan muncul di sini." />}</div>
                    <TabsContent value="kgb" className="warning-list">{memberCounts.kgbList.map(({ employee, date, days }) => <div className="warning-row" key={employee.id}><span className="warning-marker marker-amber" /><div className="warning-main"><strong>{employee.name}</strong><span>{employee.grade} · {formatDate(date)}</span></div><StatusPill tone="warning">{days === 0 ? "Hari ini" : `${days} hari`}</StatusPill></div>)}{memberCounts.kgbList.length === 0 && <EmptyState icon={WalletCards} title="Belum ada KGB terdekat" detail="Jatuh tempo KGB dalam 90 hari akan terlihat di sini." />}</TabsContent>
                    <TabsContent value="pangkat" className="warning-list">{memberCounts.promotionList.map(({ employee, date, days }) => <div className="warning-row" key={employee.id}><span className="warning-marker marker-teal" /><div className="warning-main"><strong>{employee.name}</strong><span>{employee.grade} · periode {formatDate(date)}</span></div><StatusPill tone="info">{days} hari</StatusPill></div>)}{memberCounts.promotionList.length === 0 && <EmptyState icon={ArrowUpRight} title="Belum ada usul pangkat dekat" detail="Pegawai dalam enam bulan masa persiapan akan muncul di sini." />}</TabsContent>
                    <TabsContent value="ulang-tahun" className="warning-list">
                      {memberCounts.birthdays.map(({ employee, birthDate, upcoming }) => {
                        const age = ageParts(birthDate, today);
                        return (
                          <div className="warning-row" key={employee.id}>
                            <span className="birthday-avatar">{employee.name.slice(0, 1)}</span>
                            <div className="warning-main">
                              <strong>
                                {employee.name}
                                {upcoming.distance === 0 && <span className="birthday-today"> · Hari ini</span>}
                              </strong>
                              <span>
                                {formatDate(birthDate)} · Ke-{age.years + (upcoming.distance === 0 ? 0 : 1)} th · {upcoming.distance === 0 ? "Selamat ulang tahun!" : upcoming.distance === 1 ? "Besok" : `dalam ${upcoming.distance} hari`}
                              </span>
                            </div>
                            <StatusPill tone={upcoming.distance <= 7 ? "danger" : upcoming.distance <= 30 ? "warning" : "info"}>
                              {upcoming.distance === 0 ? "Hari ini 🎂" : `${upcoming.distance} hari`}
                            </StatusPill>
                          </div>
                        );
                      })}
                      {memberCounts.birthdays.length === 0 && (
                        <EmptyState
                          icon={CalendarDays}
                          title="Belum ada ulang tahun dalam 2 bulan ke depan"
                          detail="Pegawai yang berulang tahun dalam 60 hari ke depan akan dipantau di sini."
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </section>

                <section className="panel birthday-panel">
                  <div className="birthday-topline"><span className="birthday-symbol"><Sparkles size={18} /></span><span>RADAR HARI INI</span></div>
                  <h2>{birthdaysToday.length > 0 ? "Selamat ulang tahun!" : "Early Warning System"}</h2>
                  {birthdaysToday.length > 0 ? (
                    <div className="birthday-card-list">
                      {birthdaysToday.map(({ employee, birthDate }) => (
                        <div key={employee.id} className="birthday-card">
                          <div className="birthday-card-avatar">{employee.name.slice(0, 1)}</div>
                          <div>
                            <strong>{employee.name}</strong>
                            <small>{employee.position || employee.rank}</small>
                            <span>Semoga sehat, berkah, dan sukses selalu. 🎂</span>
                          </div>
                          <span className="birthday-confetti">🎉</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="birthday-copy">
                      {memberCounts.birthdays.length
                        ? `${memberCounts.birthdays.length} pegawai akan berulang tahun dalam 2 bulan ke depan (EWS 60 hari aktif).`
                        : "Semua jadwal penting pegawai tercatat dan siap dipantau."}
                    </p>
                  )}
                  <div className="birthday-footer"><span><span className="online-dot" /> EARLY WARNING (60 HARI)</span><span>{memberCounts.birthdays.length} terpantau</span></div>
                </section>

                <section className="panel employees-panel"><div className="panel-heading"><div><span className="section-kicker">TERBARU</span><h2>Daftar pegawai</h2></div><Button variant="ghost" size="sm" className="text-link" onClick={() => setView("pegawai")}>Lihat semua<ArrowRight size={15} /></Button></div><EmployeeTable employees={recentEmployees} logs={promotionLogs} onEdit={openEditEmployee} onDelete={deleteEmployee} compact /></section>
                <section className="panel insight-panel"><span className="section-kicker">RINGKASAN STATUS</span><h2>Komposisi pegawai</h2><div className="staff-mix"><div className="mix-label"><span>PNS</span><strong>{employees.filter((employee) => employee.employment_type === "PNS").length}</strong></div><div className="mix-track"><span className="mix-pns" style={{ width: `${employees.length ? employees.filter((employee) => employee.employment_type === "PNS").length / employees.length * 100 : 0}%` }} /></div><div className="mix-label"><span>PPPK</span><strong>{employees.filter((employee) => employee.employment_type === "PPPK").length}</strong></div><div className="mix-track"><span className="mix-pppk" style={{ width: `${employees.length ? employees.filter((employee) => employee.employment_type === "PPPK").length / employees.length * 100 : 0}%` }} /></div></div><div className="insight-note"><span className="insight-note-icon"><BadgeCheck size={16} /></span><span>{employees.filter((employee) => employee.is_demo).length} data contoh tersedia untuk uji coba.</span></div></section>
              </div>
            </>
          )}

          {view === "pegawai" && (
            <>
              <PageTitle
                eyebrow="PENGELOLAAN DATA"
                title="Data pegawai"
                subtitle="Data induk kepegawaian Bapperida Lombok Barat (Rekon Oktober 2026)."
                action={<Button onClick={openNewEmployee}><Plus size={17} />Tambah pegawai</Button>}
              />
              <div className="panel data-panel">
                <div className="data-toolbar">
                  <div className="result-count">
                    <strong>{filteredEmployees.length}</strong> pegawai terdaftar
                    {selectedBidang !== "all" && (
                      <span style={{ marginLeft: "6px", color: "var(--accent-teal)", fontWeight: 600 }}>
                        · {selectedBidang}
                      </span>
                    )}
                    {search && (
                      <span style={{ marginLeft: "6px", color: "var(--accent-blue)", fontWeight: 600 }}>
                        · Pencarian: &ldquo;{search}&rdquo;
                      </span>
                    )}
                    {" "}({filteredEmployees.filter((e) => e.employment_type === "PNS").length} PNS · {filteredEmployees.filter((e) => e.employment_type === "PPPK").length} PPPK)
                    {employees.some((employee) => employee.is_demo) && <span className="demo-marker">· Termasuk data contoh</span>}
                  </div>
                  {(selectedBidang !== "all" || search) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBidang("all");
                        setSearch("");
                      }}
                      style={{ fontSize: "11px", height: "30px", gap: "5px" }}
                    >
                      <X size={14} /> Reset Filter
                    </Button>
                  )}
                </div>
                <EmployeeTable employees={filteredEmployees} logs={promotionLogs} onEdit={openEditEmployee} onDelete={deleteEmployee} />
              </div>
              {employees.some((e) => e.is_demo) && (
                <div className="section-note">
                  <Fingerprint size={16} />Data contoh diberi penanda dan dapat dihapus kapan saja dari pengelolaan pegawai.
                  <Button variant="ghost" size="sm" onClick={clearDemoData}>Hapus data contoh</Button>
                </div>
              )}
            </>
          )}

          {view === "pangkat" && <><PageTitle eyebrow="PEMANTAUAN KARIER" title="Kenaikan pangkat reguler" subtitle="Proyeksi setiap empat tahun mengikuti enam periode layanan BKN." /><div className="metric-grid compact-metrics"><Metric label="Persiapan berkas" value={memberCounts.promotionList.length} foot="Masa persiapan enam bulan" icon={ClipboardList} tone="amber" /><Metric label="Usulan berjalan" value={promotionLogs.filter((log) => log.status === "Pengusulan SIASN").length} foot="Dalam proses SIASN" icon={FileCheck2} tone="blue" /><Metric label="SK terbit" value={promotionLogs.filter((log) => log.status === "SK Terbit").length} foot="Tercatat di aplikasi" icon={BadgeCheck} tone="teal" /><Metric label="Siklus layanan" value="6 periode" foot="Feb · Apr · Jun · Agu · Okt · Des" icon={CalendarDays} tone="rose" /></div><div className="panel data-panel"><div className="panel-heading"><div><span className="section-kicker">DAFTAR PEMANTAUAN</span><h2>Proyeksi pegawai</h2></div></div><PromotionTable employees={filteredEmployees} logs={promotionLogs} onAdvance={updatePromotion} /></div></>}

          {view === "kgb" && <><PageTitle eyebrow="PENGGAJIAN" title="Kenaikan gaji berkala" subtitle="Pantau masa kerja dua tahunan dan siapkan draft pemberitahuan KGB." /><div className="page-note"><CircleHelp size={17} /><span>Nominal gaji baru perlu dikonfirmasi dari tabel gaji dan dokumen kepegawaian resmi. Masukkan nilai yang telah diverifikasi sebelum mencetak draft.</span></div><div className="panel data-panel"><div className="panel-heading"><div><span className="section-kicker">JADWAL DAN DRAFT</span><h2>Jatuh tempo KGB</h2></div></div><KgbTable employees={filteredEmployees} logs={kgbLogs} onSave={recordKgb} /></div></>}

          {view === "kp4" && <><PageTitle eyebrow="TUNJANGAN KELUARGA" title="Tanggungan keluarga · KP4" subtitle="Validasi pasangan dan anak berdasarkan kelayakan tanggungan." action={<Button onClick={() => openFamily()} disabled={!employees.length}><Plus size={17} />Tambah tanggungan</Button>} /><div className="kp4-overview"><div className="kp4-callout"><span className="kp4-callout-icon"><Heart size={19} /></span><div><strong>Validasi sebelum penerbitan</strong><p>Besaran dihitung dari gaji pokok. Pastikan status perkawinan, status ASN pasangan, dan dokumen anak sudah diverifikasi.</p></div></div><Button variant="outline" onClick={() => window.print()}><FileDown size={16} />Cetak lembar KP4</Button></div><div className="panel data-panel"><div className="panel-heading"><div><span className="section-kicker">DAFTAR KELUARGA</span><h2>Validasi tanggungan</h2></div></div><FamilyTable employees={filteredEmployees} members={members} onAdd={openFamily} /></div></>}

          {view === "tpp" && <><PageTitle eyebrow="PERENCANAAN PENGHASILAN" title="Simulasi TPP bulanan" subtitle="Periksa bobot produktivitas, kehadiran, dan rincian potongan." />{!employees.length ? <EmptyPanel title="Belum ada pegawai untuk disimulasikan" detail="Tambahkan data pegawai sebelum memulai simulasi." onAction={openNewEmployee} /> : <div className="tpp-layout"><section className="panel tpp-input-panel"><div className="panel-heading"><div><span className="section-kicker">PARAMETER SIMULASI</span><h2>Masukkan perhitungan</h2></div><WalletCards size={19} className="panel-heading-icon" /></div><div className="form-grid"><div className="field span-two"><Label>Pegawai</Label><Select value={selectedTppEmployee?.id ?? ""} onValueChange={setTppEmployeeId}><SelectTrigger><SelectValue placeholder="Pilih pegawai" /></SelectTrigger><SelectContent>{employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.name} · Kelas {employee.job_class}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label htmlFor="tpp-period">Periode</Label><Input id="tpp-period" type="month" value={tppPeriod} onChange={(event) => setTppPeriod(event.target.value)} /></div><div className="field"><Label>Kelas jabatan</Label><Input value={selectedTppEmployee ? `Kelas ${selectedTppEmployee.job_class}` : ""} readOnly /></div><div className="field"><Label htmlFor="productivity-weight">Bobot produktivitas (%)</Label><Input id="productivity-weight" type="number" min={0} max={100} value={productivityWeight} onChange={(event) => setProductivityWeight(Number(event.target.value))} /></div><div className="field"><Label htmlFor="productivity-rate">Realisasi produktivitas (%)</Label><Input id="productivity-rate" type="number" min={0} max={100} value={productivityRate} onChange={(event) => setProductivityRate(Number(event.target.value))} /></div><div className="field"><Label htmlFor="attendance-weight">Bobot kehadiran (%)</Label><Input id="attendance-weight" type="number" min={0} max={100} value={attendanceWeight} onChange={(event) => setAttendanceWeight(Number(event.target.value))} /></div><div className="field"><Label htmlFor="attendance-rate">Realisasi kehadiran (%)</Label><Input id="attendance-rate" type="number" min={0} max={100} value={attendanceRate} onChange={(event) => setAttendanceRate(Number(event.target.value))} /></div></div><label className="toggle-line"><input type="checkbox" checked={zakatEnabled} onChange={(event) => setZakatEnabled(event.target.checked)} /><span><strong>Hitung zakat / infak 2,5%</strong><small>Potong setelah TPP bruto</small></span><span className={`fake-switch ${zakatEnabled ? "switch-on" : ""}`} /></label><div className="salary-source"><span>Besaran pagu dasar</span><strong>{rupiah(Number(selectedTppEmployee?.tpp_basic ?? 0))}</strong></div><div className="tpp-assumption"><CircleHelp size={15} /><span>Persentase PPh 21 mengikuti golongan sesuai simulasi yang diminta. Pastikan hasil akhir diverifikasi dengan aturan pajak dan ketentuan daerah yang berlaku.</span></div></section>
                <section className="panel tpp-result-panel"><div className="result-top"><span className="section-kicker">RINGKASAN PERHITUNGAN</span><span className="period-badge">{tppPeriod}</span></div>{tppResult && selectedTppEmployee ? <><div className="result-person"><div className="result-person-avatar">{selectedTppEmployee.name.slice(0, 1)}</div><div><strong>{selectedTppEmployee.name}</strong><span>Golongan {selectedTppEmployee.grade}</span></div></div><div className="calculation-list"><div className="calculation-row"><span>Produktivitas kerja</span><span>{rupiah(tppResult.productivityAmount)}</span></div><div className="calculation-row"><span>Disiplin dan kehadiran</span><span>{rupiah(tppResult.attendanceAmount)}</span></div><div className="calculation-row calculation-total"><strong>TPP bruto</strong><strong>{rupiah(tppResult.gross)}</strong></div><div className="calculation-row deduction-row"><span>PPh Pasal 21 · {(tppResult.tax / (tppResult.gross || 1) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</span><span>− {rupiah(tppResult.tax)}</span></div><div className="calculation-row deduction-row"><span>BPJS Kesehatan · 1%</span><span>− {rupiah(tppResult.bpjs)}</span></div>{zakatEnabled && <div className="calculation-row deduction-row"><span>Zakat / infak · 2,5%</span><span>− {rupiah(tppResult.zakat)}</span></div>}<div className="calculation-row calculation-net"><strong>Total potongan</strong><strong>{rupiah(tppResult.deductions)}</strong></div></div><div className="net-pay"><span>PERKIRAAN TPP BERSIH</span><strong>{rupiah(tppResult.net)}</strong><small>Hasil simulasi, bukan nilai pembayaran resmi.</small></div><Button className="save-tpp" onClick={() => void saveTpp()} disabled={busy}>Simpan simulasi<ArrowRight size={16} /></Button></> : <EmptyState icon={WalletCards} title="Pilih pegawai" detail="Pilih pegawai untuk menghitung simulasi TPP." />}</section>
                <section className="panel tpp-history"><div className="panel-heading"><div><span className="section-kicker">RIWAYAT PERHITUNGAN</span><h2>Rekap simulasi tersimpan</h2></div></div><TppHistory logs={tppLogs} employees={employees} /></section></div>}</>}

          {view === "cadangan" && <><PageTitle eyebrow="KEAMANAN DATA" title="Cadangan dan pemulihan" subtitle="Simpan salinan data pegawai dan riwayat dengan enkripsi di perangkat Anda." /><section className="backup-banner"><div className="backup-banner-symbol"><FileKey2 size={24} /></div><div><span>ENKRIPSI DI PERANGKAT</span><h2>Cadangan pribadi Anda</h2><p>Berkas dienkripsi dengan frasa sandi yang Anda pilih sebelum diunduh. Hanya frasa sandi yang sama dapat membukanya kembali.</p></div><ShieldCheck className="backup-banner-shield" size={23} /></section><div className="backup-actions-grid"><section className="panel backup-action-card"><div className="backup-action-icon"><ArrowDownToLine size={20} /></div><span className="section-kicker">SIMPAN SALINAN</span><h2>Unduh cadangan terenkripsi</h2><p>Data pegawai, tanggungan, catatan pangkat, KGB, simulasi TPP, dan profil Anda disimpan sebagai berkas terenkripsi.</p><Button onClick={() => { setBackupPassphrase(""); setDialog("backup"); }}><FileDown size={16} />Buat cadangan</Button></section><section className="panel backup-action-card restore-card"><div className="backup-action-icon"><ArrowLeft size={20} /></div><span className="section-kicker">PULIHKAN DATA</span><h2>Pulihkan dari cadangan</h2><p>Impor berkas terenkripsi yang pernah dibuat. Data dipadukan berdasarkan ID; data yang sudah ada tidak dihapus.</p><Button variant="outline" onClick={() => { setBackupPassphrase(""); setBackupFile(null); setDialog("restore"); }}><ArrowRight size={16} />Pilih berkas cadangan</Button></section></div><div className="backup-info-grid"><div className="backup-info"><FileKey2 size={18} /><div><strong>Frasa sandi tidak disimpan</strong><span>Simpan frasa sandi di tempat yang aman. Berkas tidak dapat dipulihkan tanpanya.</span></div></div><div className="backup-info"><Cloud size={18} /><div><strong>Penyimpanan tetap terlindungi</strong><span>Data utama tersimpan di ruang kerja Cloud dengan pembatasan akses admin.</span></div></div></div><div className="page-note"><CircleHelp size={17} /><span>Pencadangan ini adalah salinan data terstruktur yang dienkripsi, bukan berkas basis data SQLite mentah. Lovable Cloud mengelola penyimpanan data aplikasi.</span></div></>}
        </main>
      </div>

      <Dialog open={dialog === "employee"} onOpenChange={(open) => !open && setDialog(null)}><DialogContent className="simpeg-dialog"><DialogHeader><DialogTitle>{selectedEmployee ? "Perbarui data pegawai" : "Tambah pegawai"}</DialogTitle><DialogDescription>Informasi NIP, jabatan, unit kerja, masa kerja, dan gaji pokok.</DialogDescription></DialogHeader><form onSubmit={saveEmployee} className="dialog-form"><div className="form-grid"><div className="field" style={{ maxWidth: "100px" }}><Label htmlFor="employee-no-urut">No. Urut</Label><Input id="employee-no-urut" type="number" min={1} value={employeeForm.no_urut ?? ""} onChange={(event) => setEmployeeForm((current) => ({ ...current, no_urut: event.target.value ? Number(event.target.value) : undefined }))} placeholder="1" /></div><div className="field" style={{ flex: 1 }}><Label htmlFor="employee-nip">NIP · 18 digit</Label><Input id="employee-nip" inputMode="numeric" maxLength={18} value={employeeForm.nip} onChange={(event) => { let val = event.target.value.replace(/\D/g, ""); if (val.length === 19 && val.endsWith("0001")) { val = val.slice(0, 15) + "001"; } let autoBirth = employeeForm.birth_date; if (val.length >= 8) { autoBirth = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`; } setEmployeeForm((current) => ({ ...current, nip: val.slice(0, 18), birth_date: autoBirth })); }} required pattern="[0-9]{18}" placeholder="199005152019031005" /></div><div className="field" style={{ maxWidth: "170px" }}><Label htmlFor="employee-birth-date">Tanggal lahir</Label><Input id="employee-birth-date" type="date" value={employeeForm.birth_date ?? ""} onChange={(event) => setEmployeeForm((current) => ({ ...current, birth_date: event.target.value || null }))} /></div></div>{employeeForm.nip.length === 18 && (employeeBirth ? <div className="nip-preview"><Check size={14} /><span>{formatDate(employeeForm.birth_date || employeeBirth.birthDate)} · {employeeBirth.gender} · TMT {new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(employeeBirth.appointmentYear, employeeBirth.appointmentMonth - 1, 1)))}</span></div> : <div className="nip-preview nip-invalid"><X size={14} />NIP tidak valid. Periksa kembali 18 digitnya.</div>)}<div className="field"><Label htmlFor="employee-name">Nama lengkap</Label><Input id="employee-name" value={employeeForm.name} onChange={(event) => setEmployeeForm((current) => ({ ...current, name: event.target.value }))} required /></div><div className="form-grid"><div className="field"><Label htmlFor="employee-position">Nama jabatan</Label><Input id="employee-position" value={employeeForm.position} onChange={(event) => setEmployeeForm((current) => ({ ...current, position: event.target.value }))} placeholder="Perencana Ahli Muda" /></div><div className="field"><Label>Unit kerja / Bidang</Label><Select value={employeeForm.unit_kerja ?? "Sekretariat"} onValueChange={(value) => setEmployeeForm((current) => ({ ...current, unit_kerja: value }))}><SelectTrigger><SelectValue placeholder="Pilih unit kerja / bidang" /></SelectTrigger><SelectContent>{BIDANG_LIST.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div></div><div className="form-grid"><div className="field"><Label htmlFor="employee-rank">Pangkat</Label><Input id="employee-rank" value={employeeForm.rank} onChange={(event) => setEmployeeForm((current) => ({ ...current, rank: event.target.value }))} /></div><div className="field"><Label htmlFor="employee-grade">Golongan</Label><Input id="employee-grade" value={employeeForm.grade} onChange={(event) => setEmployeeForm((current) => ({ ...current, grade: event.target.value }))} placeholder="III/a" /></div><div className="field"><Label>Jenis jabatan</Label><Select value={employeeForm.jenis_jabatan ?? "Struktural"} onValueChange={(value) => setEmployeeForm((current) => ({ ...current, jenis_jabatan: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Setruktural">Struktural</SelectItem><SelectItem value="Fungsional Tertentu">Fungsional Tertentu</SelectItem><SelectItem value="Fungsional  Umum">Fungsional Umum</SelectItem></SelectContent></Select></div><div className="field"><Label htmlFor="employee-edu">Pendidikan terakhir</Label><Input id="employee-edu" value={employeeForm.pendidikan_terakhir ?? ""} onChange={(event) => setEmployeeForm((current) => ({ ...current, pendidikan_terakhir: event.target.value }))} placeholder="S2 / S1 / D3 / SMA" /></div><div className="field"><Label>Jenis pegawai</Label><Select value={employeeForm.employment_type} onValueChange={(value: "PNS" | "PPPK") => setEmployeeForm((current) => ({ ...current, employment_type: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PNS">PNS</SelectItem><SelectItem value="PPPK">PPPK</SelectItem></SelectContent></Select></div><div className="field"><Label>Kategori batas usia</Label><Select value={employeeForm.retirement_category} onValueChange={(value) => setEmployeeForm((current) => ({ ...current, retirement_category: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="administrasi">Administrasi / ahli pertama</SelectItem><SelectItem value="pimpinan_tinggi">Pimpinan tinggi</SelectItem><SelectItem value="ahli_madya">Fungsional ahli madya</SelectItem><SelectItem value="ahli_utama">Fungsional ahli utama</SelectItem></SelectContent></Select></div><div className="field"><Label htmlFor="employee-rank-tmt">TMT pangkat terakhir</Label><Input id="employee-rank-tmt" type="date" value={employeeForm.last_rank_tmt ?? ""} onChange={(event) => setEmployeeForm((current) => ({ ...current, last_rank_tmt: event.target.value || null }))} /></div><div className="field"><Label htmlFor="employee-kgb-tmt">TMT KGB terakhir</Label><Input id="employee-kgb-tmt" type="date" value={employeeForm.last_kgb_tmt ?? ""} onChange={(event) => setEmployeeForm((current) => ({ ...current, last_kgb_tmt: event.target.value || null }))} /></div><div className="field"><Label htmlFor="employee-salary">Gaji pokok (Rp)</Label><Input id="employee-salary" type="number" min={0} value={employeeForm.base_salary} onChange={(event) => setEmployeeForm((current) => ({ ...current, base_salary: Number(event.target.value) }))} /></div><div className="field"><Label htmlFor="employee-tpp">Pagu dasar TPP (Rp)</Label><Input id="employee-tpp" type="number" min={0} value={employeeForm.tpp_basic} onChange={(event) => setEmployeeForm((current) => ({ ...current, tpp_basic: Number(event.target.value) }))} /></div><div className="field"><Label htmlFor="employee-class">Kelas jabatan (1–15)</Label><Input id="employee-class" type="number" min={1} max={15} value={employeeForm.job_class} onChange={(event) => setEmployeeForm((current) => ({ ...current, job_class: Number(event.target.value) }))} /></div><div className="field"><Label>Status</Label><Select value={employeeForm.status} onValueChange={(value) => setEmployeeForm((current) => ({ ...current, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Cuti">Cuti</SelectItem><SelectItem value="Nonaktif">Nonaktif</SelectItem></SelectContent></Select></div></div>{(employeeBirth || employeeForm.birth_date) && <div className="derived-details"><div><span>TANGGAL LAHIR</span><strong>{formatDate(employeeForm.birth_date || employeeBirth?.birthDate || "")}</strong></div><div><span>USIA SAAT INI</span><strong>{(() => { const bd = employeeForm.birth_date || employeeBirth?.birthDate; if (!bd) return "—"; const age = ageParts(bd, today); return `${age.years} th ${age.months} bln`; })()}</strong></div><div><span>BATAS USIA PENSIUN</span><strong>{retirementAge(employeeForm.retirement_category)} tahun</strong></div><div><span>PERKIRAAN TMT PENSIUN</span><strong>{(() => { const bd = employeeForm.birth_date || employeeBirth?.birthDate; return bd ? formatDate(retirementDate(bd, employeeForm.retirement_category)) : "—"; })()}</strong></div></div>}<DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Batal</Button><Button type="submit" disabled={busy || (employeeForm.nip.length === 18 && !employeeBirth)}>{busy ? "Menyimpan…" : selectedEmployee ? "Simpan perubahan" : "Simpan pegawai"}</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={dialog === "family"} onOpenChange={(open) => !open && setDialog(null)}><DialogContent className="simpeg-dialog"><DialogHeader><DialogTitle>Tambah tanggungan keluarga</DialogTitle><DialogDescription>Lengkapi data sesuai dokumen administrasi keluarga.</DialogDescription></DialogHeader><form onSubmit={saveFamily} className="dialog-form"><div className="field"><Label>Pegawai</Label><Select value={familyForm.employee_id} onValueChange={(value) => setFamilyForm((current) => ({ ...current, employee_id: value }))}><SelectTrigger><SelectValue placeholder="Pilih pegawai" /></SelectTrigger><SelectContent>{employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>)}</SelectContent></Select></div><div className="field"><Label htmlFor="family-name">Nama anggota keluarga</Label><Input id="family-name" value={familyForm.name} onChange={(event) => setFamilyForm((current) => ({ ...current, name: event.target.value }))} required /></div><div className="form-grid"><div className="field"><Label>Hubungan</Label><Select value={familyForm.relationship} onValueChange={(value: "pasangan" | "anak") => setFamilyForm((current) => ({ ...current, relationship: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pasangan">Suami / istri</SelectItem><SelectItem value="anak">Anak</SelectItem></SelectContent></Select></div><div className="field"><Label htmlFor="family-birth">Tanggal lahir</Label><Input id="family-birth" type="date" value={familyForm.birth_date} onChange={(event) => setFamilyForm((current) => ({ ...current, birth_date: event.target.value }))} required /></div></div>{familyForm.relationship === "pasangan" ? <label className="toggle-line"><input type="checkbox" checked={familyForm.is_asn} onChange={(event) => setFamilyForm((current) => ({ ...current, is_asn: event.target.checked }))} /><span><strong>Pasangan berstatus ASN</strong><small>Mencegah klaim tunjangan ganda</small></span><span className={`fake-switch ${familyForm.is_asn ? "switch-on" : ""}`} /></label> : <><div className="field"><Label>Status perkawinan anak</Label><Select value={familyForm.marital_status} onValueChange={(value) => setFamilyForm((current) => ({ ...current, marital_status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="belum_menikah">Belum menikah</SelectItem><SelectItem value="menikah">Sudah menikah</SelectItem></SelectContent></Select></div><label className="toggle-line"><input type="checkbox" checked={familyForm.is_working} onChange={(event) => setFamilyForm((current) => ({ ...current, is_working: event.target.checked }))} /><span><strong>Anak telah bekerja</strong><small>Anak bekerja tidak memenuhi syarat</small></span><span className={`fake-switch ${familyForm.is_working ? "switch-on" : ""}`} /></label><label className="toggle-line"><input type="checkbox" checked={familyForm.student_certificate} onChange={(event) => setFamilyForm((current) => ({ ...current, student_certificate: event.target.checked }))} /><span><strong>Surat keterangan kuliah tersedia</strong><small>Untuk anak di atas 21 sampai 25 tahun</small></span><span className={`fake-switch ${familyForm.student_certificate ? "switch-on" : ""}`} /></label></>}<DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Batal</Button><Button type="submit" disabled={busy || !familyForm.employee_id}>{busy ? "Menyimpan…" : "Simpan tanggungan"}</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={dialog === "profile"} onOpenChange={(open) => !open && setDialog(null)}><DialogContent className="simpeg-dialog"><DialogHeader><DialogTitle>Profil pengguna</DialogTitle><DialogDescription>Informasi akun administrasi Anda.</DialogDescription></DialogHeader><form onSubmit={saveProfile} className="dialog-form"><div className="profile-edit-head"><div className="profile-avatar large-avatar">{(profile?.display_name || session.user.email || "A").slice(0, 1).toUpperCase()}</div><div><strong>{profile?.display_name || "Administrator"}</strong><span>{session.user.email}</span></div></div><div className="field"><Label htmlFor="profile-name">Nama lengkap</Label><Input id="profile-name" value={profileForm.display_name} onChange={(event) => setProfileForm((current) => ({ ...current, display_name: event.target.value }))} placeholder="Nama lengkap" /></div><div className="field"><Label htmlFor="profile-job">Jabatan</Label><Input id="profile-job" value={profileForm.job_title} onChange={(event) => setProfileForm((current) => ({ ...current, job_title: event.target.value }))} placeholder="Administrator kepegawaian" /></div><div className="profile-role-note"><ShieldCheck size={16} /><span>Administrator · akses data dibatasi oleh peran akun.</span></div><DialogFooter><Button type="button" variant="outline" className="signout-button" onClick={() => void signOut()}><LogOut size={15} />Keluar</Button><Button type="button" variant="outline" onClick={() => setDialog(null)}>Batal</Button><Button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Simpan profil"}</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={dialog === "backup"} onOpenChange={(open) => !open && !backupBusy && setDialog(null)}><DialogContent className="simpeg-dialog"><DialogHeader><div className="dialog-icon"><FileKey2 size={19} /></div><DialogTitle>Buat cadangan terenkripsi</DialogTitle><DialogDescription>Frasa sandi ini tidak dapat dipulihkan. Simpan di tempat yang aman.</DialogDescription></DialogHeader><div className="dialog-form"><div className="field"><Label htmlFor="backup-passphrase">Frasa sandi · minimal 12 karakter</Label><Input id="backup-passphrase" type="password" autoComplete="new-password" value={backupPassphrase} onChange={(event) => setBackupPassphrase(event.target.value)} placeholder="Buat frasa sandi yang kuat" /></div><Notice><ShieldCheck size={16} />Berkas dienkripsi pada perangkat Anda dengan AES-256 sebelum diunduh.</Notice><DialogFooter><Button variant="outline" onClick={() => setDialog(null)} disabled={backupBusy}>Batal</Button><Button onClick={() => void saveEncryptedBackup()} disabled={backupBusy}>{backupBusy ? "Mengenkripsi…" : "Enkripsi dan unduh"}<ArrowDownToLine size={15} /></Button></DialogFooter></div></DialogContent></Dialog>

      <Dialog open={dialog === "restore"} onOpenChange={(open) => !open && !backupBusy && setDialog(null)}><DialogContent className="simpeg-dialog"><DialogHeader><div className="dialog-icon"><Database size={19} /></div><DialogTitle>Pulihkan data dari cadangan</DialogTitle><DialogDescription>Data yang cocok berdasarkan ID akan ditambahkan atau diperbarui. Tidak ada data lama yang dihapus.</DialogDescription></DialogHeader><div className="dialog-form"><div className="field"><Label htmlFor="backup-file">Berkas cadangan .json</Label><Input id="backup-file" type="file" accept=".json,application/json" onChange={(event) => setBackupFile(event.target.files?.[0] ?? null)} /></div><div className="field"><Label htmlFor="restore-passphrase">Frasa sandi cadangan</Label><Input id="restore-passphrase" type="password" autoComplete="current-password" value={backupPassphrase} onChange={(event) => setBackupPassphrase(event.target.value)} /></div>{backupFile && <div className="selected-file"><FileCheck2 size={17} /><span>{backupFile.name}</span><button type="button" aria-label="Hapus berkas terpilih" onClick={() => setBackupFile(null)}><X size={15} /></button></div>}<Notice tone="warning">Pastikan versi cadangan dapat dipercaya dan gunakan frasa sandi yang sama saat membuatnya.</Notice><DialogFooter><Button variant="outline" onClick={() => setDialog(null)} disabled={backupBusy}>Batal</Button><Button onClick={() => void restoreEncryptedBackup()} disabled={backupBusy || !backupFile}>{backupBusy ? "Memulihkan…" : "Pulihkan data"}<ArrowRight size={15} /></Button></DialogFooter></div></DialogContent></Dialog>
    </div>
  );
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function downloadFile(contents: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function GoogleMark() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: typeof Activity; title: string; detail: string }) {
  return <div className="empty-state"><span><Icon size={20} /></span><strong>{title}</strong><p>{detail}</p></div>;
}

function EmptyPanel({ title, detail, onAction }: { title: string; detail: string; onAction: () => void }) {
  return <div className="panel empty-panel"><EmptyState icon={UsersRound} title={title} detail={detail} /><Button onClick={onAction}><Plus size={16} />Tambah pegawai</Button></div>;
}

function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function EmployeeTable({ employees, logs, onEdit, onDelete, compact = false }: { employees: Employee[]; logs: PromotionLog[]; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; compact?: boolean }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (employees.length === 0) return <EmptyState icon={UsersRound} title="Belum ada pegawai" detail="Tambahkan data pegawai baru atau sesuaikan pencarian Anda." />;

  const startIndex = (currentPage - 1) * pageSize;
  const displayedEmployees = compact ? employees : employees.slice(startIndex, startIndex + pageSize);

  const pageNumbers: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (currentPage < totalPages - 2) pageNumbers.push("ellipsis");
    pageNumbers.push(totalPages);
  }

  return (
    <>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {!compact && <th style={{ width: "48px", textAlign: "center" }}>NO</th>}
              <th>PEGAWAI</th>
              <th>NIP</th>
              {!compact && <th>TANGGAL LAHIR</th>}
              <th>PANGKAT / GOL.</th>
              {!compact && <><th>JABATAN &amp; UNIT</th><th>STATUS</th></>}
              <th>TMT TERAKHIR</th>
              <th aria-label="Aksi" />
            </tr>
          </thead>
          <tbody>
            {displayedEmployees.map((employee, index) => {
              const stage = logs.find((log) => log.employee_id === employee.id)?.status;
              return (
                <tr key={employee.id}>
                  {!compact && (
                    <td style={{ textAlign: "center", fontWeight: "600", color: "var(--muted-foreground)" }}>
                      {employee.no_urut ?? (startIndex + index + 1)}
                    </td>
                  )}
                  <td>
                    <div className="table-person">
                      <span className="table-avatar">{employee.name.slice(0, 1)}</span>
                      <span>
                        <strong>{employee.name}{employee.is_demo && <sup className="demo-sup">CONTOH</sup>}</strong>
                        <small>{employee.employment_type} · Kelas {employee.job_class}</small>
                      </span>
                    </div>
                  </td>
                  <td className="mono-cell">{employee.nip}</td>
                  {!compact && (
                    <td>
                      {(() => {
                        const bdate = employee.birth_date || (employee.nip.length >= 8 ? `${employee.nip.slice(0, 4)}-${employee.nip.slice(4, 6)}-${employee.nip.slice(6, 8)}` : null);
                        if (!bdate) return <span>—</span>;
                        const age = ageParts(bdate, TODAY());
                        return (
                          <div>
                            <strong>{formatDate(bdate)}</strong>
                            <small className="table-secondary">{age.years} tahun</small>
                          </div>
                        );
                      })()}
                    </td>
                  )}
                  <td>
                    <strong>{employee.rank || "—"}</strong>
                    <small className="table-secondary">Golongan {employee.grade}{employee.pendidikan_terakhir ? ` · ${employee.pendidikan_terakhir}` : ""}</small>
                  </td>
                  {!compact && (
                    <>
                      <td>
                        <strong>{employee.position || "—"}</strong>
                        <small className="table-secondary">{employee.unit_kerja ? `${employee.unit_kerja} · ` : ""}{employee.jenis_jabatan || ""}</small>
                      </td>
                      <td>
                        <StatusPill tone={employee.status === "Aktif" ? "success" : "neutral"}>{employee.status}</StatusPill>
                      </td>
                    </>
                  )}
                  <td>
                    <span>{employee.last_rank_tmt ? formatDate(employee.last_rank_tmt) : "Belum diisi"}</span>
                    {!compact && stage && <small className="table-secondary">{stage}</small>}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Button variant="ghost" size="icon" aria-label={`Ubah ${employee.name}`} title="Ubah data" onClick={() => onEdit(employee)}>
                        <Pencil size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Hapus ${employee.name}`} title="Hapus data" onClick={() => onDelete(employee)}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!compact && employees.length > 0 && (
        <div
          className="table-pagination-footer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            fontSize: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "var(--muted-foreground)" }}>
            <span>
              Menampilkan <strong style={{ color: "var(--foreground)" }}>{startIndex + 1}</strong>–
              <strong style={{ color: "var(--foreground)" }}>{Math.min(startIndex + pageSize, employees.length)}</strong>{" "}
              dari <strong style={{ color: "var(--foreground)" }}>{employees.length}</strong> pegawai
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Baris per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>Semua ({employees.length})</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              style={{ height: "30px", padding: "0 10px", gap: "4px", fontSize: "11px" }}
            >
              <ChevronLeft size={14} /> Sebelumnya
            </Button>

            {pageNumbers.map((item, idx) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} style={{ padding: "0 4px", color: "var(--muted-foreground)" }}>
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={currentPage === item ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(item)}
                  style={{
                    height: "30px",
                    minWidth: "30px",
                    padding: "0 6px",
                    fontSize: "11px",
                    fontWeight: currentPage === item ? 700 : 500,
                  }}
                >
                  {item}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              style={{ height: "30px", padding: "0 10px", gap: "4px", fontSize: "11px" }}
            >
              Selanjutnya <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function PromotionTable({ employees, logs, onAdvance }: { employees: Employee[]; logs: PromotionLog[]; onAdvance: (employee: Employee) => void }) {
  const today = TODAY();
  const sorted = [...employees].filter((employee) => employee.last_rank_tmt).sort((a, b) => nextPromotionDate(a.last_rank_tmt ?? today, today).localeCompare(nextPromotionDate(b.last_rank_tmt ?? today, today)));
  if (sorted.length === 0) return <EmptyState icon={ClipboardList} title="TMT pangkat belum tersedia" detail="Isi TMT pangkat terakhir pada data pegawai untuk melihat proyeksi." />;
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>PEGAWAI</th><th>GOLONGAN</th><th>TMT TERAKHIR</th><th>PERIODE PROYEKSI</th><th>TAHAP BERKAS</th><th>AKSI</th></tr></thead><tbody>{sorted.map((employee) => {
    const date = nextPromotionDate(employee.last_rank_tmt ?? today, today);
    const stage = logs.find((log) => log.employee_id === employee.id)?.status ?? "Belum diusulkan";
    const distance = Math.ceil((new Date(`${date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000);
    return <tr key={employee.id}><td><div className="table-person"><span className="table-avatar">{employee.name.slice(0, 1)}</span><span><strong>{employee.name}</strong><small>{employee.position || employee.rank}</small></span></div></td><td>{employee.grade}</td><td>{formatDate(employee.last_rank_tmt)}</td><td><strong>{formatDate(date)}</strong><small className="table-secondary">{distance <= 183 ? "Persiapan berkas" : distance < 0 ? "Lewat jadwal" : "Belum waktunya"}</small></td><td><StatusPill tone={stage === "SK Terbit" ? "success" : stage === "Belum diusulkan" ? "neutral" : "warning"}>{stage}</StatusPill></td><td><Button variant="outline" size="sm" onClick={() => onAdvance(employee)}>{stage === "Belum diusulkan" ? "Mulai" : "Perbarui tahap"}<ChevronDown size={14} /></Button></td></tr>;
  })}</tbody></table></div>;
}

function KgbTable({ employees, logs, onSave }: { employees: Employee[]; logs: KgbLog[]; onSave: (employee: Employee, salary: string) => Promise<void> }) {
  const [salaryDraft, setSalaryDraft] = useState<Record<string, string>>({});
  const [printing, setPrinting] = useState<Employee | null>(null);
  const today = TODAY();
  const sorted = [...employees].filter((employee) => employee.last_kgb_tmt).sort((a, b) => (kgbDueDate(a.last_kgb_tmt) ?? "").localeCompare(kgbDueDate(b.last_kgb_tmt) ?? ""));
  if (!sorted.length) return <EmptyState icon={WalletCards} title="TMT KGB belum tersedia" detail="Isi TMT KGB terakhir pada data pegawai untuk melihat jadwal berkala." />;
  return <><div className="table-scroll"><table className="data-table"><thead><tr><th>PEGAWAI</th><th>GOLONGAN</th><th>GAJI POKOK SAAT INI</th><th>JATUH TEMPO BERIKUTNYA</th><th>DRAFT PEMBERITAHUAN</th><th /></tr></thead><tbody>{sorted.map((employee) => {
    const due = kgbDueDate(employee.last_kgb_tmt); const log = logs.find((item) => item.employee_id === employee.id);
    const days = due ? Math.ceil((new Date(`${due}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000) : -1;
    return <tr key={employee.id}><td><div className="table-person"><span className="table-avatar">{employee.name.slice(0, 1)}</span><span><strong>{employee.name}</strong><small>{employee.position || employee.rank}</small></span></div></td><td>{employee.grade}</td><td><strong>{rupiah(Number(employee.base_salary))}</strong></td><td><strong>{formatDate(due)}</strong><small className="table-secondary">{days < 0 ? "Jadwal berlalu" : days <= 90 ? `${days} hari lagi` : "Belum jatuh tempo"}</small></td><td>{log ? <StatusPill tone="success">Draft disiapkan</StatusPill> : <StatusPill tone="neutral">Belum dibuat</StatusPill>}</td><td><Button variant="outline" size="sm" onClick={() => { setPrinting(employee); window.setTimeout(() => window.print(), 50); }}><FileDown size={14} />Cetak draft</Button></td></tr>;
  })}</tbody></table></div><div className="kgb-edit-list">{sorted.map((employee) => <div key={employee.id} className="kgb-edit-row"><div><strong>{employee.name}</strong><span>Masukkan gaji baru yang telah diverifikasi</span></div><Input aria-label={`Gaji baru ${employee.name}`} type="number" min={0} placeholder="Gaji baru (Rp)" value={salaryDraft[employee.id] ?? ""} onChange={(event) => setSalaryDraft((current) => ({ ...current, [employee.id]: event.target.value }))} /><Button size="sm" disabled={!salaryDraft[employee.id] || Number(salaryDraft[employee.id]) < 0} onClick={() => void onSave(employee, salaryDraft[employee.id] ?? "")}>Simpan draft</Button></div>)}</div>{printing && <div className="print-document"><h1>SURAT PEMBERITAHUAN KENAIKAN GAJI BERKALA</h1><p>BAPPERIDA KABUPATEN LOMBOK BARAT</p><hr /><p>Dengan ini diberitahukan bahwa gaji berkala atas pegawai berikut dijadwalkan untuk diperiksa:</p><p>Nama: <strong>{printing.name}</strong></p><p>NIP: {printing.nip}</p><p>Jabatan / Pangkat: {printing.position} / {printing.rank} ({printing.grade})</p><p>Gaji pokok terakhir: {rupiah(Number(printing.base_salary))}</p><p>Perkiraan TMT berikutnya: {formatDate(kgbDueDate(printing.last_kgb_tmt))}</p><p>Besaran gaji baru wajib diisi berdasarkan tabel gaji resmi yang berlaku.</p><div className="print-signatures"><span>Mengetahui,<br />Kepala Bapperida</span><span>Lombok Barat,<br />Bendahara Gaji</span></div></div>}</>;
}

function FamilyTable({ employees, members, onAdd }: { employees: Employee[]; members: Member[]; onAdd: (employee: Employee) => void }) {
  if (!employees.length) return <EmptyState icon={Heart} title="Belum ada data pegawai" detail="Tambahkan pegawai sebelum mencatat data tanggungan." />;
  const today = TODAY();
  return <div className="table-scroll"><table className="data-table family-table"><thead><tr><th>PEGAWAI</th><th>ANGGOTA TERTANGGUNG</th><th>PERKIRAAN TUNJANGAN</th><th>VALIDASI</th><th>AKSI</th></tr></thead><tbody>{employees.map((employee) => {
    const family = members.filter((member) => member.employee_id === employee.id);
    const summary = familyBenefitSummary(family.map(familyRule), Number(employee.base_salary), today);
    const eligibleIds = new Set(summary.coveredChildren.map((member) => `${member.birthDate}-${member.relationship}`));
    return <tr key={employee.id}><td><div className="table-person"><span className="table-avatar">{employee.name.slice(0, 1)}</span><span><strong>{employee.name}</strong><small>Gaji pokok {rupiah(Number(employee.base_salary))}</small></span></div></td><td><div className="family-name-list">{family.length === 0 ? <span className="table-secondary">Belum ada tanggungan</span> : family.map((member) => {
      const age = ageParts(member.birth_date, today).years; const eligible = member.relationship === "pasangan" ? member.marital_status === "menikah" && !member.is_asn : isChildEligible(familyRule(member), today) && eligibleIds.has(`${member.birth_date}-${member.relationship}`);
      const needsCertificate = member.relationship === "anak" && age > 21 && age <= 25 && !member.student_certificate;
      return <span key={member.id} className="family-person-line"><span>{member.name}<small>{member.relationship === "pasangan" ? "Pasangan" : `Anak · ${age} tahun`}</small></span><StatusPill tone={eligible ? "success" : needsCertificate ? "warning" : "danger"}>{eligible ? "Tertanggung" : needsCertificate ? "Perlu surat kuliah" : "Tidak memenuhi"}</StatusPill></span>;
    })}</div></td><td><div className="allowance-parts"><span>Pasangan <strong>{rupiah(summary.spouseAllowance)}</strong></span><span>Anak <strong>{rupiah(summary.childAllowance)}</strong></span><strong>Total {rupiah(summary.spouseAllowance + summary.childAllowance)}</strong></div></td><td><span className="validation-count">{summary.coveredChildren.length}/2 anak · {summary.spouseEligible ? "pasangan layak" : "tanpa tunjangan pasangan"}</span></td><td><Button variant="outline" size="sm" onClick={() => onAdd(employee)}><Plus size={14} />Tambah</Button></td></tr>;
  })}</tbody></table></div>;
}

function TppHistory({ logs, employees }: { logs: TppLog[]; employees: Employee[] }) {
  if (!logs.length) return <EmptyState icon={FileSpreadsheet} title="Belum ada simulasi tersimpan" detail="Perhitungan yang disimpan akan tampil pada daftar ini." />;
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>PERIODE</th><th>PEGAWAI</th><th>TPP BRUTO</th><th>TPP BERSIH</th><th>DISIMPAN</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{log.period}</td><td>{employees.find((employee) => employee.id === log.employee_id)?.name ?? "Pegawai"}</td><td>{rupiah(Number(log.gross_amount))}</td><td><strong>{rupiah(Number(log.net_amount))}</strong></td><td>{formatDate(log.created_at)}</td></tr>)}</tbody></table></div>;
}