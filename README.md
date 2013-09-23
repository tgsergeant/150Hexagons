ElectionProb
============

Infographic map for tracking the win probability in each electorate during the
2013 Australian election. Uses odds from SportsBet to calculate probabilities.
You can see the site live at http://www.150hexagons.com

Running Locally
---

The site is served and managed using
[Cactus](https://github.com/koenbok/Cactus), which requires Python 2.7. However,
the generation scripts are written in Python 3.3. Once you have that mess of
dependencies set up (preferably in a virtual environment), run:

```
cd pysrc/
python3 probability.py
cd ../
cactus serve
```

License
---

The project is MIT licensed. See LICENSE for details, if you need them.
