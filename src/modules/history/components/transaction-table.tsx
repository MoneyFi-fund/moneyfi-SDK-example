import React from "react";
import {
  Table,
  Box,
  Text,
  Spinner,
  Badge,
  VStack,
  Button,
  HStack,
} from "@chakra-ui/react";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useThemeColors } from "@/provider/theme-provider";
import type { Transaction } from "@/types/transaction";

interface TransactionHistoryTableProps {
  data: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const getActionBadgeColor = (action: string) => {
  switch (action) {
    case "deposit":
      return "green";
    case "withdraw":
      return "red";
    case "rebalance":
      return "blue";
    case "claim":
      return "purple";
    case "distribute":
      return "orange";
    case "transfer_fund":
      return "teal";
    default:
      return "gray";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  data,
  isLoading,
  isError,
  refetch,
}) => {
  const { cardColors } = useThemeColors();

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={8}>
        <Spinner size="lg" color="primary.500" borderWidth="4px" />
        <Text mt={4} color={cardColors.textSecondary}>
          Loading transactions...
        </Text>
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Box p={6}>
        <VStack align="stretch" gap={3}>
          <Text color="error.800" fontWeight="medium">
            Failed to load transactions
          </Text>
          <Button
            onClick={() => refetch()}
            size="sm"
            colorPalette="red"
            variant="outline"
          >
            Retry
          </Button>
        </VStack>
      </Box>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text
          color={cardColors.textSecondary}
          fontSize="md"
          fontWeight="medium"
          mb={2}
        >
          No transactions yet
        </Text>
        <Text color={cardColors.textSecondary} fontSize="sm">
          Your transaction history will appear here
        </Text>
      </Box>
    );
  }

  // Table with data
  return (
    <Table.Root size="sm" variant="outline">
      <Table.Header>
        <Table.Row bg={cardColors.background}>
          <Table.ColumnHeader
            color={cardColors.text}
            fontWeight="semibold"
            fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
          >
            Action
          </Table.ColumnHeader>
          <Table.ColumnHeader
            color={cardColors.text}
            fontWeight="semibold"
            fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
            textAlign="right"
          >
            Value
          </Table.ColumnHeader>
          <Table.ColumnHeader
            color={cardColors.text}
            fontWeight="semibold"
            fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
          >
            Token
          </Table.ColumnHeader>
          <Table.ColumnHeader
            color={cardColors.text}
            fontWeight="semibold"
            fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
            display={{ base: "none", md: "table-cell" }}
          >
            Network
          </Table.ColumnHeader>
          <Table.ColumnHeader
            color={cardColors.text}
            fontWeight="semibold"
            fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
            textAlign="right"
          >
            Time
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((tx) => (
          <Table.Row
            key={tx.id}
            _hover={{
              bg: cardColors.background,
            }}
            transition="background 0.2s"
          >
            <Table.Cell>
              <Badge
                colorPalette={getActionBadgeColor(tx.action)}
                variant="subtle"
                px={2}
                py={1}
                borderRadius="sm"
                textTransform="capitalize"
              >
                {tx.action.replace("_", " ")}
              </Badge>
            </Table.Cell>
            <Table.Cell
              textAlign="right"
              fontWeight="600"
              color={cardColors.text}
              fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            >
              ${tx.value.toFixed(2)}
            </Table.Cell>
            <Table.Cell
              color={cardColors.text}
              fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            >
              {tx.token}
            </Table.Cell>
            <Table.Cell
              color={cardColors.textSecondary}
              fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
              display={{ base: "none", md: "table-cell" }}
            >
              {tx.network}
            </Table.Cell>
            <Table.Cell
              textAlign="right"
              color={cardColors.textSecondary}
              fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
            >
              {formatDate(tx.time)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
