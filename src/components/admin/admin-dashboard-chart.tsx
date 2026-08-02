"use client";

import { useMemo, useState } from "react";
import {
  formatAdminCurrency,
  formatAdminNumber,
} from "@/lib/admin-format";

type TrendPoint = {
  averageOrderValue: number;
  date: string;
  orderCount: number;
  revenue: number;
};

type ChartMetric = "revenue" | "orders" | "average";

const WIDTH = 760;
const HEIGHT = 260;
const PADDING = { bottom: 36, left: 56, right: 16, top: 18 };

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function valueFor(point: TrendPoint, metric: ChartMetric) {
  if (metric === "orders") {
    return point.orderCount;
  }

  if (metric === "average") {
    return point.averageOrderValue;
  }

  return point.revenue;
}

function formatValue(value: number, metric: ChartMetric) {
  return metric === "orders"
    ? `${formatAdminNumber(value)} order${value === 1 ? "" : "s"}`
    : formatAdminCurrency(value);
}

export function AdminDashboardChart({
  points,
  rangeLabel,
}: {
  points: TrendPoint[];
  rangeLabel: string;
}) {
  const [metric, setMetric] = useState<ChartMetric>("revenue");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const values = useMemo(
    () => points.map((point) => valueFor(point, metric)),
    [metric, points],
  );
  const nonZeroPoints = points.filter((point) => point.orderCount > 0).length;

  if (nonZeroPoints < 2) {
    return (
      <div className="flex min-h-64 items-center justify-center px-5 py-8 text-center">
        <div>
          <p className="font-extrabold text-text">Not enough sales history yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-text-muted">
            Revenue trends will appear after paid orders are recorded on at least
            two different days.
          </p>
        </div>
      </div>
    );
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maximum = Math.max(...values, 1);
  const xFor = (index: number) =>
    PADDING.left +
    (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const yFor = (value: number) =>
    PADDING.top + plotHeight - (value / maximum) * plotHeight;
  const linePath = values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"} ${xFor(index).toFixed(2)} ${yFor(value).toFixed(2)}`,
    )
    .join(" ");
  const activePoint =
    activeIndex === null ? null : points[activeIndex] ?? null;
  const summary = `${rangeLabel}: ${formatAdminCurrency(
    points.reduce((sum, point) => sum + point.revenue, 0),
  )} paid revenue across ${formatAdminNumber(
    points.reduce((sum, point) => sum + point.orderCount, 0),
  )} eligible orders.`;
  const labelIndexes = Array.from(
    new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]),
  );

  return (
    <div className="px-3 pb-4 pt-2 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-label="Chart metric"
          className="inline-flex w-fit rounded-xl bg-surface-muted p-1"
          role="group"
        >
          {[
            ["revenue", "Revenue"],
            ["orders", "Orders"],
            ["average", "Average order"],
          ].map(([value, label]) => (
            <button
              aria-pressed={metric === value}
              className={[
                "min-h-9 cursor-pointer rounded-lg px-3 text-xs font-bold transition-colors",
                metric === value
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-muted hover:text-text",
              ].join(" ")}
              key={value}
              onClick={() => {
                setMetric(value as ChartMetric);
                setActiveIndex(null);
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <p
          aria-live="polite"
          className="min-h-5 text-sm font-semibold tabular-nums text-text-muted"
        >
          {activePoint
            ? `${shortDate(activePoint.date)} · ${formatValue(
                valueFor(activePoint, metric),
                metric,
              )}`
            : "Focus or hover a point for details"}
        </p>
      </div>
      <p className="sr-only">{summary}</p>
      <div className="mt-3 overflow-hidden">
        <svg
          aria-label={`${metric === "orders" ? "Orders" : metric === "average" ? "Average order value" : "Revenue"} chart for ${rangeLabel}`}
          className="h-auto min-h-[220px] w-full"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = PADDING.top + plotHeight * ratio;
            const value = maximum * (1 - ratio);

            return (
              <g key={ratio}>
                <line
                  stroke="#e1e5dd"
                  strokeDasharray={ratio === 1 ? undefined : "3 5"}
                  x1={PADDING.left}
                  x2={WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                />
                <text
                  fill="#6a756e"
                  fontSize="11"
                  textAnchor="end"
                  x={PADDING.left - 9}
                  y={y + 4}
                >
                  {metric === "orders"
                    ? Math.round(value)
                    : value >= 1000
                      ? `$${(value / 1000).toFixed(1)}k`
                      : `$${Math.round(value)}`}
                </text>
              </g>
            );
          })}

          {metric === "orders" ? (
            <g>
              {values.map((value, index) => {
                const availableWidth = plotWidth / points.length;
                const barWidth = Math.max(3, Math.min(18, availableWidth * 0.58));
                const x =
                  PADDING.left + availableWidth * index + availableWidth / 2 - barWidth / 2;
                const y = yFor(value);

                return (
                  <rect
                    fill={activeIndex === index ? "#b98525" : "#2f6d4a"}
                    height={Math.max(1, PADDING.top + plotHeight - y)}
                    key={points[index].date}
                    onBlur={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    rx="3"
                    tabIndex={0}
                    width={barWidth}
                    x={x}
                    y={y}
                  >
                    <title>
                      {shortDate(points[index].date)}, {formatValue(value, metric)}
                    </title>
                  </rect>
                );
              })}
            </g>
          ) : (
            <>
              <path
                d={linePath}
                fill="none"
                stroke="#23613c"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              {values.map((value, index) => (
                <circle
                  cx={xFor(index)}
                  cy={yFor(value)}
                  fill={activeIndex === index ? "#b98525" : "#ffffff"}
                  key={points[index].date}
                  onBlur={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  r={activeIndex === index ? 6 : 4}
                  stroke="#23613c"
                  strokeWidth="2.5"
                  tabIndex={0}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>
                    {shortDate(points[index].date)}, {formatValue(value, metric)}
                  </title>
                </circle>
              ))}
            </>
          )}

          {labelIndexes.map((index) => (
            <text
              fill="#6a756e"
              fontSize="11"
              key={points[index].date}
              textAnchor={
                index === 0
                  ? "start"
                  : index === points.length - 1
                    ? "end"
                    : "middle"
              }
              x={xFor(index)}
              y={HEIGHT - 10}
            >
              {shortDate(points[index].date)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
