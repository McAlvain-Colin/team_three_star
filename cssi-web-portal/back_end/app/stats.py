import statistics
from data_parser import sensor_data_list, dictionary_list

# print(f'sensor_data_list: {sensor_data_list}')
# print(f'dictionary_list: {dictionary_list}')

key_of_interest = 'dev_eui'
value_of_interest = '0025CA0A00015E62'

matching_dictionaries = []

for payload_dict, metadata_dict in dictionary_list:
    if payload_dict.get(key_of_interest) == key_of_interest:
        matching_dictionaries.append(payload_dict)
    
    if metadata_dict.get(key_of_interest) == value_of_interest:
        matching_dictionaries.append(metadata_dict)

for dictionary in matching_dictionaries:
    print(dictionary)
