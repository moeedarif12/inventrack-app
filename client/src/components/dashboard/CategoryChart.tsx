import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  _id: string;
  name: string;
  color: string;
  revenue: number;
  count: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const FALLBACK_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
        <p className="font-medium text-foreground">{entry.name}</p>
        <p className="text-muted-foreground">Revenue: <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span></p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ data }: CategoryChartProps) {
  if (!data?.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          dataKey="revenue"
          nameKey="name"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry._id}
              fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
