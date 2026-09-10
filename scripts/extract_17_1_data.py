#!/usr/bin/env python3
"""Regenerate src/modules/377/17_1/data.ts from the cs377 repo's vendored CSVs.

The 17_1 widgets use the real course datasets so their numbers match the
notebooks. Point DATA_DIR at a checkout of https://github.com/bsheese/cs377
and run:

    python scripts/extract_17_1_data.py [path/to/cs377/data]
"""
import csv
import json
import sys
from pathlib import Path

DATA_DIR = Path(sys.argv[1] if len(sys.argv) > 1 else "~/repos/courses_public/377/data").expanduser()
OUT = Path(__file__).resolve().parent.parent / "src/modules/377/17_1/data.ts"


def rows(name):
    with open(DATA_DIR / name, newline="") as fh:
        return list(csv.DictReader(fh))


def main():
    out = ['''/**
 * Real course datasets, extracted from the cs377 repo's vendored CSVs so the
 * numbers here match the numbers in the notebooks exactly.
 *
 * Source: https://github.com/bsheese/cs377/tree/main/data
 * Regenerate with scripts/extract_17_1_data.py.
 */

export type XY = [x: number, y: number];
''']

    # Penguins: the notebooks drop rows with ANY missing value, leaving n=333.
    peng = [(float(r["flipper_length_mm"]), float(r["body_mass_g"]))
            for r in rows("penguins.csv")
            if all(r[c] not in ("", "NA") for c in ["flipper_length_mm", "body_mass_g", "sex"])]
    out.append("/** Palmer Penguins, n=333 (rows with any missing value dropped, as in 17_1_1).\n"
               " *  x = flipper length (mm), y = body mass (g). OLS: mass = -5872.09 + 50.15 * flipper, R2 = 0.762. */")
    out.append("export const PENGUINS: XY[] = "
               + json.dumps([[round(a, 1), round(b, 1)] for a, b in peng], separators=(",", ":")) + ";\n")

    gap = [(r["country"], float(r["gdpPercap"]), float(r["lifeExp"]))
           for r in rows("gapminderDataFiveYear.csv") if r["year"] == "2007"]
    out.append("/** Gapminder 2007, n=142. x = GDP per capita (intl $), y = life expectancy (years).\n"
               " *  Raw fit R2 = 0.461 with U-shaped residuals; log(GDP) fit R2 = 0.654 (17_1_5). */")
    out.append("export const GAPMINDER_2007: { country: string; gdp: number; lifeExp: number }[] = "
               + json.dumps([{"country": c, "gdp": round(g, 1), "lifeExp": round(l, 2)} for c, g, l in gap],
                            separators=(",", ":")) + ";\n")

    mpg = [(float(r["displacement"]), float(r["mpg"]))
           for r in rows("data_auto_mpg.csv") if r["displacement"] and r["mpg"]]
    out.append("/** Auto MPG, n=398. x = displacement (cu in), y = mpg.\n"
               " *  Linear fit R2 = 0.647 with U-shaped residuals; 1/mpg ~ displacement gives R2 = 0.751 (17_1_3, 17_1_5). */")
    out.append("export const AUTO_MPG: XY[] = "
               + json.dumps([[round(a, 1), round(b, 1)] for a, b in mpg], separators=(",", ":")) + ";\n")

    ames_all = [(float(r["area"]), float(r["price"]))
                for r in rows("ames_openintro.csv") if r["area"] and r["price"]]
    ames = ames_all[::12]
    out.append(f"/** Ames Housing, every 12th row of {len(ames_all)} for a responsive scatter (n={len(ames)}).\n"
               " *  x = above-grade living area (sq ft), y = sale price ($). Used for influence work in 17_1_4. */")
    out.append("export const AMES: XY[] = "
               + json.dumps([[round(a, 0), round(b, 0)] for a, b in ames], separators=(",", ":")) + ";\n")

    OUT.write_text("\n".join(out))
    print(f"wrote {OUT} — penguins {len(peng)}, gapminder {len(gap)}, mpg {len(mpg)}, ames {len(ames)}")


if __name__ == "__main__":
    main()
