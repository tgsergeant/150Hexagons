__author__ = 'tim'
import csv
import json

INPUTFOLDER = "../input/"
OUTFILE = "../data/data.json"

def main():
    electorates = []

    with open(INPUTFOLDER + "odds-3-8.csv") as oddsfile:
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

    with open(OUTFILE, "w") as out:
#        out.write("load(")
        json.dump(electorates, out)
#        out.write(");")


if __name__ == "__main__":
    main()