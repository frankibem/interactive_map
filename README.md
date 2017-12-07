* This document is best viewed in a markdown reader

# 1. Liberators - Interactive Map
This repository contains the python script to generate the data .json files as well as 
the files and scripts for the interactive map website.

## First Time Setup
### A. Requirements
- numpy 
- pandas
- xlrd

### B. Anaconda
This should only be done once. For subsequent updates see *2*
1. Download and install the latest version of anaconda for python 3.5+ [here](https://www.anaconda.com/download/) 
(should come with the requirements above).
2. Open a terminal and create a new environment using:
```
conda create -n liberators
```
3. Install the required packages using:
```
pip install numpy pandas xlrd
```

## 2. Updating the data files
This sections assumes that the excel file with the liberator information has been recently updated.
* It is recommended that you not update scripts/liberators.xlsx directly. Make a copy and update that instead.
1. Replace scripts/liberators.xlsx with the updated excel file (must have the same name)
2. Open a terminal and activate the previously created environment using:
```
source activate liberators
```
3. Run the python script to generate new data files (will be stored in scripts/output):
```
python scripts/liberators.py
```
4. Any discrepancies found will be reported. If there are none, Copy the files in scripts/output
to the data directory of the website
5. Upload the uploaded website files to the server.