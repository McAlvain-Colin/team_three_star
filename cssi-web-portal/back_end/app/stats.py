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
    dataStats = {}
    # dataStats = [value for item in data for dictionary in item for value in dictionary.values()] #cant handle strings?
    for item in data: #data is list of tuples of dictionary
        for dictionary in item: #item is tuple of dictionary
            for key, value in dictionary.items(): #need values from dictionary
                try:
                    # print(f'Key: {key}: Value: {value}: Type: {type(value)}')
                    val = float(value)
                    if key not in dataStats:
                        dataStats[key] =[]
                    dataStats[key].append(val)
                    # print(f'Val: {val}: Type: {type(val)}')
                    dataStats.append(val)          
                except:
                    pass
            # print('\n\n##############################################\n\n')
    # print(dataStats)

    stats = {}
    for key, values in dataStats.items():
        try:
            stats[key] = {
                'mean': round(get_mean(values),2),
                'variance': round(get_variance(values),2),
                'standardDeviation': round(get_standard_deviation(values),2),
                'median': round(get_median(values),2),
                'mode': round(get_mode(values),2)
            }
        except:
            pass
        # print(stats)

    return stats