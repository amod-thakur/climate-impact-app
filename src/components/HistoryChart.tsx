import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { DailyEstimate } from '../types'

interface HistoryChartProps {
  estimates: DailyEstimate[]
  days: number
}

const CANADIAN_AVG = 3.98

function HistoryChart({ estimates, days }: HistoryChartProps) {
  const chartData = useMemo(() => {
    // Build a map of date -> total_co2e
    const dateMap = new Map(estimates.map((e) => [e.date, e.total_co2e]))

    // Generate last N days
    const data: { date: string; co2e: number }[] = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      data.push({
        date: dateStr,
        co2e: dateMap.get(dateStr) ?? 0,
      })
    }
    return data
  }, [estimates, days])

  return (
    <div
      className="rounded-lg border border-border bg-surface p-4"
      role="img"
      aria-label={`Line chart showing daily CO2e over the last ${days} days with Canadian average reference line at ${CANADIAN_AVG} kg`}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(val: string) => val.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(value: number | undefined) => [
              `${(value ?? 0).toFixed(2)} kg CO2e`,
              'Daily Estimate',
            ]}
            labelFormatter={(label) => String(label)}
          />
          <ReferenceLine
            y={CANADIAN_AVG}
            stroke="#d97706"
            strokeDasharray="4 4"
            label={{ value: 'Cdn avg', position: 'right', fontSize: 10, fill: '#d97706' }}
          />
          <Line
            type="monotone"
            dataKey="co2e"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HistoryChart
