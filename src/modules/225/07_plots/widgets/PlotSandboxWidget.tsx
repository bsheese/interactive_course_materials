import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { WidgetCard } from '@kit/components/WidgetCard';
import { ScatterPlot, type PlotLine, type PlotPoint } from '@kit/components/ScatterPlot';
import { CategoricalBar } from '../charts/CategoricalBar';
import { CategoricalBox } from '../charts/CategoricalBox';
import { CategoricalStrip } from '../charts/CategoricalStrip';
import { CategoricalViolin } from '../charts/CategoricalViolin';
import { CorrelationHeatmap } from '../charts/CorrelationHeatmap';
import { DistributionHistogram } from '../charts/DistributionHistogram';
import { ChartLegend } from '../charts/Legend';
import { hexForIndex, toneForIndex } from '../charts/palette';
import { AMES, PENGUINS } from '../data';
import { calculateOLS, uniqueValues, type Row } from '../stats';

type PlotType = 'hist' | 'box' | 'violin' | 'bar' | 'strip' | 'scatter' | 'reg' | 'heatmap';
type DatasetKey = 'penguins' | 'ames';

const PLOT_TYPES: { key: PlotType; label: string; fn: string }[] = [
  { key: 'hist', label: 'Histogram', fn: 'histplot' },
  { key: 'box', label: 'Box', fn: 'boxplot' },
  { key: 'violin', label: 'Violin', fn: 'violinplot' },
  { key: 'bar', label: 'Bar', fn: 'barplot' },
  { key: 'strip', label: 'Strip', fn: 'stripplot' },
  { key: 'scatter', label: 'Scatter', fn: 'scatterplot' },
  { key: 'reg', label: 'Reg', fn: 'regplot' },
  { key: 'heatmap', label: 'Heatmap', fn: 'heatmap' },
];

const CATEGORICAL_FAMILY: PlotType[] = ['box', 'violin', 'bar', 'strip'];
const RELATIONAL_FAMILY: PlotType[] = ['scatter', 'reg'];

interface DatasetSpec {
  label: string;
  rows: Row[];
  categorical: string[];
  numeric: string[];
}

const DATASETS: Record<DatasetKey, DatasetSpec> = {
  penguins: {
    label: 'penguins',
    rows: PENGUINS,
    categorical: ['species', 'island', 'sex'],
    numeric: ['bill_length_mm', 'bill_depth_mm', 'flipper_length_mm', 'body_mass_g'],
  },
  ames: {
    label: 'housing',
    rows: AMES,
    categorical: ['neighborhood', 'central_air', 'house_style'],
    numeric: ['overall_qual', 'gr_liv_area', 'sale_price', 'year_built', 'garage_cars'],
  },
};

interface Selection {
  x: string;
  y: string;
  hue: string;
}

function defaultsFor(plotType: PlotType, ds: DatasetSpec): Selection {
  const [cat0, cat1] = ds.categorical;
  const [num0, num1] = ds.numeric;
  if (plotType === 'hist') return { x: num0, y: '', hue: cat0 };
  if (RELATIONAL_FAMILY.includes(plotType)) return { x: num0, y: num1, hue: cat0 };
  if (plotType === 'heatmap') return { x: '', y: '', hue: '' };
  return { x: cat0, y: num0, hue: cat1 };
}

function generateCode(plotType: PlotType, ds: DatasetKey, sel: Selection): string {
  const meta = PLOT_TYPES.find((p) => p.key === plotType)!;
  const dfName = DATASETS[ds].label;

  if (plotType === 'heatmap') {
    return [`corr = ${dfName}.select_dtypes("number").corr()`, `sns.heatmap(corr, annot=True, cmap="coolwarm")`].join('\n');
  }

  const lines = [`sns.${meta.fn}(`, `    data=${dfName},`, `    x="${sel.x}",`];
  if (sel.y && plotType !== 'hist') lines.push(`    y="${sel.y}",`);
  if (sel.hue) lines.push(`    hue="${sel.hue}",`);
  lines.push(')');
  return lines.join('\n');
}

const FieldSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  allowNone?: boolean;
}> = ({ label, value, options, onChange, allowNone }) => (
  <label className="block">
    <span className="block text-[9px] text-[#767676] uppercase tracking-wide font-bold mb-1">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs font-mono border border-[#1A1A1A]/15 rounded-sm px-1.5 py-1 bg-white text-[#1A1A1A]"
    >
      {allowNone && <option value="">None</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </label>
);

/** The capstone: every plot type from this module in one place, over either
 *  dataset, with the generated seaborn call updating to match. */
export const PlotSandboxWidget: React.FC = () => {
  const [dataset, setDataset] = useState<DatasetKey>('penguins');
  const [plotType, setPlotType] = useState<PlotType>('scatter');
  const [selection, setSelection] = useState<Selection>(() => defaultsFor('scatter', DATASETS.penguins));

  const ds = DATASETS[dataset];

  const changeDataset = (next: DatasetKey) => {
    setDataset(next);
    setSelection(defaultsFor(plotType, DATASETS[next]));
  };
  const changePlotType = (next: PlotType) => {
    setPlotType(next);
    setSelection(defaultsFor(next, ds));
  };

  const { x, y, hue } = selection;
  const categories = useMemo(() => (x ? uniqueValues(ds.rows, x) : []), [ds, x]);
  const hueCategories = useMemo(() => (hue ? uniqueValues(ds.rows, hue) : []), [ds, hue]);

  const scatterPoints = useMemo<PlotPoint[]>(() => {
    if (!RELATIONAL_FAMILY.includes(plotType)) return [];
    return ds.rows.map((r, i) => ({
      id: i,
      x: Number(r[x]),
      y: Number(r[y]),
      tone: hue ? toneForIndex(hueCategories.indexOf(String(r[hue]))) : 'default',
    }));
  }, [ds, x, y, hue, hueCategories, plotType]);

  const olsLine = useMemo<PlotLine[]>(() => {
    if (plotType !== 'reg') return [];
    const points = ds.rows.map((r) => ({ x: Number(r[x]), y: Number(r[y]) }));
    const ols = calculateOLS(points);
    return [{ slope: ols.slope, intercept: ols.intercept }];
  }, [ds, x, y, plotType]);

  let chart: React.ReactNode;
  if (plotType === 'hist') {
    chart = <DistributionHistogram rows={ds.rows} xKey={x} hueKey={hue || undefined} hueCategories={hue ? hueCategories : undefined} bins={16} xLabel={x} />;
  } else if (plotType === 'box') {
    chart = <CategoricalBox rows={ds.rows} xKey={x} yKey={y} categories={categories} yLabel={y} />;
  } else if (plotType === 'violin') {
    chart = <CategoricalViolin rows={ds.rows} xKey={x} yKey={y} categories={categories} bwAdjust={1} yLabel={y} />;
  } else if (plotType === 'bar') {
    chart = (
      <CategoricalBar rows={ds.rows} xKey={x} yKey={y} categories={categories} hueKey={hue || undefined} hueCategories={hue ? hueCategories : undefined} yLabel={y} />
    );
  } else if (plotType === 'strip') {
    chart = (
      <CategoricalStrip
        rows={ds.rows}
        xKey={x}
        yKey={y}
        categories={categories}
        hueKey={hue || undefined}
        hueCategories={hue ? hueCategories : undefined}
        jitter={0.25}
        yLabel={y}
      />
    );
  } else if (plotType === 'reg') {
    chart = <ScatterPlot points={scatterPoints} lines={olsLine} xLabel={x} yLabel={y} />;
  } else if (plotType === 'heatmap') {
    chart = <CorrelationHeatmap rows={ds.rows} columns={ds.numeric.map((k) => ({ key: k, label: k }))} maskUpper={false} />;
  } else {
    chart = <ScatterPlot points={scatterPoints} xLabel={x} yLabel={y} />;
  }

  const toggleClass = (active: boolean) =>
    `px-2.5 py-1 rounded-sm text-[10px] font-medium border transition-colors ${
      active ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#1A1A1A]/10 text-[#666666] hover:bg-[#F5F2ED]'
    }`;

  return (
    <WidgetCard icon={Sparkles} title="The Full Sandbox" subtitle="Every plot type, either dataset — the code always matches what's on screen">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(Object.keys(DATASETS) as DatasetKey[]).map((d) => (
            <button key={d} onClick={() => changeDataset(d)} className={toggleClass(dataset === d)}>
              {DATASETS[d].label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PLOT_TYPES.map((p) => (
            <button key={p.key} onClick={() => changePlotType(p.key)} className={toggleClass(plotType === p.key)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {plotType !== 'heatmap' && (
        <div className="grid grid-cols-3 gap-2">
          <FieldSelect
            label="x"
            value={x}
            options={CATEGORICAL_FAMILY.includes(plotType) ? ds.categorical : ds.numeric}
            onChange={(v) => setSelection((s) => ({ ...s, x: v }))}
          />
          {plotType !== 'hist' && (
            <FieldSelect label="y" value={y} options={ds.numeric} onChange={(v) => setSelection((s) => ({ ...s, y: v }))} />
          )}
          <FieldSelect
            label="hue"
            value={hue}
            options={ds.categorical}
            allowNone
            onChange={(v) => setSelection((s) => ({ ...s, hue: v }))}
          />
        </div>
      )}

      {chart}
      {hue && plotType !== 'heatmap' && <ChartLegend items={hueCategories.map((h, i) => ({ label: h, color: hexForIndex(i) }))} />}

      <pre className="bg-[#1A1A1A] text-[#ECE8E1] rounded-sm p-3 text-[10px] font-mono overflow-x-auto whitespace-pre">
        {generateCode(plotType, dataset, selection)}
      </pre>
    </WidgetCard>
  );
};
