import pandas as pd

df = pd.read_excel('Phần Mềm v2 GVTG.xlsx', sheet_name='Dashboard GV')

print("="*80)
print("SHEET: Dashboard GV")
print("="*80)
print("\nAll columns:", df.columns.tolist())
print("\nData:")
for idx, row in df.iterrows():
    print(f"\nRow {idx}:")
    for col in df.columns:
        value = row[col]
        if pd.notna(value) and str(value).strip():
            print(f"  {col}: {value}")
