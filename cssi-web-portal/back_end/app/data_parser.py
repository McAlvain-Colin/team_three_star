import json
from models import sensor_data  


def parse_data(records):
    sensor_data_list = []
    dictionary_list = []

    for row in records:
        dev_eui, dev_time, payload, metadata = row

        payload_dict = json.loads(payload)
        metadata_dict = json.loads(metadata)
        
        dictionary_list.append((payload_dict, metadata_dict))  
        sensor_data_list.append({'dev_eui': dev_eui, 'dev_time': dev_time, 'payload_dict': payload_dict, 'metadata_dict': metadata_dict})
            
    return sensor_data_list


