import json
from models import sensor_data  


def parse_data(records):
    sensor_data_list = []
    dictionary_list = []

    try:
        print('a')
        for row in records:
            print('c')
            dev_eui, dev_time, payload, metadata = row
            print('d')
            payload_dict = json.loads(payload)
            print('e')
            metadata_dict = json.loads(metadata)
            print('f')
            dictionary_list.append((payload_dict, metadata_dict)) 
            print('g') 
            sensor_data_list.append({'dev_eui': dev_eui, 'dev_time': dev_time, 'payload_dict': payload_dict, 'metadata_dict': metadata_dict})
        print('b')        
        return sensor_data_list
    except Exception as e:
        print(f'Error: {e}')

