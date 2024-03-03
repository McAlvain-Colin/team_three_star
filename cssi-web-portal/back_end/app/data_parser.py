#example of data that needs to be parsed
#('A84041A215B5287D', datetime.datetime(2023, 7, 14, 20, 16, 17, 719000, tzinfo=datetime.timezone.utc), 
# {'BatV': 3.668, 'Temp_Red': 24.3, 'Work_mode': 'DIS18B20', 'Temp_Black': 'NULL', 'Temp_White': 24.8, 'ALARM_status': 'FALSE'}, 
# {'snr': 10.25, 'rssi': -49, 'timestamp': 1832982356, 'gateway_ids': ['eui': 'C0EE40FFFF2A6645'], 'gateway_id': 'lab-laird-ip67'}, 
# {'received_at': '2023-07-14T20:16:17.842313331Z', 'channel_rssi': -49, 'uplink_token': 'ChwKGgoObGFibGFpcmRfaXA2NxIgCSDUoGGwlkdGPQY0W2bkqMqoMCMSqytVg=='})

#lines broken into parts I need to account for:
#(
#'A84041A215B5287D', 
# datetime.datetime(2023, 7, 14, 20, 16, 17, 719000, tzinfo=datetime.timezone.utc), 
# {'BatV': 3.668, 'Temp_Red': 24.3, 'Work_mode': 'DIS18B20', 'Temp_Black': 'NULL', 'Temp_White': 24.8, 'ALARM_status': 'FALSE'}, 
# {'snr': 10.25, 'rssi': -49, 'timestamp': 1832982356, 'gateway_ids': ['eui': 'C0EE40FFFF2A6645'], 'gateway_id': 'lab-laird-ip67'}, {'received_at': '2023-07-14T20:16:17.842313331Z', 'channel_rssi': -49, 'uplink_token': 'ChwKGgoObGFibGFpcmRfaXA2NxIgCSDUoGGwlkdGPQY0W2bkqMqoMCMSqytVg=='}
#)



# "0025CA000015EEEE",
# "Thu, 28 Dec 2023 05:21:39 GMT",
# {
#   "batteryCapacity": "80-100%",
#   "batteryIndex": 5,
#   "messageType": 1,
#   "temperature": 2.93
# },
# {
#   "channel_rssi": -75,
#   "gateway_ids": {
#     "eui": "C0EE40FFFF2A6648"
#   },
#   "gateway_id": "field-laird-ip67"
# },
# "location": {
#   "latitude": 6200,
#   "latitude": 39.081507,
#   "longitude": -120.158286,
#   "source": "SOURCE_REGISTRY"
# },
# "received_at": "2023-12-28T05:21:39.931559170Z",
# "rssi": -75,
# "snr": 9.75,
# "timestamp": 3016301502,
# "uplink_token": "Chk4HAoQznLlbqQtbGfpcmtqoXA2NxIwI05A//8qZkQvrekngsaDAjjj7sSBhCtuvXaAyCwwNHM5Fc="

import json


def parse_data(records):
    sensor_data_list = []
    dictionary_list = []

    try:
        print('a')
        for row in records:
            print('c')
            dev_eui, dev_time, payload, metadata = row
            print('d')
            payload_dict = json.dumps(payload)
            print('e')
            metadata_dict = json.dumps(metadata)
            print('f')
            dictionary_list.append((payload_dict, metadata_dict)) 
            print('g') 
            sensor_data_list.append({'dev_eui': dev_eui, 'dev_time': dev_time, 'payload_dict': payload_dict, 'metadata_dict': metadata_dict})
        print('b')        
        return sensor_data_list
    except Exception as e:
        print(f'Error: {e}')

