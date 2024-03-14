import unittest
import sys
import datetime

from data_parser import *

class BackEndUnitTests(unittest.TestCase):
    def setUp(self):
        #real data example from database return
        self.valid_mock_data =  [('0025CA0A00015E62', datetime.datetime(2023, 12, 28, 5, 20, 27, 674000, tzinfo=datetime.timezone.utc), {'messageType': 1, 'temperature': 19.25, 'batteryIndex': 5, 'batteryCapacity': '80-100%'}, {'snr': 9.25, 'rssi': -36, 'timestamp': 3276927828, 'gateway_ids': {'eui': 'C0EE40FFFF2A6645', 'gateway_id': 'lab-laird-ip67'}, 'received_at': '2023-12-28T05:20:27.677310534Z', 'channel_rssi': -36, 'uplink_token': 'ChwKGgoObGFiLWxhaXJkLWlwNjcSCMDuQP//KmZFENTmx5oMGgwIm4u0rAYQxMK/wwIgoID6wK9f'})]
    

    #Database parser tests
#-----------------------------------------------------------------------------------------------------------------------------
    def test_parse_with_valid_data(self):
        expected_output = [{
                            "dev_eui": "0025CA0A00015E62",
                            "dev_time": datetime.datetime(2023, 12, 28, 5, 20, 27, 674000, tzinfo=datetime.timezone.utc),
                            "payload_dict": '{"messageType": 1, "temperature": 19.25, "batteryIndex": 5, "batteryCapacity": "80-100%"}',
                            "metadata_dict": '{"snr": 9.25, "rssi": -36, "timestamp": 3276927828, "gateway_ids": {"eui": "C0EE40FFFF2A6645", "gateway_id": "lab-laird-ip67"}, "received_at": "2023-12-28T05:20:27.677310534Z", "channel_rssi": -36, "uplink_token": "ChwKGgoObGFiLWxhaXJkLWlwNjcSCMDuQP//KmZFENTmx5oMGgwIm4u0rAYQxMK/wwIgoID6wK9f"}'
                        }]
        result = parse_data(self.valid_mock_data)
        self.assertEqual(result, expected_output)

    
    def test_parse_with_empty_data(self):
        records = []

        expected_output = []

        result = parse_data(records)
        self.assertEqual(result, expected_output)

#-----------------------------------------------------------------------------------------------------------------------------    
if __name__ == "__main__":
    unittest.main(verbosity=0, exit=False)