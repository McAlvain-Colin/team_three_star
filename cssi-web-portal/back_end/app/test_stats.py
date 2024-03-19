import unittest
from stats import *


class BackEndUnitTests(unittest.TestCase):
    def setUp(self):
        self.stats_data = [1,2,3,4,5,6,7,8,9,10] #easy check
        self.stats_data_with_mode = [1,2,2,3,3,3,4,4,4,4,5,5,5,5,5] #easy check
    #stats test
#-----------------------------------------------------------------------------------------------------------------------------
    def test_get_mean(self):
        self.assertEqual(get_mean(self.stats_data), 5.5) #expected 5.5

    def test_get_variance(self):
        self.assertAlmostEqual(get_variance(self.stats_data), 9.166666666666666) #expected 9.16666666  must be within 7 decimal places

    def test_get_standard_deviation(self):
        self.assertAlmostEqual(get_standard_deviation(self.stats_data), 3.0276503540974917) #expected 3.02765 must be within 7 decimal places

    def test_get_median_odd(self):
        self.assertEqual(get_median(self.stats_data), 5.5) #expected 5.5
    
    def test_get_median_even(self):        
        data_even = self.stats_data + [11]
        self.assertEqual(get_median(data_even), 6) #expected 6

    def test_get_mode(self):
        self.assertEqual(get_mode(self.stats_data_with_mode), 5) #expected 5
    
    def test_get_mode_no_mode(self): 
        data = []
        with self.assertRaises(statistics.StatisticsError): #expected error
            get_mode(data)

#-----------------------------------------------------------------------------------------------------------------------------    
if __name__ == "__main__":
    unittest.main()