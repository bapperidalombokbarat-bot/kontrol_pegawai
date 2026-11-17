import { describe, expect, it } from "vitest";
import {
  ageParts,
  BIDANG_LIST,
  calculateTpp,
  familyBenefitSummary,
  getEmployeeBidang,
  isChildEligible,
  nextPromotionDate,
  parseNip,
  pensionWarning,
  retirementAge,
  retirementDate,
  tppTaxRate,
} from "@/lib/simpeg";

describe("aturan pemantauan kepegawaian", () => {
  it("mengurai tanggal lahir, TMT pengangkatan, dan jenis kelamin dari NIP 18 digit", () => {
    expect(parseNip("199005152019031005")).toEqual({
      birthDate: "1990-05-15",
      appointmentYear: 2019,
      appointmentMonth: 3,
      gender: "Laki-laki",
    });
  });

  it("menolak NIP yang panjangnya salah, tanggalnya tidak valid, atau kode jenis kelaminnya tidak dikenal", () => {
    expect(parseNip("123")).toBeNull();
    expect(parseNip("199002302019031005")).toBeNull();
    expect(parseNip("199005152019039005")).toBeNull();
  });

  it("menghitung usia dalam tahun, bulan, dan hari", () => {
    expect(ageParts("1990-05-15", "2026-11-09")).toEqual({ years: 36, months: 5, days: 25 });
  });

  it("memproyeksikan KPR pada periode BKN berikutnya dengan jarak empat tahun", () => {
    expect(nextPromotionDate("2023-03-15", "2026-11-09")).toBe("2027-04-01");
  });

  it("menggunakan batas usia pensiun 58, 60, dan 65 tahun dan TMT bulan berikutnya", () => {
    expect(retirementAge("administrasi")).toBe(58);
    expect(retirementAge("ahli_madya")).toBe(60);
    expect(retirementAge("ahli_utama")).toBe(65);
    expect(retirementDate("1968-12-20", "administrasi")).toBe("2027-01-01");
  });

  it("memberi tanda peringatan pensiun kritis sebelum enam bulan dan persiapan sampai satu tahun", () => {
    expect(pensionWarning("2027-05-01", "2026-11-09")).toBe("Kritis");
    expect(pensionWarning("2027-11-09", "2026-11-09")).toBe("Persiapan");
    expect(pensionWarning("2028-01-01", "2026-11-09")).toBe("Aman");
  });

  it("membatasi anak tertanggung menjadi dua dan memakai tarif pasangan 10% serta anak 2%", () => {
    const result = familyBenefitSummary(
      [
        { relationship: "pasangan", birthDate: "1990-01-01", maritalStatus: "menikah" },
        { relationship: "anak", birthDate: "2010-01-01" },
        { relationship: "anak", birthDate: "2012-01-01" },
        { relationship: "anak", birthDate: "2014-01-01" },
      ],
      5_000_000,
      "2026-11-09",
    );
    expect(result.spouseAllowance).toBe(500_000);
    expect(result.childAllowance).toBe(200_000);
    expect(result.coveredChildren).toHaveLength(2);
    expect(result.excessEligibleChildren).toBe(1);
  });

  it("memeriksa batas usia anak 21/25 tahun, surat kuliah, status menikah, dan bekerja", () => {
    expect(isChildEligible({ relationship: "anak", birthDate: "2004-11-10" }, "2026-11-09")).toBe(true);
    expect(isChildEligible({ relationship: "anak", birthDate: "2004-11-08", studentCertificate: true }, "2026-11-09")).toBe(true);
    expect(isChildEligible({ relationship: "anak", birthDate: "2004-11-08" }, "2026-11-09")).toBe(false);
    expect(isChildEligible({ relationship: "anak", birthDate: "2000-01-01", studentCertificate: true }, "2026-11-09")).toBe(false);
    expect(isChildEligible({ relationship: "anak", birthDate: "2010-01-01", maritalStatus: "menikah" }, "2026-11-09")).toBe(false);
    expect(isChildEligible({ relationship: "anak", birthDate: "2010-01-01", isWorking: true }, "2026-11-09")).toBe(false);
  });

  it("mencegah tunjangan pasangan ganda bila pasangan berstatus ASN", () => {
    const result = familyBenefitSummary(
      [{ relationship: "pasangan", birthDate: "1990-01-01", maritalStatus: "menikah", isAsn: true }],
      5_000_000,
      "2026-11-09",
    );
    expect(result.spouseEligible).toBe(false);
    expect(result.spouseAllowance).toBe(0);
  });

  it("menerapkan potongan PPh 0%, 5%, 15%, BPJS 1%, dan zakat opsional 2,5%", () => {
    expect(tppTaxRate("II/c")).toBe(0);
    expect(tppTaxRate("III/a")).toBe(0.05);
    expect(tppTaxRate("IV/a")).toBe(0.15);
    const result = calculateTpp({
      base: 5_000_000,
      productivityWeight: 60,
      productivityRate: 50,
      attendanceWeight: 40,
      attendanceRate: 100,
      grade: "III/a",
      zakatEnabled: true,
    });
    expect(result.gross).toBe(3_500_000);
    expect(result.tax).toBe(175_000);
    expect(result.bpjs).toBe(35_000);
    expect(result.zakat).toBe(87_500);
    expect(result.net).toBe(3_202_500);
  });

  it("mengkategorikan pegawai ke bidang atau unit kerja yang sesuai", () => {
    expect(BIDANG_LIST).toContain("Bidang PSDAIK");
    expect(BIDANG_LIST).toContain("Sekretariat");
    expect(BIDANG_LIST).toContain("Bidang RIDA");
    expect(getEmployeeBidang({ position: "Kepala", unit_kerja: "" })).toBe("Pimpinan");
    expect(getEmployeeBidang({ position: "Sekretaris", unit_kerja: "Sekretariat" })).toBe("Sekretariat");
    expect(getEmployeeBidang({ position: "Kabid Riset dan Inovasi Daerah ( BRIDA)", unit_kerja: "" })).toBe("Bidang RIDA");
    expect(getEmployeeBidang({ position: "Fasilitator Pemerintahan", unit_kerja: "Bidang RIDA" })).toBe("Bidang RIDA");
    expect(getEmployeeBidang({ position: "Kabid Pemerintahan dan Pembangunan Manusia (P2M )", unit_kerja: "" })).toBe("Bidang P2M");
    expect(getEmployeeBidang({ position: "Kabid Perencanaan, Evaluasi Pembangunan Daerah ( P2EPD )", unit_kerja: "" })).toBe("Bidang P2EPD");
    expect(getEmployeeBidang({ position: "Kabid Perekonomian, Sumber Daya Alam Infrastruktur dan Kewilyahan (PSDAIK)", unit_kerja: "" })).toBe("Bidang PSDAIK");
  });
});