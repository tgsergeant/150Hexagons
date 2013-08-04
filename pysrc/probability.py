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
            toJSON(INPUTFOLDER + fname, OUTFOLDER + "data-" + filedate + ".json")

    with open(OUTFOLDER + "history.json", 'w') as histfile:
        json.dump(history, histfile)

def toJSON(infile, outfile):
    electorates = []

    with open(infile) as oddsfile:
        oreader = csv.reader(oddsfile)
        next(oreader)
        for line in oreader:
            elec = {
                'id': 'p' + line[0],
                'name': line[1],
                'colour': line[2][:-2],
                'alpha': float(line[3]),
                'favourite': line[4],
                'prob': float(line[5]),
            }
            electorates.append(elec)

    with open(outfile, "w") as out:
        json.dump(electorates, out)



if __name__ == "__main__":
    main()