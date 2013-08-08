import IN
import datetime

__author__ = 'tim'
import csv
import json
import os

INPUTFOLDER = "../input/"
OUTFOLDER = "../data/"

def main():
    infiles = os.listdir(INPUTFOLDER)
    history = []
    for fname in infiles:
        if fname.startswith("data-"):
            # Get date from filename
            filedate = fname[5:-4]
            history.append(filedate)
            toJSON(INPUTFOLDER + fname, OUTFOLDER + "data-" + filedate + ".json", filedate)

    with open(OUTFOLDER + "history.json", 'w') as histfile:
        fulljson = {
            'meta':{
                'date-gen':datetime.date.today().isoformat()
            },
            'data':history
        }
        json.dump(fulljson, histfile)

def toJSON(infile, outfile, filedate):
    electorates = []

    with open(infile) as oddsfile:
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

    with open(outfile, "w") as out:
        fulljson = {
            'meta':{
                'date-data': filedate,
                'date-gen':datetime.date.today().isoformat()
            },
            'data':electorates,
        }
        json.dump(fulljson, out, separators=(',',':'))



if __name__ == "__main__":
    main()