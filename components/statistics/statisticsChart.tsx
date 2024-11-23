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
    backgroundGradientFrom: '#121212',  // Gris oscuro, similar a un fondo oscuro de app
    backgroundGradientTo: '#1A1A1A',    // Gris aún más oscuro para el degradado
    color: (opacity = 1) => `rgba(29, 161, 242, ${opacity})`,  // Azul celeste de Twitter
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,  // Blanco para las etiquetas
    style: { borderRadius: 16 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#1DA1F2'  // Azul de Twitter para los bordes de los puntos
    },
    propsForLabels: {
      dy: 3,
      dx: -10,
      fill: 'white',
      fontSize: 10,
      fontWeight: 'bold'
    },
    paddingRight: 30,
    paddingLeft: 30,
    paddingTop: 100,
    paddingBottom: 50
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const labels = data.map((item) => {
    const dateParts = item.date.split('T')[0].split('-');
    return `${dateParts[2]}-${dateParts[1]}`;
  });
  const chartData = data.map((item) => item.amount);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.axisLabelsContainer}>
        {/* Eje Y con nombre fijo */}

        <View style={{ flex: 1 }}>
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
              fromZero
              yAxisInterval={1}
              yAxisSuffix={''}
              yAxisLabel={''}
              withHorizontalLabels={false}
              verticalLabelRotation={270}
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
              fromZero
              yAxisInterval={1}
              //formatXLabel={(value) => (parseInt(value) % 2 === 0 ? value : '')}
              formatYLabel={(value) => parseInt(value).toString()}
              verticalLabelRotation={270}
              style={styles.chart}
            />
          )}
        </View>
      </View>
      <Text style={styles.xAxisLabel}>Date</Text>
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
  },
  noDataText: {
    color: 'gray',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  },
  axisLabelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  yAxisLabel: {
    color: 'white',
    fontSize: 14,
    marginRight: 0,
    writingDirection: 'rtl',
    transform: [{ rotate: '-90deg' }]
  },
  xAxisLabel: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center'
  }
});

export default StatisticsChart;
