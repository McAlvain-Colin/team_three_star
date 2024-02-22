import psycopg2

try:
    conn = psycopg2.connect(
        host='0.0.0.0',  # IP address
        port='5432',  # Port
        dbname='postgres',  # Database name
        user='postgres',  # Database username
        password='cssiwebportal2024'  # Database password
    )    
    print("Database connected successfully")
except Exception as e:
    print("Database not connected successfully")
    print(f"An error occurred: {e}")
    
cur = conn.cursor()

#test quesry

cur.execute("SELECT * FROM lab_sensor_data WHERE dev_eui = '0025CA0A00015E62';")


rows = cur.fetchall()
for row in rows:
    print(row)
    
cur.close()
conn.close()
