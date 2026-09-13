/**
 * Palmer Penguins and a small Ames Housing sample, ported from the source
 * "Seaborn Visualizer" app this module was built from. Real Palmer Penguins
 * summary statistics (Adelie/Chinstrap/Gentoo bill, flipper and mass values)
 * with a fixed, deterministic sample — the same rows on every machine.
 */

/** Extending the index signature lets every row satisfy `stats.ts`'s neutral
 *  `Row` type (`Record<string, string | number>`) while keeping literal
 *  field types (species, sex, ...) for everything written by hand here. */
export interface PenguinRow extends Record<string, string | number> {
  id: number;
  species: 'Adelie' | 'Chinstrap' | 'Gentoo';
  island: 'Torgersen' | 'Biscoe' | 'Dream';
  bill_length_mm: number;
  bill_depth_mm: number;
  flipper_length_mm: number;
  body_mass_g: number;
  sex: 'male' | 'female';
  year: number;
}

export interface AmesRow extends Record<string, string | number> {
  id: number;
  neighborhood: 'NorthAmes' | 'CollegeCreek' | 'OldTown' | 'Edwards' | 'Somerset';
  overall_qual: number;
  gr_liv_area: number;
  sale_price: number;
  year_built: number;
  garage_cars: number;
  house_style: '1Story' | '2Story' | 'Split';
  central_air: 'Y' | 'N';
}

export const PENGUINS: PenguinRow[] = [
  { id: 1, species: 'Adelie', island: 'Torgersen', bill_length_mm: 39.1, bill_depth_mm: 18.7, flipper_length_mm: 181, body_mass_g: 3750, sex: 'male', year: 2007 },
  { id: 2, species: 'Adelie', island: 'Torgersen', bill_length_mm: 39.5, bill_depth_mm: 17.4, flipper_length_mm: 186, body_mass_g: 3800, sex: 'female', year: 2007 },
  { id: 3, species: 'Adelie', island: 'Torgersen', bill_length_mm: 40.3, bill_depth_mm: 18.0, flipper_length_mm: 195, body_mass_g: 3250, sex: 'female', year: 2007 },
  { id: 4, species: 'Adelie', island: 'Torgersen', bill_length_mm: 36.7, bill_depth_mm: 19.3, flipper_length_mm: 193, body_mass_g: 3450, sex: 'female', year: 2007 },
  { id: 5, species: 'Adelie', island: 'Torgersen', bill_length_mm: 39.3, bill_depth_mm: 20.6, flipper_length_mm: 190, body_mass_g: 3650, sex: 'male', year: 2007 },
  { id: 6, species: 'Adelie', island: 'Torgersen', bill_length_mm: 38.9, bill_depth_mm: 17.8, flipper_length_mm: 181, body_mass_g: 3625, sex: 'female', year: 2007 },
  { id: 7, species: 'Adelie', island: 'Torgersen', bill_length_mm: 39.2, bill_depth_mm: 19.6, flipper_length_mm: 195, body_mass_g: 4675, sex: 'male', year: 2007 },
  { id: 8, species: 'Adelie', island: 'Torgersen', bill_length_mm: 41.1, bill_depth_mm: 17.6, flipper_length_mm: 182, body_mass_g: 3200, sex: 'female', year: 2007 },
  { id: 9, species: 'Adelie', island: 'Torgersen', bill_length_mm: 38.6, bill_depth_mm: 21.2, flipper_length_mm: 191, body_mass_g: 3800, sex: 'male', year: 2007 },
  { id: 10, species: 'Adelie', island: 'Torgersen', bill_length_mm: 34.6, bill_depth_mm: 21.1, flipper_length_mm: 198, body_mass_g: 4400, sex: 'male', year: 2007 },
  { id: 11, species: 'Adelie', island: 'Torgersen', bill_length_mm: 36.6, bill_depth_mm: 17.8, flipper_length_mm: 185, body_mass_g: 3700, sex: 'female', year: 2007 },
  { id: 12, species: 'Adelie', island: 'Torgersen', bill_length_mm: 38.7, bill_depth_mm: 19.0, flipper_length_mm: 195, body_mass_g: 3450, sex: 'female', year: 2007 },
  { id: 13, species: 'Adelie', island: 'Torgersen', bill_length_mm: 42.5, bill_depth_mm: 20.7, flipper_length_mm: 197, body_mass_g: 4500, sex: 'male', year: 2007 },
  { id: 14, species: 'Adelie', island: 'Torgersen', bill_length_mm: 34.4, bill_depth_mm: 18.4, flipper_length_mm: 184, body_mass_g: 3325, sex: 'female', year: 2007 },
  { id: 15, species: 'Adelie', island: 'Torgersen', bill_length_mm: 46.0, bill_depth_mm: 21.5, flipper_length_mm: 194, body_mass_g: 4200, sex: 'male', year: 2007 },
  { id: 16, species: 'Adelie', island: 'Biscoe', bill_length_mm: 37.8, bill_depth_mm: 18.3, flipper_length_mm: 174, body_mass_g: 3400, sex: 'female', year: 2007 },
  { id: 17, species: 'Adelie', island: 'Biscoe', bill_length_mm: 37.7, bill_depth_mm: 18.7, flipper_length_mm: 180, body_mass_g: 3600, sex: 'male', year: 2007 },
  { id: 18, species: 'Adelie', island: 'Biscoe', bill_length_mm: 35.9, bill_depth_mm: 19.2, flipper_length_mm: 189, body_mass_g: 3800, sex: 'female', year: 2007 },
  { id: 19, species: 'Adelie', island: 'Biscoe', bill_length_mm: 38.2, bill_depth_mm: 18.1, flipper_length_mm: 185, body_mass_g: 3950, sex: 'male', year: 2007 },
  { id: 20, species: 'Adelie', island: 'Biscoe', bill_length_mm: 38.8, bill_depth_mm: 17.2, flipper_length_mm: 180, body_mass_g: 3800, sex: 'male', year: 2007 },
  { id: 21, species: 'Adelie', island: 'Biscoe', bill_length_mm: 35.3, bill_depth_mm: 18.9, flipper_length_mm: 187, body_mass_g: 3800, sex: 'female', year: 2007 },
  { id: 22, species: 'Adelie', island: 'Biscoe', bill_length_mm: 40.6, bill_depth_mm: 18.6, flipper_length_mm: 183, body_mass_g: 3550, sex: 'male', year: 2007 },
  { id: 23, species: 'Adelie', island: 'Biscoe', bill_length_mm: 40.5, bill_depth_mm: 17.9, flipper_length_mm: 187, body_mass_g: 3200, sex: 'female', year: 2007 },
  { id: 24, species: 'Adelie', island: 'Biscoe', bill_length_mm: 37.9, bill_depth_mm: 18.6, flipper_length_mm: 172, body_mass_g: 3150, sex: 'female', year: 2007 },
  { id: 25, species: 'Adelie', island: 'Biscoe', bill_length_mm: 40.5, bill_depth_mm: 18.9, flipper_length_mm: 180, body_mass_g: 3950, sex: 'male', year: 2007 },
  { id: 26, species: 'Adelie', island: 'Biscoe', bill_length_mm: 37.2, bill_depth_mm: 18.1, flipper_length_mm: 178, body_mass_g: 3900, sex: 'male', year: 2008 },
  { id: 27, species: 'Adelie', island: 'Biscoe', bill_length_mm: 40.9, bill_depth_mm: 18.9, flipper_length_mm: 184, body_mass_g: 3900, sex: 'male', year: 2008 },
  { id: 28, species: 'Adelie', island: 'Biscoe', bill_length_mm: 39.0, bill_depth_mm: 17.5, flipper_length_mm: 186, body_mass_g: 3000, sex: 'female', year: 2008 },
  { id: 29, species: 'Adelie', island: 'Biscoe', bill_length_mm: 39.2, bill_depth_mm: 21.1, flipper_length_mm: 196, body_mass_g: 4150, sex: 'male', year: 2008 },
  { id: 30, species: 'Adelie', island: 'Biscoe', bill_length_mm: 38.8, bill_depth_mm: 20.0, flipper_length_mm: 190, body_mass_g: 3950, sex: 'male', year: 2008 },
  { id: 31, species: 'Adelie', island: 'Dream', bill_length_mm: 39.5, bill_depth_mm: 16.7, flipper_length_mm: 178, body_mass_g: 3250, sex: 'female', year: 2007 },
  { id: 32, species: 'Adelie', island: 'Dream', bill_length_mm: 37.2, bill_depth_mm: 18.1, flipper_length_mm: 178, body_mass_g: 3900, sex: 'male', year: 2007 },
  { id: 33, species: 'Adelie', island: 'Dream', bill_length_mm: 39.5, bill_depth_mm: 17.8, flipper_length_mm: 188, body_mass_g: 3300, sex: 'female', year: 2007 },
  { id: 34, species: 'Adelie', island: 'Dream', bill_length_mm: 40.9, bill_depth_mm: 18.9, flipper_length_mm: 184, body_mass_g: 3900, sex: 'male', year: 2007 },
  { id: 35, species: 'Adelie', island: 'Dream', bill_length_mm: 36.4, bill_depth_mm: 17.0, flipper_length_mm: 195, body_mass_g: 3675, sex: 'female', year: 2007 },
  { id: 36, species: 'Adelie', island: 'Dream', bill_length_mm: 39.2, bill_depth_mm: 21.1, flipper_length_mm: 196, body_mass_g: 4150, sex: 'male', year: 2007 },
  { id: 37, species: 'Adelie', island: 'Dream', bill_length_mm: 38.8, bill_depth_mm: 20.0, flipper_length_mm: 190, body_mass_g: 3950, sex: 'male', year: 2007 },
  { id: 38, species: 'Adelie', island: 'Dream', bill_length_mm: 42.2, bill_depth_mm: 18.5, flipper_length_mm: 180, body_mass_g: 4250, sex: 'male', year: 2007 },
  { id: 39, species: 'Adelie', island: 'Dream', bill_length_mm: 37.6, bill_depth_mm: 19.3, flipper_length_mm: 181, body_mass_g: 3300, sex: 'female', year: 2007 },
  { id: 40, species: 'Adelie', island: 'Dream', bill_length_mm: 39.8, bill_depth_mm: 19.1, flipper_length_mm: 184, body_mass_g: 4650, sex: 'male', year: 2007 },
  { id: 41, species: 'Adelie', island: 'Dream', bill_length_mm: 36.5, bill_depth_mm: 18.0, flipper_length_mm: 182, body_mass_g: 3150, sex: 'female', year: 2008 },
  { id: 42, species: 'Adelie', island: 'Dream', bill_length_mm: 40.8, bill_depth_mm: 18.9, flipper_length_mm: 208, body_mass_g: 4300, sex: 'male', year: 2008 },
  { id: 43, species: 'Adelie', island: 'Dream', bill_length_mm: 36.0, bill_depth_mm: 18.5, flipper_length_mm: 186, body_mass_g: 3100, sex: 'female', year: 2008 },
  { id: 44, species: 'Adelie', island: 'Dream', bill_length_mm: 42.3, bill_depth_mm: 21.2, flipper_length_mm: 191, body_mass_g: 4150, sex: 'male', year: 2008 },
  { id: 45, species: 'Chinstrap', island: 'Dream', bill_length_mm: 46.5, bill_depth_mm: 17.9, flipper_length_mm: 192, body_mass_g: 3500, sex: 'female', year: 2007 },
  { id: 46, species: 'Chinstrap', island: 'Dream', bill_length_mm: 50.0, bill_depth_mm: 19.5, flipper_length_mm: 196, body_mass_g: 3900, sex: 'male', year: 2007 },
  { id: 47, species: 'Chinstrap', island: 'Dream', bill_length_mm: 51.3, bill_depth_mm: 19.2, flipper_length_mm: 193, body_mass_g: 3650, sex: 'male', year: 2007 },
  { id: 48, species: 'Chinstrap', island: 'Dream', bill_length_mm: 45.4, bill_depth_mm: 18.7, flipper_length_mm: 188, body_mass_g: 3525, sex: 'female', year: 2007 },
  { id: 49, species: 'Chinstrap', island: 'Dream', bill_length_mm: 52.7, bill_depth_mm: 19.8, flipper_length_mm: 197, body_mass_g: 3725, sex: 'male', year: 2007 },
  { id: 50, species: 'Chinstrap', island: 'Dream', bill_length_mm: 45.2, bill_depth_mm: 17.8, flipper_length_mm: 198, body_mass_g: 3950, sex: 'female', year: 2007 },
  { id: 51, species: 'Chinstrap', island: 'Dream', bill_length_mm: 46.1, bill_depth_mm: 18.2, flipper_length_mm: 198, body_mass_g: 3775, sex: 'female', year: 2007 },
  { id: 52, species: 'Chinstrap', island: 'Dream', bill_length_mm: 51.3, bill_depth_mm: 18.2, flipper_length_mm: 197, body_mass_g: 3750, sex: 'male', year: 2007 },
  { id: 53, species: 'Chinstrap', island: 'Dream', bill_length_mm: 46.0, bill_depth_mm: 18.9, flipper_length_mm: 195, body_mass_g: 4150, sex: 'female', year: 2008 },
  { id: 54, species: 'Chinstrap', island: 'Dream', bill_length_mm: 51.3, bill_depth_mm: 19.9, flipper_length_mm: 198, body_mass_g: 3700, sex: 'male', year: 2008 },
  { id: 55, species: 'Chinstrap', island: 'Dream', bill_length_mm: 46.6, bill_depth_mm: 17.8, flipper_length_mm: 193, body_mass_g: 3800, sex: 'female', year: 2008 },
  { id: 56, species: 'Chinstrap', island: 'Dream', bill_length_mm: 51.7, bill_depth_mm: 20.3, flipper_length_mm: 194, body_mass_g: 3775, sex: 'male', year: 2008 },
  { id: 57, species: 'Chinstrap', island: 'Dream', bill_length_mm: 47.0, bill_depth_mm: 17.3, flipper_length_mm: 185, body_mass_g: 3700, sex: 'female', year: 2008 },
  { id: 58, species: 'Chinstrap', island: 'Dream', bill_length_mm: 52.0, bill_depth_mm: 18.1, flipper_length_mm: 201, body_mass_g: 4050, sex: 'male', year: 2008 },
  { id: 59, species: 'Chinstrap', island: 'Dream', bill_length_mm: 45.9, bill_depth_mm: 17.1, flipper_length_mm: 190, body_mass_g: 3575, sex: 'female', year: 2008 },
  { id: 60, species: 'Chinstrap', island: 'Dream', bill_length_mm: 50.5, bill_depth_mm: 19.6, flipper_length_mm: 201, body_mass_g: 4050, sex: 'male', year: 2008 },
  { id: 61, species: 'Chinstrap', island: 'Dream', bill_length_mm: 50.3, bill_depth_mm: 20.0, flipper_length_mm: 197, body_mass_g: 3800, sex: 'male', year: 2009 },
  { id: 62, species: 'Chinstrap', island: 'Dream', bill_length_mm: 58.0, bill_depth_mm: 17.8, flipper_length_mm: 181, body_mass_g: 3700, sex: 'female', year: 2009 },
  { id: 63, species: 'Chinstrap', island: 'Dream', bill_length_mm: 46.4, bill_depth_mm: 18.6, flipper_length_mm: 190, body_mass_g: 3450, sex: 'female', year: 2009 },
  { id: 64, species: 'Chinstrap', island: 'Dream', bill_length_mm: 49.2, bill_depth_mm: 18.2, flipper_length_mm: 195, body_mass_g: 4400, sex: 'male', year: 2009 },
  { id: 65, species: 'Chinstrap', island: 'Dream', bill_length_mm: 42.4, bill_depth_mm: 17.3, flipper_length_mm: 181, body_mass_g: 3600, sex: 'female', year: 2009 },
  { id: 66, species: 'Chinstrap', island: 'Dream', bill_length_mm: 48.5, bill_depth_mm: 15.0, flipper_length_mm: 187, body_mass_g: 3500, sex: 'female', year: 2009 },
  { id: 67, species: 'Chinstrap', island: 'Dream', bill_length_mm: 55.8, bill_depth_mm: 19.8, flipper_length_mm: 207, body_mass_g: 4000, sex: 'male', year: 2009 },
  { id: 68, species: 'Chinstrap', island: 'Dream', bill_length_mm: 43.5, bill_depth_mm: 18.1, flipper_length_mm: 202, body_mass_g: 3400, sex: 'female', year: 2009 },
  { id: 69, species: 'Chinstrap', island: 'Dream', bill_length_mm: 49.6, bill_depth_mm: 18.2, flipper_length_mm: 193, body_mass_g: 3775, sex: 'male', year: 2009 },
  { id: 70, species: 'Chinstrap', island: 'Dream', bill_length_mm: 50.8, bill_depth_mm: 19.0, flipper_length_mm: 210, body_mass_g: 4100, sex: 'male', year: 2009 },
  { id: 71, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.1, bill_depth_mm: 13.2, flipper_length_mm: 211, body_mass_g: 4500, sex: 'female', year: 2007 },
  { id: 72, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 50.0, bill_depth_mm: 16.3, flipper_length_mm: 230, body_mass_g: 5700, sex: 'male', year: 2007 },
  { id: 73, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 48.7, bill_depth_mm: 14.1, flipper_length_mm: 210, body_mass_g: 4450, sex: 'female', year: 2007 },
  { id: 74, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 50.0, bill_depth_mm: 15.2, flipper_length_mm: 218, body_mass_g: 5700, sex: 'male', year: 2007 },
  { id: 75, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 47.6, bill_depth_mm: 14.5, flipper_length_mm: 215, body_mass_g: 5400, sex: 'male', year: 2007 },
  { id: 76, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.5, bill_depth_mm: 13.5, flipper_length_mm: 210, body_mass_g: 4550, sex: 'female', year: 2007 },
  { id: 77, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 45.4, bill_depth_mm: 14.6, flipper_length_mm: 211, body_mass_g: 4800, sex: 'female', year: 2007 },
  { id: 78, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.7, bill_depth_mm: 15.3, flipper_length_mm: 219, body_mass_g: 5200, sex: 'male', year: 2007 },
  { id: 79, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 43.3, bill_depth_mm: 13.4, flipper_length_mm: 209, body_mass_g: 4400, sex: 'female', year: 2007 },
  { id: 80, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.8, bill_depth_mm: 15.4, flipper_length_mm: 215, body_mass_g: 5150, sex: 'male', year: 2007 },
  { id: 81, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 40.9, bill_depth_mm: 13.7, flipper_length_mm: 214, body_mass_g: 4650, sex: 'female', year: 2007 },
  { id: 82, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 49.0, bill_depth_mm: 16.1, flipper_length_mm: 216, body_mass_g: 5550, sex: 'male', year: 2007 },
  { id: 83, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 45.5, bill_depth_mm: 13.7, flipper_length_mm: 214, body_mass_g: 4650, sex: 'female', year: 2008 },
  { id: 84, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 48.4, bill_depth_mm: 14.6, flipper_length_mm: 213, body_mass_g: 5850, sex: 'male', year: 2008 },
  { id: 85, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 45.8, bill_depth_mm: 14.6, flipper_length_mm: 210, body_mass_g: 4200, sex: 'female', year: 2008 },
  { id: 86, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 49.3, bill_depth_mm: 15.7, flipper_length_mm: 217, body_mass_g: 5850, sex: 'male', year: 2008 },
  { id: 87, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 42.0, bill_depth_mm: 13.5, flipper_length_mm: 210, body_mass_g: 4150, sex: 'female', year: 2008 },
  { id: 88, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 49.2, bill_depth_mm: 15.2, flipper_length_mm: 221, body_mass_g: 6300, sex: 'male', year: 2008 },
  { id: 89, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.2, bill_depth_mm: 14.5, flipper_length_mm: 209, body_mass_g: 4800, sex: 'female', year: 2008 },
  { id: 90, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 48.7, bill_depth_mm: 15.1, flipper_length_mm: 222, body_mass_g: 5350, sex: 'male', year: 2008 },
  { id: 91, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 50.2, bill_depth_mm: 14.3, flipper_length_mm: 218, body_mass_g: 5700, sex: 'male', year: 2008 },
  { id: 92, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 45.1, bill_depth_mm: 14.5, flipper_length_mm: 215, body_mass_g: 5000, sex: 'female', year: 2008 },
  { id: 93, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.5, bill_depth_mm: 14.5, flipper_length_mm: 213, body_mass_g: 4400, sex: 'female', year: 2008 },
  { id: 94, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.3, bill_depth_mm: 15.8, flipper_length_mm: 215, body_mass_g: 5050, sex: 'male', year: 2008 },
  { id: 95, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 42.9, bill_depth_mm: 13.1, flipper_length_mm: 215, body_mass_g: 5000, sex: 'female', year: 2008 },
  { id: 96, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 46.8, bill_depth_mm: 16.1, flipper_length_mm: 215, body_mass_g: 5500, sex: 'male', year: 2008 },
  { id: 97, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 45.2, bill_depth_mm: 13.8, flipper_length_mm: 215, body_mass_g: 4750, sex: 'female', year: 2009 },
  { id: 98, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 59.6, bill_depth_mm: 17.0, flipper_length_mm: 230, body_mass_g: 6050, sex: 'male', year: 2009 },
  { id: 99, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 49.9, bill_depth_mm: 16.1, flipper_length_mm: 213, body_mass_g: 5400, sex: 'male', year: 2009 },
  { id: 100, species: 'Gentoo', island: 'Biscoe', bill_length_mm: 45.3, bill_depth_mm: 13.7, flipper_length_mm: 210, body_mass_g: 4300, sex: 'female', year: 2009 },
];

export const AMES: AmesRow[] = [
  { id: 1, neighborhood: 'NorthAmes', overall_qual: 5, gr_liv_area: 1324, sale_price: 140000, year_built: 1961, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 2, neighborhood: 'NorthAmes', overall_qual: 6, gr_liv_area: 1656, sale_price: 182900, year_built: 1958, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 3, neighborhood: 'NorthAmes', overall_qual: 5, gr_liv_area: 1040, sale_price: 135000, year_built: 1955, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 4, neighborhood: 'NorthAmes', overall_qual: 6, gr_liv_area: 1600, sale_price: 172500, year_built: 1964, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 5, neighborhood: 'NorthAmes', overall_qual: 4, gr_liv_area: 912, sale_price: 89000, year_built: 1950, garage_cars: 1, house_style: '1Story', central_air: 'N' },
  { id: 6, neighborhood: 'NorthAmes', overall_qual: 5, gr_liv_area: 1400, sale_price: 149000, year_built: 1962, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 7, neighborhood: 'NorthAmes', overall_qual: 7, gr_liv_area: 1850, sale_price: 215000, year_built: 1970, garage_cars: 2, house_style: '2Story', central_air: 'Y' },
  { id: 8, neighborhood: 'NorthAmes', overall_qual: 5, gr_liv_area: 1120, sale_price: 131000, year_built: 1956, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 9, neighborhood: 'NorthAmes', overall_qual: 6, gr_liv_area: 1480, sale_price: 163000, year_built: 1968, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 10, neighborhood: 'NorthAmes', overall_qual: 5, gr_liv_area: 1250, sale_price: 142000, year_built: 1960, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 11, neighborhood: 'CollegeCreek', overall_qual: 7, gr_liv_area: 1710, sale_price: 208500, year_built: 2003, garage_cars: 2, house_style: '2Story', central_air: 'Y' },
  { id: 12, neighborhood: 'CollegeCreek', overall_qual: 8, gr_liv_area: 2198, sale_price: 279500, year_built: 2004, garage_cars: 3, house_style: '2Story', central_air: 'Y' },
  { id: 13, neighborhood: 'CollegeCreek', overall_qual: 7, gr_liv_area: 1512, sale_price: 198000, year_built: 2002, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 14, neighborhood: 'CollegeCreek', overall_qual: 8, gr_liv_area: 1850, sale_price: 245000, year_built: 2005, garage_cars: 2, house_style: '2Story', central_air: 'Y' },
  { id: 15, neighborhood: 'CollegeCreek', overall_qual: 7, gr_liv_area: 1620, sale_price: 214000, year_built: 2001, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 16, neighborhood: 'CollegeCreek', overall_qual: 8, gr_liv_area: 2400, sale_price: 310000, year_built: 2006, garage_cars: 3, house_style: '2Story', central_air: 'Y' },
  { id: 17, neighborhood: 'CollegeCreek', overall_qual: 6, gr_liv_area: 1420, sale_price: 178000, year_built: 1999, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 18, neighborhood: 'CollegeCreek', overall_qual: 7, gr_liv_area: 1780, sale_price: 232000, year_built: 2003, garage_cars: 2, house_style: '2Story', central_air: 'Y' },
  { id: 19, neighborhood: 'CollegeCreek', overall_qual: 8, gr_liv_area: 2050, sale_price: 268000, year_built: 2007, garage_cars: 3, house_style: '2Story', central_air: 'Y' },
  { id: 20, neighborhood: 'CollegeCreek', overall_qual: 7, gr_liv_area: 1680, sale_price: 220000, year_built: 2004, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 21, neighborhood: 'OldTown', overall_qual: 5, gr_liv_area: 1494, sale_price: 125000, year_built: 1923, garage_cars: 1, house_style: '2Story', central_air: 'N' },
  { id: 22, neighborhood: 'OldTown', overall_qual: 6, gr_liv_area: 1730, sale_price: 139000, year_built: 1930, garage_cars: 1, house_style: '2Story', central_air: 'Y' },
  { id: 23, neighborhood: 'OldTown', overall_qual: 4, gr_liv_area: 1048, sale_price: 92000, year_built: 1915, garage_cars: 1, house_style: '1Story', central_air: 'N' },
  { id: 24, neighborhood: 'OldTown', overall_qual: 5, gr_liv_area: 1380, sale_price: 118000, year_built: 1920, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 25, neighborhood: 'OldTown', overall_qual: 4, gr_liv_area: 864, sale_price: 79000, year_built: 1910, garage_cars: 0, house_style: '1Story', central_air: 'N' },
  { id: 26, neighborhood: 'OldTown', overall_qual: 6, gr_liv_area: 1820, sale_price: 152000, year_built: 1928, garage_cars: 1, house_style: '2Story', central_air: 'Y' },
  { id: 27, neighborhood: 'OldTown', overall_qual: 5, gr_liv_area: 1280, sale_price: 110000, year_built: 1925, garage_cars: 1, house_style: '1Story', central_air: 'N' },
  { id: 28, neighborhood: 'OldTown', overall_qual: 6, gr_liv_area: 1950, sale_price: 165000, year_built: 1935, garage_cars: 2, house_style: '2Story', central_air: 'Y' },
  { id: 29, neighborhood: 'Edwards', overall_qual: 4, gr_liv_area: 1100, sale_price: 105000, year_built: 1952, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 30, neighborhood: 'Edwards', overall_qual: 5, gr_liv_area: 1272, sale_price: 129000, year_built: 1957, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 31, neighborhood: 'Edwards', overall_qual: 3, gr_liv_area: 840, sale_price: 68500, year_built: 1948, garage_cars: 0, house_style: '1Story', central_air: 'N' },
  { id: 32, neighborhood: 'Edwards', overall_qual: 5, gr_liv_area: 1390, sale_price: 136000, year_built: 1963, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 33, neighborhood: 'Edwards', overall_qual: 4, gr_liv_area: 960, sale_price: 88000, year_built: 1950, garage_cars: 1, house_style: '1Story', central_air: 'N' },
  { id: 34, neighborhood: 'Edwards', overall_qual: 6, gr_liv_area: 1640, sale_price: 162000, year_built: 1974, garage_cars: 2, house_style: 'Split', central_air: 'Y' },
  { id: 35, neighborhood: 'Edwards', overall_qual: 5, gr_liv_area: 1200, sale_price: 121000, year_built: 1958, garage_cars: 1, house_style: '1Story', central_air: 'Y' },
  { id: 36, neighborhood: 'Somerset', overall_qual: 8, gr_liv_area: 1920, sale_price: 275000, year_built: 2005, garage_cars: 2, house_style: '2Story', central_air: 'Y' },
  { id: 37, neighborhood: 'Somerset', overall_qual: 9, gr_liv_area: 2340, sale_price: 345000, year_built: 2007, garage_cars: 3, house_style: '2Story', central_air: 'Y' },
  { id: 38, neighborhood: 'Somerset', overall_qual: 8, gr_liv_area: 1740, sale_price: 250000, year_built: 2006, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 39, neighborhood: 'Somerset', overall_qual: 9, gr_liv_area: 2600, sale_price: 382000, year_built: 2008, garage_cars: 3, house_style: '2Story', central_air: 'Y' },
  { id: 40, neighborhood: 'Somerset', overall_qual: 8, gr_liv_area: 1820, sale_price: 260000, year_built: 2005, garage_cars: 2, house_style: '1Story', central_air: 'Y' },
  { id: 41, neighborhood: 'Somerset', overall_qual: 9, gr_liv_area: 2820, sale_price: 415000, year_built: 2009, garage_cars: 3, house_style: '2Story', central_air: 'Y' },
  { id: 42, neighborhood: 'Somerset', overall_qual: 8, gr_liv_area: 1980, sale_price: 288000, year_built: 2007, garage_cars: 2, house_style: '2Story', central_air: 'Y' },
];

/** Numeric penguin columns used by the correlation heatmap. */
export const PENGUIN_NUMERIC_COLUMNS: { key: keyof PenguinRow; label: string }[] = [
  { key: 'bill_length_mm', label: 'Bill Length' },
  { key: 'bill_depth_mm', label: 'Bill Depth' },
  { key: 'flipper_length_mm', label: 'Flipper Length' },
  { key: 'body_mass_g', label: 'Body Mass' },
];

export const PENGUIN_SPECIES: PenguinRow['species'][] = ['Adelie', 'Chinstrap', 'Gentoo'];
export const PENGUIN_SEX: PenguinRow['sex'][] = ['male', 'female'];
