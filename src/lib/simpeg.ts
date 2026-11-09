export type ParsedNip = {
  birthDate: string;
  appointmentYear: number;
  appointmentMonth: number;
  gender: "Laki-laki" | "Perempuan";
};

export type FamilyMember = {
  relationship: "pasangan" | "anak";
  birthDate: string;
  maritalStatus?: string;
  isAsn?: boolean;
  isWorking?: boolean;
  studentCertificate?: boolean;
};

export type TppResult = {
  productivityAmount: number;
  attendanceAmount: number;
  gross: number;
  tax: number;
  bpjs: number;
  zakat: number;
  deductions: number;
  net: number;
};

export function parseNip(nip: string): ParsedNip | null {
  if (!/^\d{18}$/.test(nip)) return null;
  const year = Number(nip.slice(0, 4));
  const month = Number(nip.slice(4, 6));
  const day = Number(nip.slice(6, 8));
  const appointmentYear = Number(nip.slice(8, 12));
  const appointmentMonth = Number(nip.slice(12, 14));
  const genderDigit = nip[14];
  const birth = new Date(Date.UTC(year, month - 1, day));
  if (
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day ||
    appointmentMonth < 1 ||
    appointmentMonth > 12 ||
    (genderDigit !== "1" && genderDigit !== "2")
  ) {
    return null;
  }
  return {
    birthDate: `${nip.slice(0, 4)}-${nip.slice(4, 6)}-${nip.slice(6, 8)}`,
    appointmentYear,
    appointmentMonth,
    gender: genderDigit === "1" ? "Laki-laki" : "Perempuan",
  };
}

function dateParts(date: string | Date) {
  const value = typeof date === "string" ? new Date(`${date.slice(0, 10)}T00:00:00.000Z`) : date;
  return { year: value.getUTCFullYear(), month: value.getUTCMonth(), day: value.getUTCDate() };
}

export function ageParts(birthDate: string, onDate: string | Date) {
  const birth = dateParts(birthDate);
  const today = dateParts(onDate);
  let years = today.year - birth.year;
  let months = today.month - birth.month;
  let days = today.day - birth.day;
  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(Date.UTC(today.year, today.month, 0));
    days += previousMonth.getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export function retirementAge(category: string) {
  if (category === "pimpinan_tinggi" || category === "ahli_madya") return 60;
  if (category === "ahli_utama") return 65;
  return 58;
}

export function retirementDate(birthDate: string, category: string) {
  const { year, month } = dateParts(birthDate);
  const birthdayMonth = month + 1;
  const retirementYear = year + retirementAge(category);
  return birthdayMonth === 12
    ? `${retirementYear + 1}-01-01`
    : `${retirementYear}-${String(birthdayMonth + 1).padStart(2, "0")}-01`;
}

const CYCLE_MONTHS = [2, 4, 6, 8, 10, 12];

export function nextPromotionDate(lastRankTmt: string, onDate: string | Date) {
  const { year, month, day } = dateParts(lastRankTmt);
  const today = dateParts(onDate);
  const anniversary = new Date(Date.UTC(year + 4, month, day));
  for (let offset = 0; offset < 24; offset += 1) {
    const candidateMonth = (anniversary.getUTCMonth() + offset) % 12;
    const candidateYear = anniversary.getUTCFullYear() + Math.floor((anniversary.getUTCMonth() + offset) / 12);
    if (!CYCLE_MONTHS.includes(candidateMonth + 1)) continue;
    const candidate = new Date(Date.UTC(candidateYear, candidateMonth, 1));
    if (candidate >= anniversary && candidate >= new Date(Date.UTC(today.year, today.month, today.day))) {
      return `${candidateYear}-${String(candidateMonth + 1).padStart(2, "0")}-01`;
    }
  }
  return `${anniversary.getUTCFullYear()}-12-01`;
}

export function kgbDueDate(lastKgbTmt: string | null) {
  if (!lastKgbTmt) return null;
  const { year, month, day } = dateParts(lastKgbTmt);
  const result = new Date(Date.UTC(year + 2, month, day));
  return `${result.getUTCFullYear()}-${String(result.getUTCMonth() + 1).padStart(2, "0")}-${String(result.getUTCDate()).padStart(2, "0")}`;
}

export function isChildEligible(member: FamilyMember, onDate: string | Date) {
  if (member.relationship !== "anak") return false;
  if (member.maritalStatus === "menikah" || member.isWorking) return false;
  const age = ageParts(member.birthDate, onDate).years;
  if (age > 25) return false;
  return age <= 21 || Boolean(member.studentCertificate);
}

export function familyBenefitSummary(
  members: FamilyMember[],
  baseSalary: number,
  onDate: string | Date,
) {
  const spouse = members.find((member) => member.relationship === "pasangan");
  const spouseEligible = Boolean(spouse && spouse.maritalStatus === "menikah" && !spouse.isAsn);
  const eligibleChildren = members
    .filter((member) => isChildEligible(member, onDate))
    .sort((left, right) =>
      ageParts(right.birthDate, onDate).years - ageParts(left.birthDate, onDate).years,
    );
  const coveredChildren = eligibleChildren.slice(0, 2);
  return {
    spouseEligible,
    coveredChildren,
    excessEligibleChildren: Math.max(eligibleChildren.length - 2, 0),
    spouseAllowance: spouseEligible ? baseSalary * 0.1 : 0,
    childAllowance: coveredChildren.length * baseSalary * 0.02,
  };
}

export function tppTaxRate(grade: string) {
  const group = grade.trim().match(/^[IVX]+/i)?.[0]?.toUpperCase() ?? "";
  if (group === "III") return 0.05;
  if (group === "IV") return 0.15;
  return 0;
}

export function calculateTpp(input: {
  base: number;
  productivityWeight: number;
  productivityRate: number;
  attendanceWeight: number;
  attendanceRate: number;
  grade: string;
  zakatEnabled: boolean;
}): TppResult {
  const percentages = [
    input.productivityWeight,
    input.productivityRate,
    input.attendanceWeight,
    input.attendanceRate,
  ];
  if (input.base < 0 || percentages.some((value) => value < 0 || value > 100)) {
    throw new Error("Nilai TPP dan persentase harus berada dalam batas yang diizinkan.");
  }
  const productivityAmount = (input.base * input.productivityWeight * input.productivityRate) / 10_000;
  const attendanceAmount = (input.base * input.attendanceWeight * input.attendanceRate) / 10_000;
  const gross = productivityAmount + attendanceAmount;
  const tax = gross * tppTaxRate(input.grade);
  const bpjs = gross * 0.01;
  const zakat = input.zakatEnabled ? gross * 0.025 : 0;
  const deductions = tax + bpjs + zakat;
  return { productivityAmount, attendanceAmount, gross, tax, bpjs, zakat, deductions, net: gross - deductions };
}

export function pensionWarning(date: string, onDate: string | Date) {
  const today = dateParts(onDate);
  const pension = dateParts(date);
  const dayDistance = Math.floor(
    (Date.UTC(pension.year, pension.month, pension.day) - Date.UTC(today.year, today.month, today.day)) /
      86_400_000,
  );
  if (dayDistance < 183) return "Kritis" as const;
  if (dayDistance <= 365) return "Persiapan" as const;
  return "Aman" as const;
}

export function birthdayWithinDays(birthDate: string, onDate: string | Date, days: number) {
  const { month, day } = dateParts(birthDate);
  const today = dateParts(onDate);
  let next = new Date(Date.UTC(today.year, month, day));
  if (next < new Date(Date.UTC(today.year, today.month, today.day))) {
    next = new Date(Date.UTC(today.year + 1, month, day));
  }
  const distance = Math.round(
    (Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate()) -
      Date.UTC(today.year, today.month, today.day)) /
      86_400_000,
  );
  return distance <= days ? { date: next, distance } : null;
}

export function idDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(`${date.slice(0, 10)}T00:00:00.000Z`) : date;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}