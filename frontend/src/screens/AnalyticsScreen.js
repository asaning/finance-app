import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';

const API_BASE = 'http://localhost:8081/api';
const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ amount: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/budgets`),
        fetch(`${API_BASE}/analytics`)
      ]);
      setBudgets(await bRes.json());
      setAnalytics(await aRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const saveBudget = async () => {
    const payload = {
      amount: parseFloat(form.amount) || 0,
      startDate: form.startDate || '2025-09-30',
      endDate: form.endDate || '2025-10-30',
      spent: 0
    };
    try {
      await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setModalVisible(false);
      setForm({ amount: '', startDate: '', endDate: '' });
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Failed to add budget');
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const lineData = analytics?.trend ? {
    labels: analytics.trend.map(t => t.month),
    datasets: [
      { data: analytics.trend.map(t => t.expenses), color: () => '#EF4444', strokeWidth: 2 },
      { data: analytics.trend.map(t => t.budget), color: () => '#22C55E', strokeWidth: 2 }
    ],
    legend: ['Expenses', 'Budget']
  } : { labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], datasets: [{ data: [0] }] };

  const pieData = analytics?.byStore?.map((s, i) => ({
    name: s[0],
    amount: s[1],
    color: ['#3B82F6', '#22C55E', '#F97316', '#EF4444', '#A855F7', '#06B6D4'][i % 6],
    legendFontColor: '#333',
    legendFontSize: 12
  })) || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Expense vs Budget Trend</Text>
        <LineChart
          data={lineData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />

        <Text style={styles.title}>Expense Breakdown</Text>
        <View style={styles.filterRow}>
          <View style={[styles.chip, styles.chipActive]}><Text style={styles.chipTextActive}>Last 6 Months</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Last 3 Months</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Last 1 Month</Text></View>
        </View>

        <Text style={styles.title}>Expenses by Store</Text>
        {pieData.length > 0 && (
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={200}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}

        <View style={styles.listHeader}>
          <Text style={styles.title}>Budget List ({budgets.length})</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Add Budget</Text>
          </TouchableOpacity>
        </View>

        {budgets.map((b) => (
          <View key={b.id} style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetAmount}>${b.amount?.toFixed(2)}</Text>
              <Text style={[styles.status, b.status === 'On Track' ? styles.onTrack : styles.overBudget]}>
                {b.status}
              </Text>
            </View>
            <Text style={styles.budgetPeriod}>
              {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.spent}>${b.spent?.toFixed(2)} spent</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(b.percentageUsed || 0, 100)}%`, backgroundColor: b.status === 'On Track' ? '#3B82F6' : '#EF4444' }]} />
            </View>
            <Text style={styles.progressText}>
              {(b.percentageUsed || 0).toFixed(1)}% used • ${b.remaining?.toFixed(2)} remaining
            </Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Budget</Text>
            <Text style={styles.label}>Budget Period</Text>
            <TextInput style={styles.input} placeholder="Sep 30, 2025 - Oct 30, 2025" value={form.startDate} onChangeText={(t) => setForm({ ...form, startDate: t })} />
            <Text style={styles.label}>Budget Amount</Text>
            <TextInput style={styles.input} placeholder="Enter budget amount (e.g., 500.00)" keyboardType="decimal-pad" value={form.amount} onChangeText={(t) => setForm({ ...form, amount: t })} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveBudget}>
                <Text style={styles.saveText}>Add Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { fontSize: 18, fontWeight: '600', margin: 16, marginBottom: 8 },
  chart: { marginVertical: 8, borderRadius: 12, marginHorizontal: 16 },
  filterRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563EB' },
  chipText: { color: '#475569' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 16 },
  addBtn: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  budgetCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetAmount: { fontSize: 22, fontWeight: 'bold' },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '600' },
  onTrack: { backgroundColor: '#DCFCE7', color: '#166534' },
  overBudget: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  budgetPeriod: { color: '#64748B', marginTop: 4 },
  spent: { marginTop: 4, fontWeight: '500' },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressText: { marginTop: 6, fontSize: 13, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12 },
  modalButtons: { flexDirection: 'row', marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: '#64748B', padding: 14, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  cancelText: { color: '#fff', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
});
