import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { API_URL } from "../../constants/api";


const screenWidth = Dimensions.get("window").width;

const CATEGORY_ICONS = {
  "food & drinks": "fast-food-outline",
  shopping: "cart-outline",
  transportation: "car-outline",
  entertainment: "film-outline",
  bills: "receipt-outline",
  income: "cash-outline",
  other: "ellipsis-horizontal-outline",
};

export default function SummaryPage() {
  const { user } = useUser();
  const router = useRouter();
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setData(null);

    fetch(`${API_URL}/transactions/${user.id}/summary/${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period, user?.id]);

  const net = data ? Number(data.income) + Number(data.expenses) : 0;

 

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Summary</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Toggle */}
      <View style={s.toggleWrapper}>
        <View style={s.toggleRow}>
          {["weekly", "monthly"].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[s.toggleBtn, period === p && s.toggleBtnActive]}
            >
              <Text style={[s.toggleText, period === p && s.toggleTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={{ marginTop: 48 }}
        />
      )}

      {data && !loading && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {/* Income / Expense */}
          <View style={s.cardsRow}>
            <View style={[s.card, s.incomeCard]}>
              <Ionicons
                name="arrow-up-circle-outline"
                size={24}
                color={COLORS.income}
              />
              <Text style={s.cardLabel}>Income</Text>
              <Text style={[s.cardAmount, { color: COLORS.income }]}>
                +₹{Number(data.income).toFixed(2)}
              </Text>
            </View>

            <View style={[s.card, s.expenseCard]}>
              <Ionicons
                name="arrow-down-circle-outline"
                size={24}
                color={COLORS.expense}
              />
              <Text style={s.cardLabel}>Expenses</Text>
              <Text style={[s.cardAmount, { color: COLORS.expense }]}>
                -₹{Math.abs(Number(data.expenses)).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Net Balance */}
          <View style={s.netCard}>
            <View>
              <Text style={s.netLabel}>Net Balance</Text>
              <Text style={s.netSub}>
                {period === "weekly" ? "Last 7 days" : "This month"}
              </Text>
            </View>
            <Text
              style={[
                s.netAmount,
                { color: net >= 0 ? COLORS.income : COLORS.expense },
              ]}
            >
              {net >= 0 ? "+" : ""}₹{net.toFixed(2)}
            </Text>
          </View>

        

          {/* Category Breakdown */}
          <Text style={s.sectionTitle}>By Category</Text>

          {data.byCategory.length === 0 ? (
            <View style={s.emptyBox}>
              <Ionicons
                name="receipt-outline"
                size={36}
                color={COLORS.border}
              />
              <Text style={s.emptyText}>No transactions found</Text>
            </View>
          ) : (
            data.byCategory.map(({ category, total }) => {
              const isNeg = Number(total) < 0;
              const totalAbs = data.byCategory.reduce(
                (sum, c) => sum + Math.abs(Number(c.total)),
                0
              );
              const barWidth =
                totalAbs > 0
                  ? (Math.abs(Number(total)) / totalAbs) * 100
                  : 0;

              return (
                <View key={category} style={s.categoryRow}>
                  <View style={s.categoryIconBox}>
                    <Ionicons
                      name={
                        CATEGORY_ICONS[category?.toLowerCase()] ||
                        "ellipsis-horizontal-outline"
                      }
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={s.categoryInfo}>
                    <View style={s.categoryTopRow}>
                      <Text style={s.categoryName}>{category}</Text>

                      <Text
                        style={[
                          s.categoryAmount,
                          {
                            color: isNeg
                              ? COLORS.expense
                              : COLORS.income,
                          },
                        ]}
                      >
                        {isNeg ? "-" : "+"}₹
                        {Math.abs(Number(total)).toFixed(2)}
                      </Text>
                    </View>

                    <View style={s.barBg}>
                      <View
                        style={[
                          s.barFill,
                          {
                            width: `${barWidth}%`,
                            backgroundColor: isNeg
                              ? COLORS.expense
                              : COLORS.income,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },

  toggleWrapper: { paddingHorizontal: 16, marginBottom: 4 },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: COLORS.border,
    borderRadius: 24,
    padding: 4,
  },

  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: "center" },

  toggleBtnActive: { backgroundColor: COLORS.primary },

  toggleText: { fontWeight: "600", color: COLORS.primary },

  toggleTextActive: { color: COLORS.white },

  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  cardsRow: { flexDirection: "row", gap: 12 },

  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },

  incomeCard: { backgroundColor: COLORS.card, borderLeftWidth: 4, borderLeftColor: COLORS.income },

  expenseCard: { backgroundColor: COLORS.card, borderLeftWidth: 4, borderLeftColor: COLORS.expense },

  cardLabel: { fontSize: 12, color: COLORS.textLight },

  cardAmount: { fontSize: 18, fontWeight: "700" },

  netCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  netLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text },

  netSub: { fontSize: 12, color: COLORS.textLight },

  netAmount: { fontSize: 22, fontWeight: "800" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 4 },

  emptyBox: { alignItems: "center", paddingVertical: 32, gap: 8 },

  emptyText: { color: COLORS.textLight },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 16,
  },

  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryInfo: { flex: 1, gap: 6 },

  categoryTopRow: { flexDirection: "row", justifyContent: "space-between" },

  categoryName: { fontSize: 14, color: COLORS.text },

  categoryAmount: { fontSize: 14, fontWeight: "700" },

  barBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 4 },

  barFill: { height: 4, borderRadius: 4 },
});