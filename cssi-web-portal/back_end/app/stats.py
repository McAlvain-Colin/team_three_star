import statistics


def get_mean(data):
    return statistics.mean(data)

def get_variance(data):
    return statistics.variance(data)

def get_standard_deviation(data):
    return statistics.stdev(data)

def get_median(data):
    return statistics.median(data)

def get_mode(data):
    return statistics.mode(data)