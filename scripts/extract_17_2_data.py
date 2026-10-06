#!/usr/bin/env python3
"""Regenerate src/modules/377/17_2/data.ts from the cs377 repo's vendored Ames file.

The 17_2 widgets use real Ames houses so their feature names, correlations and
dollar errors match the notebooks. Only the structural cleaning from 17_2_1_1 is
applied here (partial sales dropped, "no garage" / "no basement" blanks read as
zero); everything statistical is left for the widgets to do on training folds.

    python scripts/extract_17_2_data.py [path/to/cs377/data]
"""
import csv
import json
import math
import sys
from pathlib import Path

DATA_DIR = Path(sys.argv[1] if len(sys.argv) > 1 else "../public/377/data").expanduser()
OUT = Path(__file__).resolve().parent.parent / "src/modules/377/17_2/data.ts"

# Every third house keeps the bundle small and the in-browser CV instant.
STRIDE = 3

QUALITY = {"Ex": 5, "Gd": 4, "TA": 3, "Fa": 2, "Po": 1}

# (key, label, source) — order is the order the widgets list them in.
FEATURES = [
    ("overallQual", "Overall Qual", lambda r: num(r["Overall Qual"])),
    ("grLivArea", "Gr Liv Area", lambda r: num(r["Gr Liv Area"])),
    ("totalSF", "Total_Square_Footage",
     lambda r: num(r["1st Flr SF"]) + num(r["2nd Flr SF"]) + num(r["Total Bsmt SF"], 0)),
    ("totRms", "TotRms AbvGrd", lambda r: num(r["TotRms AbvGrd"])),
    ("garageCars", "Garage Cars", lambda r: num(r["Garage Cars"], 0)),
    ("garageArea", "Garage Area", lambda r: num(r["Garage Area"], 0)),
    ("yearBuilt", "Year Built", lambda r: num(r["Year Built"])),
    ("kitchenQual", "Kitchen Qual", lambda r: QUALITY[r["Kitchen Qual"]]),
    ("fireplaces", "Fireplaces", lambda r: num(r["Fireplaces"])),
    ("fullBath", "Full Bath", lambda r: num(r["Full Bath"])),
    ("logLotArea", "Log_Lot Area", lambda r: round(math.log(num(r["Lot Area"])), 4)),
    ("moSold", "Mo Sold", lambda r: num(r["Mo Sold"])),
]


def num(v, missing=None):
    if v in ("", "NA"):
        if missing is None:
            raise ValueError("missing")
        return missing
    f = float(v)
    return int(f) if f.is_integer() else f


def main():
    with open(DATA_DIR / "data_housing_ames.txt", newline="") as fh:
        raw = list(csv.DictReader(fh, delimiter="\t"))

    # The author's recommendation, applied at load time in every 17_2 notebook.
    kept = [r for r in raw if float(r["Gr Liv Area"]) < 4000]

    houses = []
    for r in kept[::STRIDE]:
        try:
            row = [f(r) for _, _, f in FEATURES]
        except (ValueError, KeyError):
            continue
        houses.append({"n": r["Neighborhood"], "p": int(r["SalePrice"]), "f": row})

    header = f'''/**
 * Real Ames houses for the 17_2 widgets, extracted from the cs377 repo's
 * vendored data_housing_ames.txt so feature names and dollar figures match the
 * notebooks.
 *
 * Every {STRIDE}rd house of the {len(kept)} left after dropping the partial sales
 * (Gr Liv Area >= 4000), n = {len(houses)}. Only deterministic cleaning is applied:
 * a blank garage or basement reads as 0, Kitchen Qual is mapped Ex..Po -> 5..1,
 * Lot Area is logged. Anything statistical happens inside the widgets, on
 * training folds only.
 *
 * Source: https://github.com/bsheese/cs377/tree/main/data
 * Regenerate with scripts/extract_17_2_data.py.
 */

export interface AmesHouse {{
  /** Neighborhood code, as in the raw file. */
  n: string;
  /** Sale price in dollars. */
  p: number;
  /** Feature values, in the order of AMES_FEATURES. */
  f: number[];
}}

export const AMES_FEATURES: {{ key: string; label: string }}[] = {json.dumps([{"key": k, "label": l} for k, l, _ in FEATURES])};

'''
    body = "export const AMES_HOUSES: AmesHouse[] = " + json.dumps(houses, separators=(",", ":")) + ";\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(header + body)
    print(f"wrote {OUT} — {len(houses)} houses, {len(FEATURES)} features")


if __name__ == "__main__":
    main()
