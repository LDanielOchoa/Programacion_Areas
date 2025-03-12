import pandas as pd

def mostrar_datos_excel(ruta_archivo):
    # Leer el archivo Excel con encabezados en la primera fila
    df = pd.read_excel(ruta_archivo, sheet_name=None)

    for hoja, datos in df.items():
        print(f"Hoja: {hoja}")
        print("-" * 50)
        
        # Renombrar columnas sin nombre
        datos.columns = [f"Columna {i}" if "Unnamed" in str(col) else col for i, col in enumerate(datos.columns)]
        
        for i, fila in datos.iterrows():
            for j, valor in enumerate(fila):
                columna = datos.columns[j]
                if not pd.isna(valor):  # Evitar mostrar valores NaN
                    print(f"Fila {i+1}, {columna} -> {valor}")
        print("=" * 50)

# Ejemplo de uso
ruta = "c:\\Users\\daniel.ochoa\\Videos\\Novedades-Programacion\\NOVQ2S3_Enero_Lavado.xlsx"
mostrar_datos_excel(ruta)
