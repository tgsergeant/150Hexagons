import os
import sys

INPUT_DIR = "../input/"

if __name__ == "__main__":
    lasttime = 0.0
    with open(".lastmodified", "r") as lastfile:
        try:
            lasttime = float(lastfile.read())
        except ValueError:
            lasttime = -1
    
    currentmodified = os.stat(INPUT_DIR).st_mtime

    status = 0
    if currentmodified != lasttime:
        print("Input folder has changed")
        status = 1
    
    with open(".lastmodified", "w") as lastfile:
        lastfile.write(str(currentmodified))

    sys.exit(status)
