import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = 'http://localhost:8081/api';

export default function TransactionsScreen() {
  const [expenses, setExpenses] = useState([]);
  const [filterStore, setFilterStore] = useState('All Stores');
  const [stores, setStores] = useState(['All Stores']);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ storeName: '', totalAmount: '', category: 'Restaurant', address: '', items: [] });
  const [newItem, setNewItem] = useState({ name: '', qty: '1', price: '' });

  useEffect(() => {
    fetchExpenses();
    fetchStores();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      setExpenses(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_BASE}/stores`);
      const data = await res.json();
      setStores(['All Stores', ...data]);
    } catch (e) {}
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ storeName: '', totalAmount: '', category: 'Restaurant', address: '', items: [] });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      storeName: item.storeName,
      totalAmount: String(item.totalAmount),
      category: item.category || 'Restaurant',
      address: item.address || '',
      items: item.items || []
    });
    setModalVisible(true);
  };

  const addItem = () => {
    if (!newItem.name || !newItem.price) return;
    setForm({
      ...form,
      items: [...form.items, { name: newItem.name, qty: parseInt(newItem.qty) || 1, price: parseFloat(newItem.price) }]
    });
    setNewItem({ name: '', qty: '1', price: '' });
  };

  const saveExpense = async () => {
    const payload = {
      ...form,
      totalAmount: parseFloat(form.totalAmount) || 0,
      dateTime: new Date().toISOString(),
      itemCountLabel: form.items.length + ' items'
    };
    try {
      const url = editing ? `${API_BASE}/transactions/${editing.id}` : `${API_BASE}/transactions`;
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setModalVisible(false);
      fetchExpenses();
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const deleteExpense = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
          fetchExpenses();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>
      <View style={styles.tabRow}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabTextActive}>Expense</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Budget</Text>
        </View>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Filters</Text>
        <TextInput style={styles.filterInput} value="Aug 30, 2025 - Sep 30, 2025" editable={false} />
        <TextInput style={styles.filterInput} value={filterStore} editable={false} />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Expense List ({expenses.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.txCard}>
            <View style={styles.txHeader}>
              <Text style={styles.txStore}>{item.storeName}</Text>
              <Text style={styles.txAmount}>${item.totalAmount?.toFixed(2)}</Text>
            </View>
            <View style={styles.txMeta}>
              <Text style={styles.txCategory}>{item.category}</Text>
              {item.itemCountLabel && <Text style={styles.txItems}>{item.itemCountLabel}</Text>}
              <Text style={styles.txDate}>{new Date(item.dateTime).toLocaleString()}</Text>
            </View>
            <Text style={styles.txAddress}>📍 {item.address}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}><Text style={styles.actionIcon}>✏️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => deleteExpense(item.id)}><Text style={styles.actionIcon}>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Expense' : 'Add New Expense'}</Text>
            <ScrollView>
              <Text style={styles.label}>Store Name *</Text>
              <TextInput style={styles.input} placeholder="Select a store" value={form.storeName} onChangeText={(t) => setForm({ ...form, storeName: t })} />
              <Text style={styles.label}>Total Amount *</Text>
              <TextInput style={styles.input} placeholder="Enter total amount" keyboardType="decimal-pad" value={form.totalAmount} onChangeText={(t) => setForm({ ...form, totalAmount: t })} />
              <Text style={styles.label}>Category</Text>
              <TextInput style={styles.input} value={form.category} onChangeText={(t) => setForm({ ...form, category: t })} />
              <Text style={styles.label}>Address</Text>
              <TextInput style={styles.input} value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} />
              <Text style={styles.label}>Items (Optional)</Text>
              {form.items.map((it, i) => (
                <Text key={i} style={styles.itemLine}>{it.qty}x {it.name} @ ${it.price}</Text>
              ))}
              <View style={styles.itemRow}>
                <TextInput style={[styles.input, { flex: 2 }]} placeholder="Item name" value={newItem.name} onChangeText={(t) => setNewItem({ ...newItem, name: t })} />
                <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="Qty" keyboardType="number-pad" value={newItem.qty} onChangeText={(t) => setNewItem({ ...newItem, qty: t })} />
                <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="Price" keyboardType="decimal-pad" value={newItem.price} onChangeText={(t) => setNewItem({ ...newItem, price: t })} />
              </View>
              <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveExpense}>
                <Text style={styles.saveText}>{editing ? 'Update' : 'Add Expense'}</Text>
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
  header: { backgroundColor: '#166534', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', margin: 16, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#EF4444' },
  tabText: { color: '#2563EB', fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  filterCard: { backgroundColor: '#fff', marginHorizontal: 16, padding: 16, borderRadius: 12 },
  filterLabel: { fontWeight: '600', marginBottom: 8 },
  filterInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, marginBottom: 8 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 },
  listTitle: { fontSize: 18, fontWeight: '600' },
  addBtn: { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  txCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  txStore: { fontSize: 16, fontWeight: '600' },
  txAmount: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },
  txMeta: { flexDirection: 'row', marginTop: 6, alignItems: 'center', flexWrap: 'wrap' },
  txCategory: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8, fontSize: 12 },
  txItems: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8, fontSize: 12 },
  txDate: { fontSize: 12, color: '#64748B' },
  txAddress: { marginTop: 8, fontSize: 13, color: '#64748B' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  actionIcon: { marginLeft: 16, fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12 },
  itemRow: { flexDirection: 'row', marginTop: 8 },
  itemLine: { fontSize: 14, color: '#475569', marginVertical: 2 },
  addItemBtn: { backgroundColor: '#22C55E', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addItemText: { color: '#fff', fontWeight: '600' },
  modalButtons: { flexDirection: 'row', marginTop: 16 },
  cancelBtn: { flex: 1, backgroundColor: '#64748B', padding: 14, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  cancelText: { color: '#fff', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#EF4444', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
});
