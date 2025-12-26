import React from "react";
import { Card, VStack, Text } from "@chakra-ui/react";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useThemeColors } from "@/provider/theme-provider";
import { useTransactionHistoryQuery } from "@/hooks/common/use-transaction-history";
import { TransactionHistoryTable } from "./components/transaction-table";

export const HistoryPage: React.FC = () => {
  const { cardColors } = useThemeColors();
  const { data, isLoading, isError, refetch } = useTransactionHistoryQuery();

  return (
    <VStack align="stretch" gap={6} p={{ base: 4, md: 6 }}>
      <Text
        as="h1"
        fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
        fontWeight="medium"
        color={cardColors.text}
      >
        Transaction History
      </Text>

      <Card.Root
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        border="1px solid"
        borderColor={cardColors.border}
        overflow="hidden"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          boxShadow: materialDesign3Theme.elevation.level2,
        }}
      >
        <Card.Body p={0}>
          <TransactionHistoryTable
            data={data?.nodes}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
          />
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};
