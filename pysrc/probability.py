import datetime

__author__ = 'tim'
import csv
import json
import os

INPUTFOLDER = "../input/"
OUTFOLDER = "../data/"

def main():
    infiles = os.listdir(INPUTFOLDER)
    datahistory = []
    geoinfo = []

    for fname in infiles:
        if fname.startswith("data-"):
            # Get date from filename
            filedate = fname[5:-4]
            datahistory.append(filedate)
            toJSON(OUTFOLDER + "data-" + filedate + ".json", filedate)

    with open(INPUTFOLDER + "geocoding.csv") as geofile:
        georeader = csv.reader(geofile)
        next(georeader)
        for elec in georeader:
            elecinfo = {
                'name': " ".join([w.capitalize() for w in elec[2].split()]),
                'desc': elec[3],
                'metro': elec[4] == "Metro",
            }
            geoinfo.append(elecinfo)

    with open(OUTFOLDER + "history.json", 'w') as histfile:
        fulljson = {
            'meta':{
                'date-gen':datetime.date.today().isoformat()
            },
            'data':datahistory,
            'geo':geoinfo,
        }
        json.dump(fulljson, histfile, separators=(',',':'))

def toJSON(outfile, filedate):
    electorates = []
    elec_order = []

    with open(INPUTFOLDER + "data-" + filedate + ".csv") as oddsfile:
        oreader = csv.reader(oddsfile)
        next(oreader)
        for line in oreader:
            elec = {
                'id': 'p' + line[0],
#                'name': " ".join([w.capitalize() for w in line[1].split()]),
                'a': "{:.3}".format(float(line[3])),
                'fav': line[4],
                'p': "{:.0f}".format(100 * float(line[5])),
            }
            if not (elec['fav'] == 'ALP' or elec['fav'] == 'Coalition'):
                elec['colour'] = line[2]
            electorates.append(elec)

            p_alp = float(line[5])
            if elec['fav'] != 'ALP':
                p_alp = 1 - p_alp
            elec_order.append((line[0], p_alp))

    elec_order.sort(key=lambda e: e[1])
    elec_order.reverse()
    elec_order = list(map(lambda e: int(e[0]), elec_order))

    with open(outfile, "w") as out:
        fulljson = {
            'meta':{
                'date-data': filedate,
                'date-gen':datetime.date.today().isoformat()
            },
            'data':electorates,
            'order':elec_order,
        }
        json.dump(fulljson, out, separators=(',',':'))



if __name__ == "__main__":
    main()
