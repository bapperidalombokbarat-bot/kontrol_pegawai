import openpyxl
import re
import datetime
import json
import os

wb = openpyxl.load_workbook(r'Base_Data/Data Pegawai Oktober 2026.xlsx', data_only=True)
ws = wb['data jabatan per okt']

def clean_tmt(val):
    if not val:
        return None
    if isinstance(val, (int, float)):
        try:
            return (datetime.datetime(1899, 12, 30) + datetime.timedelta(days=val)).strftime('%Y-%m-%d')
        except:
            return None
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val.strftime('%Y-%m-%d')
    s = str(val).strip().replace(' ', '')
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', s)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return f'{y:04d}-{mo:02d}-{d:02d}'
    m2 = re.match(r'^(\d{4})-(\d{1,2})-(\d{1,2})', s)
    if m2:
        y, mo, d = int(m2.group(1)), int(m2.group(2)), int(m2.group(3))
        return f'{y:04d}-{mo:02d}-{d:02d}'
    return None

def parse_rank_grade(pangkat_raw):
    s = str(pangkat_raw or '').strip()
    if 'GOL IX' in s.upper():
        return 'PPPK', 'IX'
    if 'GOL V' in s.upper():
        return 'PPPK', 'V'
    if 'IV/B' in s.upper():
        rank = 'Pembina Tingkat I' if 'TK' in s.upper() else 'Pembina'
        return rank, 'IV/b'
    if 'IV/A' in s.upper():
        return 'Pembina', 'IV/a'
    if 'III/D' in s.upper():
        return 'Penata Tingkat I', 'III/d'
    if 'III/C' in s.upper():
        return 'Penata', 'III/c'
    if 'III/B' in s.upper():
        return 'Penata Muda Tingkat I', 'III/b'
    if 'III/A' in s.upper():
        return 'Penata Muda', 'III/a'
    if 'II/C' in s.upper():
        return 'Pengatur', 'II/c'
    if 'II/B' in s.upper():
        return 'Pengatur Muda Tingkat I', 'II/b'
    if 'II/A' in s.upper():
        return 'Pengatur Muda', 'II/a'
    return s or '—', 'III/a'

def get_job_class(nama_jabatan, jenjang, rank, grade, employment_type):
    nj = str(nama_jabatan).upper()
    jj = str(jenjang).upper()
    if 'KEPALA' in nj and 'KASUBBAG' not in nj and 'KABID' not in nj:
        return 14
    if 'SEKRETARIS' in nj or 'KABID' in nj:
        return 12
    if 'MADYA' in nj or 'MADYA' in jj:
        return 11
    if 'KASUBBAG' in nj or 'MUDA' in nj or 'MUDA' in jj:
        return 9
    if 'PERTAMA' in nj or 'PERTAMA' in jj or grade == 'IX':
        return 8
    if 'III/' in grade:
        return 7
    if 'TERAMPIL' in nj or 'TERAMPIL' in jj or grade == 'II/c':
        return 6
    if grade == 'V' or 'II/' in grade:
        return 5
    return 7

def get_base_salary(grade, employment_type):
    salaries = {
        'IV/b': 5320000,
        'IV/a': 4750000,
        'III/d': 4150000,
        'III/c': 3820000,
        'III/b': 3550000,
        'III/a': 3310000,
        'II/c': 2880000,
        'II/b': 2680000,
        'II/a': 2480000,
        'IX': 3450000,
        'V': 2550000,
    }
    return salaries.get(grade, 3300000)

def get_tpp_basic(job_class):
    tpp_map = {
        14: 18500000,
        12: 11000000,
        11: 8500000,
        9: 6500000,
        8: 4800000,
        7: 3800000,
        6: 3200000,
        5: 2500000,
    }
    return tpp_map.get(job_class, 3500000)

employees = []
for r in range(13, 72):
    no = ws.cell(r, 3).value
    nama = ws.cell(r, 4).value
    nip = ws.cell(r, 5).value
    if not nama or not nip: continue
    
    nip_str = re.sub(r'[^0-9]', '', str(nip))
    nama_str = str(nama).strip()
    pangkat_raw = ws.cell(r, 6).value
    jenis_jabatan = str(ws.cell(r, 7).value or '').strip()
    nama_jabatan = str(ws.cell(r, 8).value or '').strip()
    jenjang = str(ws.cell(r, 9).value or '').strip()
    tmt_jabatan = clean_tmt(ws.cell(r, 10).value)
    pendidikan = str(ws.cell(r, 11).value or '').strip()
    diklat_str = str(ws.cell(r, 12).value or '').strip()
    diklat_fung = str(ws.cell(r, 14).value or '').strip()
    diklat_tek = str(ws.cell(r, 16).value or '').strip()
    unit_kerja = str(ws.cell(r, 18).value or '').strip()
    unor_induk = str(ws.cell(r, 19).value or 'Bapperida').strip()

    is_pppk = 'P3K' in nama_str.upper() or 'GOL' in str(pangkat_raw).upper() or 'PPPK' in jenjang.upper() or (len(nip_str) == 18 and nip_str[12:14] == '21')
    emp_type = 'PPPK' if is_pppk else 'PNS'
    rank, grade = parse_rank_grade(pangkat_raw)
    job_class = get_job_class(nama_jabatan, jenjang, rank, grade, emp_type)
    base_salary = get_base_salary(grade, emp_type)
    tpp_basic = get_tpp_basic(job_class)
    ret_cat = 'pimpinan_tinggi' if job_class >= 14 else ('ahli_madya' if job_class == 11 else 'administrasi')

    last_rank_tmt = tmt_jabatan
    if not last_rank_tmt and len(nip_str) >= 14:
        y = nip_str[8:12]
        mo = nip_str[12:14]
        if y.isdigit() and int(y) > 1970:
            mo_val = int(mo) if mo.isdigit() else 1
            if mo_val > 12: mo_val = 1
            last_rank_tmt = f'{y}-{mo_val:02d}-01'
    if not last_rank_tmt:
        last_rank_tmt = '2024-04-01'

    last_kgb_tmt = '2024-04-01' if last_rank_tmt < '2024-04-01' else last_rank_tmt
    emp_id = f'emp-{no}'
    clean_nama_display = re.sub(r'\s*\(\s*P3K\s*\)', '', nama_str, flags=re.I).strip()

    employees.append({
        'id': emp_id,
        'no_urut': int(no) if no else 999,
        'nip': nip_str,
        'name': clean_nama_display,
        'position': nama_jabatan,
        'rank': rank,
        'grade': grade,
        'employment_type': emp_type,
        'retirement_category': ret_cat,
        'last_rank_tmt': last_rank_tmt,
        'last_kgb_tmt': last_kgb_tmt,
        'base_salary': base_salary,
        'tpp_basic': tpp_basic,
        'job_class': job_class,
        'status': 'Aktif',
        'is_demo': False,
        'jenis_jabatan': jenis_jabatan,
        'jenjang_jabatan': jenjang,
        'tmt_jabatan': tmt_jabatan,
        'pendidikan_terakhir': pendidikan,
        'diklat_struktural': diklat_str if diklat_str != '-' else '',
        'diklat_fungsional': diklat_fung if diklat_fung != '-' else '',
        'diklat_teknis': diklat_tek if diklat_tek != '-' else '',
        'unit_kerja': unit_kerja,
        'unor_induk': unor_induk,
        'created_at': '2026-10-01T00:00:00.000Z',
        'updated_at': '2026-10-01T00:00:00.000Z'
    })

print(f'Parsed {len(employees)} employees successfully.')

# Save to json file for easy use
with open('Base_Data/employees_october_2026.json', 'w', encoding='utf-8') as f:
    json.dump(employees, f, ensure_ascii=False, indent=2)

print('Saved Base_Data/employees_october_2026.json')
