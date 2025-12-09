import { Box, Card, VStack, HStack, Text } from "@chakra-ui/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import type { ChartDataItem } from "@/types/asset-allocation";

interface AllocationChartCardProps {
  title: string;
  data: ChartDataItem[];
  totalLabel?: string;
  countLabel?: string;
  emptyMessage?: string;
}

export function AllocationChartCard({
  title,
  data,
  totalLabel = "Total",
  countLabel = "Items",
  emptyMessage = "No data available",
}: AllocationChartCardProps) {
  const { cardColors } = useThemeColors();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const isEmpty = data.length === 0 || total === 0;

  const formatBalance = (value: number) =>
    value < 0.01 ? `$${value.toFixed(4)}` : `$${value.toFixed(2)}`;

  return (
    <Card.Root
      bg={cardColors.background}
      border="1px solid"
      borderColor={cardColors.border}
      borderRadius={materialDesign3Theme.borderRadius.md}
      boxShadow={materialDesign3Theme.elevation.level1}
      height="100%"
    >
      <Card.Header pb={2}>
        <Text fontSize="md" fontWeight="semibold" color={cardColors.text}>
          {title}
        </Text>
        <Text fontSize="xs" color={cardColors.textSecondary}>
          {totalLabel}: {formatBalance(total)} • {countLabel}: {data.length}
        </Text>
      </Card.Header>
      <Card.Body pt={0}>
        {isEmpty ? (
          <VStack py={8}>
            <Text color={cardColors.textSecondary} fontSize="sm">
              {emptyMessage}
            </Text>
          </VStack>
        ) : (
          <VStack gap={3} align="stretch">
            {/* Doughnut Chart */}
            <Box height="140px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatBalance(value)}
                    contentStyle={{
                      backgroundColor: cardColors.background,
                      border: `1px solid ${cardColors.border}`,
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            {/* Legend */}
            <VStack gap={1} align="stretch">
              {data.map((item, idx) => (
                <HStack key={idx} justify="space-between" fontSize="xs">
                  <HStack gap={2}>
                    <Box
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={item.color}
                    />
                    <Text color={cardColors.text} noOfLines={1} maxW="120px">
                      {item.name}
                    </Text>
                  </HStack>
                  <Text color={cardColors.textSecondary} fontFamily="mono">
                    {formatBalance(item.value)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
}
