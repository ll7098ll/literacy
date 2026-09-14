
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface GraphData {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const GraphRenderer: React.FC<{ data: string }> = ({ data }) => {
  let parsed: GraphData;
  try {
    parsed = JSON.parse(data);
  } catch (e) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-lg">그래프 데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  const { type, data: chartData, xAxis, yAxis, title } = parsed;

  return (
    <div className="my-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
      {title && <h4 className="text-center font-bold text-slate-800 mb-4">{title}</h4>}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
            </LineChart>
          ) : type === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      {(xAxis || yAxis) && (
        <div className="mt-2 text-center text-xs text-slate-400">
          {xAxis && <span>X축: {xAxis}</span>}
          {xAxis && yAxis && <span className="mx-2">|</span>}
          {yAxis && <span>Y축: {yAxis}</span>}
        </div>
      )}
    </div>
  );
};

export default GraphRenderer;
