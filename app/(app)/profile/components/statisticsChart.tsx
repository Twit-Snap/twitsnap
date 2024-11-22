import React from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

import { InteractionAmountData } from '@/app/types/statisticType';

const StatisticsChart = ({
  title,
  data,
  chartType
}: {
  title: string;
  data: InteractionAmountData[] | null;
  chartType: 'bar' | 'line';
}) => {
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientTo: '#08130D',
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726'
    }
  };


  if (!data || data.length === 0) {
    return <Text style={styles.chartTitle}>No data</Text>;
  } 
  const labels = data.map((item) => item.date); // Extrae las fechas como etiquetas
  const chartData = data.map((item) => item.amount);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      {chartType === 'bar' ? (
        <BarChart
          data={{
            labels,
            datasets: [{ data: chartData }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel="" // Cambia esto según lo que necesites, por ejemplo "USD ", "kg ", etc.
          yAxisSuffix="" // Puedes dejarlo vacío si no necesitas un sufijo
        />
      ) : (
        <LineChart
          data={{
            labels,
            datasets: [{ data: chartData }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center'
  },
  chartTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10
  },
  chart: {
    borderRadius: 16
  }
});

export default StatisticsChart;
