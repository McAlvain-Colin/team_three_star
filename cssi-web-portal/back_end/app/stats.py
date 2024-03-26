import statistics


def get_mean(data):
    try:
        return statistics.mean(data)
    except:
        return

def get_variance(data):
    try:
        return statistics.variance(data)
    except:
        return

def get_standard_deviation(data):
    try:
        return statistics.stdev(data)
    except:
        return

def get_median(data):
    try:
        return statistics.median(data)
    except:
        return

def get_mode(data):
    try:
        return statistics.mode(data)
    except:
        return

def getStats(data):
    # print(f"stats: \n {data}")
    dataStats = []
    # dataStats = [value for item in data for dictionary in item for value in dictionary.values()] #cant handle strings?
    for item in data: #data is list of tuples of dictionary
        for dictionary in item: #item is tuple of dictionary
            for value in dictionary.values(): #need values from dictionary
                try:
                    print(f'Value: {value}')
                    val = float(value)
                    print(f'Vale: {val}')
                    dataStats.append(val)
                except:
                    pass
    print(dataStats)

    return [
        get_mean(dataStats), 
        get_variance(dataStats), 
        get_standard_deviation(dataStats), 
        get_median(dataStats), 
        get_mode(dataStats)
        ]