import csv
import json
from models import * 

sensor_data_list = []

with open('../../cssi.csv', mode='r') as file:
    reader = csv.reader(file)
    next(reader, None)
    for row in reader:
        dev_eui,dev_time,payload,metadata = row

        # print(f'payload: {payload}')
        # print(f'metadata: {metadata}')

        payload_dict = json.loads(payload)
        metadata_dict = json.loads(metadata)
        
        sensor_data_list.append(sensor_data(dev_eui, dev_time, payload_dict, metadata_dict))

print(f'payload: {payload_dict}')
print(f'metadata: {metadata_dict}')

# payload: {"BatV": 3.636, "Temp_Red": 5.6, "Work_mode": "DS18B20", "Temp_Black": 5.8, "Temp_White": 5.8, "ALARM_status": "FALSE"}                                                                                                      
# metadata: {"snr": 9, "rssi": -41, "location": {"source": "SOURCE_REGISTRY", "altitude": 6200, "latitude": 39.081507, "longitude": -120.158286}, "timestamp": 2038430988, "gateway_ids": {"eui": "C0EE40FFFF2A6648", "gateway_id": "field-laird-ip67"}, "received_at": "2024-02-04T10:35:26.301865462Z", "channel_rssi": -41, "uplink_token": "Ch4KHAoQZmllbGQtbGFpcmQtaXA2NxIIwO5A//8qZkgQjPr/ywcaDAju0P2tBhC5ofG4ASDg7dHfqcYm"}