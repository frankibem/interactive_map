import os
import json
import numpy as np
import pandas as pd
from dateutil.parser import parse
from collections import defaultdict

def to_us_format(date_str):
    if date_str is None:
        return None
    
    try:
        date_obj = parse(date_str)
        result = date_obj.strftime('%m/%d/%Y')
    except ValueError:
        parts = date_str.split(' - ')
        result = ' - '.join([parse(part).strftime('%m/%d/%Y') for part in parts])
        
    return result    

def get_camp_heroes(camp, heroes):
    return [hero['id'] for hero in heroes if camp in hero['camps_liberated']]

def get_city_heroes(city, city_heroes):
    return [hero['id'] for hero in city_heroes[city]]

def main():
    # Create heroes.json
    # Load the liberator info from the excel file
    file_name = 'liberators.xlsx'
    hr = hr = pd.read_excel(file_name, header=None, skiprows=1, parse_dates=False,
                        names=['name', 'dob', 'pob', 'residence', 'service_date', 'liberator_rank', 'service_desc', 'units', 
                            'service_branch', 'comm_officer', 'camps_liberated', 'liberation_dates', 'img_url', 'video_url'])

    jstr = hr.to_json(orient='index', date_format='iso')
    jobj = json.loads(jstr)                            

    # Split entries in cells with multiple values (delimited by ``)
    multiple_cols = ['service_desc', 'units', 'camps_liberated', 'liberation_dates']
    for index in jobj:
        record = jobj[index]
        for col in multiple_cols:
            if record[col] is not None:
                record[col] = record[col].split('``')
            else:
                record[col] = []

    # Fix the dates to be in uniform format
    for index in jobj:
        record = jobj[index]
        if not record['dob'] is None:
            record['dob'] = to_us_format(record['dob'])

        if not record['liberation_dates'] is None:
            for i in range(len(record['liberation_dates'])):
                record['liberation_dates'][i] = to_us_format(record['liberation_dates'][i])    

    # Sort by name, assign ids
    output = [jobj[index] for index in jobj]
    output.sort(key=lambda record: record['name'])
    for i in range(len(output)):
        output[i]['id'] = i                

    data_dir = './output'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)      

    path = os.path.join(data_dir, 'heroes.json')
    with open(path, 'w') as f:
        json.dump(output, f, indent=2, sort_keys=True)   

    # Load the processed hero information
    with open(os.path.join(data_dir, 'heroes.json'), 'r') as f:
        heroes = json.load(f)       

    city_heroes = defaultdict(list)
    for hero in heroes:
        if not hero['residence'] is None:
            parts = hero['residence'].strip().split(', ')
            if len(parts) == 2 and parts[1] == 'TX':
                city_heroes[parts[0]].append(hero)    

    cs1 = {camp for hero in heroes for camp in hero['camps_liberated']}
    ts1 = set(city_heroes.keys())   
    print('According to the Heroes sheet in liberators.xlsx, there are\n  {} camps\n  {} cities'.format(len(cs1), len(ts1)))                     

    # Create camps.json
    # Load the camp info from the excel file
    df_camp = pd.read_excel(file_name, sheet_name='Camps', header=None, skiprows=1, parse_dates=False,
                        names=['name', 'lat', 'lon'])    

    # Convert camp dataframe to json object
    str_camp = df_camp.to_json(orient='index', date_format='iso')
    obj_camp = json.loads(str_camp)

    # Convert json object to list of python dicts (remove keys from dataframe)
    camps = [obj_camp[index] for index in obj_camp]

    # Sort by camp name and assign ids
    camps.sort(key=lambda camp: camp['name'])
    for i in range(len(camps)):
        camps[i]['id'] = i

    # Add hero information for each camp
    for camp in camps:
        camp['heroes'] = get_camp_heroes(camp['name'], heroes)        

    cs2 = set(camp['name'] for camp in camps)
    print('\nAccording to the Camps sheet in liberators.xlsx, there are\n  {} camps'.format(len(cs2)))

    discrepancies = 0
    sym_diff = (cs1 - cs2).union(cs2 - cs1)
    discrepancies += len(sym_diff)
    if len(sym_diff) == 0:
        print('No discrepancies.\n')
    else:
        print('Discrepancies:')
        for camp in sym_diff:
            print('  ', camp)    

    path = os.path.join(data_dir, 'camps.json')
    with open(path, 'w') as f:
        json.dump(camps, f, indent=2, sort_keys=True)        

    # Create texas.json
    # Load Texas info from the excel file
    df_texas = pd.read_excel(file_name, sheet_name='Texas', header=None, skiprows=1, parse_dates=False,
                        names=['name', 'lat', 'lon'])    

    # Convert city dataframe to json object
    str_texas = df_texas.to_json(orient='index', date_format='iso')
    obj_texas = json.loads(str_texas)

    # Convert json object to list of python dicts (remove keys from dataframe)
    cities = [obj_texas[index] for index in obj_texas]

    # Sort by name and assign ids
    cities.sort(key=lambda city: city['name'])
    for i in range(len(cities)):
        cities[i]['id'] = i    

    for city in cities:
        city['heroes'] = get_city_heroes(city['name'], city_heroes)

    ts2 = set([city['name'] for city in cities])
    print('\nAccording to the Texas sheet in liberators.xlsx, there are\n  {} cities'.format(len(ts2)))

    sym_diff = (ts1 - ts2).union(ts2 - ts1)
    discrepancies += len(sym_diff)
    if len(sym_diff) == 0:
        print('No discrepancies.\n')
    else:
        print('Discrepancies:')
        for camp in sym_diff:
            print('  ', camp)    

    path = os.path.join(data_dir, 'texas.json')
    with open(path, 'w') as f:
        json.dump(cities, f, indent=2, sort_keys=True) 

    if discrepancies > 0:
        print('To fix discrepancies, check for spelling errors, special characters, extra spaces...')
        print('New entires may also be needed in the Camps or Heroes sheets.')
               

if __name__ == '__main__':
    main()