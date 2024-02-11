import statistics
from data_parser import dev_eui, time, metadata, payload


for i in range(0,100):      
    print(f'dev_eui: {dev_eui}')
    print(f'time: {time}')
    print(f'payload: {payload}')
    print(f'metadata: {metadata}')