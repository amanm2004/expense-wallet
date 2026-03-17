import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";

import { SignOutButton } from "@/components/SignOutButton";
import { useTransactions } from "../../hooks/useTransactions";
import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "../../components/BalanceCard";
import { TransactionItem } from "../../components/TransactionItem";
import NoTransactionsFound from "../../components/NoTransactionsFound";
import { COLORS } from "../../constants/colors";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { transactions, summary, isLoading, loadData, deleteTransaction } =
    useTransactions(user.id);

  const categories = [
    "all",
    "food & drinks",
    "shopping",
    "transportation",
    "entertainment",
    "bills",
    "other",
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
      ]
    );
  };

  // SAFE FILTER
  const filteredTransactions =
    selectedCategory === "all"
      ? transactions
      : transactions.filter(
          (t) =>
            t.category &&
            t.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>

            <SignOutButton />
          </View>
        </View>

        {/* BALANCE */}
        <BalanceCard summary={summary} />

        {/* CATEGORY FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12,marginBottom:10 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor:
                  selectedCategory === category
                    ? COLORS.primary
                    : COLORS.card,
              }}
            >
              <Text
                style={{
                  color:
                    selectedCategory === category ? "#fff" : COLORS.text,
                  textTransform: "capitalize",
                  fontSize: 13,
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* HEADER */}
        <View style={styles.transactionsHeaderContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
            Recent Transactions
          </Text>

          <TouchableOpacity onPress={() => router.push("/summary")}>
            <Text style={{ color: COLORS.primary, fontWeight: "600", fontSize: 14 }}>
              View Summary →
            </Text>
          </TouchableOpacity>
          
        </View>
      </View>

      {/* LIST */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={filteredTransactions}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}