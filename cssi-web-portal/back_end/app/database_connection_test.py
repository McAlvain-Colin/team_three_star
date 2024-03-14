from helperFunctions import *

data = read_records("lab_sensor_json")

for row in data[:5]:
    print(f'Data: {row}')