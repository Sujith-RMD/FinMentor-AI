import React from 'react';

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Generate a portfolio to see the chart.
      </div>
    );
  }

  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
      <svg viewBox="-1 -1 2 2" className="w-56 h-56 transform -rotate-90">
        {data.map(({ value, color }) => {
          const percent = value / total;
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            'L 0 0',
          ].join(' ');

          return <path key={color} d={pathData} fill={color} />;
        })}
      </svg>
      <div className="flex flex-col gap-2 text-sm">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="font-medium dark:text-white">{name}:</span>
            <span className="dark:text-gray-300">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
