import pandas as pd

df_dict = pd.read_excel('Phần Mềm v2 GVTG.xlsx', sheet_name=None)

for name, df in df_dict.items():
    print('\n\n' + '='*80)
    print(f'SHEET: {name}')
    print('='*80)
    cleaned_df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
    print(cleaned_df.to_string(index=False, max_colwidth=100))
