import csv
import json
from models import sensor_data  

sensor_data_list = []
dictionary_list = []

with open('../../cssi.csv', mode='r') as file:
    reader = csv.reader(file)
    next(reader, None)  
    for row in reader:
        dev_eui, dev_time, payload, metadata = row

        payload_dict = json.loads(payload)
        metadata_dict = json.loads(metadata)
        
        dictionary_list.append((payload_dict, metadata_dict))  
        sensor_data_list.append(sensor_data(dev_eui, dev_time, payload_dict, metadata_dict))


