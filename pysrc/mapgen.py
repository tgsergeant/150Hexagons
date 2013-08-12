import csv

A = (17, -15)
B = (600, 750)

MAPFILE = "../static/img/map.svg"
INPUTFOLDER = "../input/"

def linear_transform(i):
    return lambda f: A[i]*f + B[i]


def get_coordinates(filename, i):
    coord = []
    with open(filename) as file:
        table = csv.reader(file)
        next(table) #Skip the header
        for row in table:
            coord.append(list(map(linear_transform(i), map(float, row[1:]))))
    return coord


def main():
    xcoord = get_coordinates(INPUTFOLDER + "hex-x-coord.csv", 0)
    ycoord = get_coordinates(INPUTFOLDER + "hex-y-coord.csv", 1)

    with open(MAPFILE, 'w') as out:
        out.write('<?xml-stylesheet href="../css/map.css" type="text/css"?>')
        out.write('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="overflow: hidden; position: relative;">')
        for i in range(len(xcoord)):
            xc = xcoord[i]
            yc = ycoord[i]
            formatstr = "M{},{}".format(xc[0], yc[0])
            for j in range(1,6):
                formatstr += "L{},{}".format(xc[j], yc[j])
            formatstr += "L{},{}".format(xc[0], yc[0])
            out.write('<path id="{}" d="{}"/>'.format("p" + str(i+1), formatstr))

        out.write("</svg>")



if __name__ == "__main__":
    main()
