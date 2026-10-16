import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = 'http://localhost:8081/api';

export default function HomeScreen({ navigation }) {
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/overview`),
        fetch(`${API_BASE}/transactions?sort=${sortBy}`)
      ]);
      setOverview(await ovRes.json());
      let txs = await txRes.json();
      setTransactions(txs.slice(0, 10));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !overview) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#166534" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
      </View>
      <ScrollView>
        <View style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Balance</Text>
              <Text style={[styles.overviewValue, { color: '#22C55E' }]}>${overview?.balance?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Budgets</Text>
              <Text style={[styles.overviewValue, { color: '#3B82F6' }]}>${overview?.budgets?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Expenses</Text>
              <Text style={[styles.overviewValue, { color: '#EF4444' }]}>${overview?.expenses?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Top 10 Transactions</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.viewAllText}>View All Transactions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sortRow}>
          <TouchableOpacity style={[styles.sortBtn, sortBy === 'date' && styles.sortBtnActive]} onPress={() => setSortBy('date')}>
            <Text style={sortBy === 'date' ? styles.sortTextActive : styles.sortText}>By Date</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sortBtn, sortBy === 'amount' && styles.sortBtnActive]} onPress={() => setSortBy('amount')}>
            <Text style={sortBy === 'amount' ? styles.sortTextActive : styles.sortText}>By Amount</Text>
          </TouchableOpacity>
        </View>

        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txHeader}>
              <Text style={styles.txStore}>{tx.storeName}</Text>
              <Text style={styles.txAmount}>${tx.totalAmount?.toFixed(2)}</Text>
            </View>
            <View style={styles.txMeta}>
              <Text style={styles.txCategory}>{tx.category}</Text>
              {tx.itemCountLabel && <Text style={styles.txItems}>{tx.itemCountLabel}</Text>}
              <Text style={styles.txDate}>{new Date(tx.dateTime).toLocaleString()}</Text>
            </View>
            <Text style={styles.txAddress}>📍 {tx.address}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#166534', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  overviewCard: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  overviewItem: { alignItems: 'center' },
  overviewLabel: { fontSize: 14, color: '#64748B' },
  overviewValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  transactionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 8 },
  viewAllBtn: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  viewAllText: { color: '#fff', fontWeight: '600' },
  sortRow: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 8 },
  sortBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#E2E8F0' },
  sortBtnActive: { backgroundColor: '#2563EB' },
  sortText: { color: '#475569' },
  sortTextActive: { color: '#fff', fontWeight: '600' },
  txCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, elevation: 1 },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  txStore: { fontSize: 16, fontWeight: '600' },
  txAmount: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },
  txMeta: { flexDirection: 'row', marginTop: 6, alignItems: 'center', flexWrap: 'wrap' },
  txCategory: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8, fontSize: 12 },
  txItems: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8, fontSize: 12 },
  txDate: { fontSize: 12, color: '#64748B' },
  txAddress: { marginTop: 8, fontSize: 13, color: '#64748B' },
});
