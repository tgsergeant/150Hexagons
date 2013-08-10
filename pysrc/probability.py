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

    for fname in infiles:
        if fname.startswith("data-"):
            # Get date from filename
            filedate = fname[5:-4]
            datahistory.append(filedate)
            toJSON(OUTFOLDER + "data-" + filedate + ".json", filedate)


    with open(OUTFOLDER + "history.json", 'w') as histfile:
        fulljson = {
            'meta':{
                'date-gen':datetime.date.today().isoformat()
            },
            'data':datahistory,
        }
        json.dump(fulljson, histfile)

def toJSON(outfile, filedate):
    electorates = []
    elec_order = []

    with open(INPUTFOLDER + "data-" + filedate + ".csv") as oddsfile:
        oreader = csv.reader(oddsfile)
        next(oreader)
        for line in oreader:
            elec = {
                'id': 'p' + line[0],
                'name': line[1],
                'alpha': "{:.3}".format(float(line[3])),
                'fav': line[4],
                'p': "{:.0f}".format(100 * float(line[5])),
            }
            if not (elec['fav'] == 'ALP' or elec['fav'] == 'Coalition'):
                elec['colour'] = line[2]
            electorates.append(elec)

    with open(INPUTFOLDER + "rectangle-" + filedate + ".csv") as oddsfile:
        oreader = csv.reader(oddsfile)
        next(oreader)
        for line in oreader:
            elec_order.append(int(line[0]))

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
