import { useMedia } from '@/context/use-media';
import { MEDIA_ENTRY_STATUS } from '@/lib/constants';
import { BarChart, DonutChart } from '@yamada-ui/charts';
import { Flex } from '@yamada-ui/react';

export default function Stats() {
  const media = useMedia();
  const statusColorCodes = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
  ];
  return (
    <Flex
      alignItems={'center'}
      wrap={'wrap'}
      justify={{ md: 'center', base: 'space-evenly' }}
      gap="10"
      p="4"
    >
      <BarChart
        series={[
          { dataKey: 'Score: 10', color: '#a50026' },
          { dataKey: 'Score: 20', color: '#da362a' },
          { dataKey: 'Score: 30', color: '#f67a49' },
          { dataKey: 'Score: 40', color: '#fdbf6f' },
          { dataKey: 'Score: 50', color: '#feeda1' },
          { dataKey: 'Score: 60', color: '#e9f6a1' },
          { dataKey: 'Score: 70', color: '#b7e075' },
          { dataKey: 'Score: 80', color: '#73c264' },
          { dataKey: 'Score: 90', color: '#219c52' },
          { dataKey: 'Score: 100', color: '#006837' },
        ]}
        data={media.stats.scoreDistribution.map(({ score, amount }) => ({
          name: score,
          [`Score: ${score}`]: amount,
        }))}
        type="stacked"
        dataKey="name"
        size="md"
        xAxisLabel="Score Distribution"
        xAxisLabelProps={{
          fontSize: 'md',
        }}
        yAxisLabel="Amount"
        yAxisLabelProps={{
          fontSize: 'md',
        }}
        labelFormatter={(label) => ``}
      />
      <DonutChart
        data={media.stats.statusDistribution.map(
          ({ status, amount }, index) => ({
            name: MEDIA_ENTRY_STATUS[media.type.toLowerCase()].find(
              ({ value }) => value === status
            ).label,
            value: amount,
            color: statusColorCodes[index],
          })
        )}
        tooltipDataSource="segment"
        labelProps={{
          content: (
            <text
              className="recharts-text ui-donut-chart__label css-103uzdg css-0"
              x="80"
              y="80"
              textAnchor="middle"
            >
              <tspan fill="#808080" dy="-6">
                Status
              </tspan>
              <tspan fill="#808080" dy="14" dx="-35%">
                Distribution
              </tspan>
            </text>
          ),
        }}
        paddingAngle={10}
      />
      {/* <pre>
        {JSON.stringify(
          media.stats.statusDistribution.map(({ status, amount }) => ({
            name: status,
            value: amount,
          })),
          null,
          2
        )}
      </pre> */}
    </Flex>
  );
}
