package com.waikato.finance.service;

import com.waikato.finance.model.Budget;
import com.waikato.finance.model.Expense;
import com.waikato.finance.repository.BudgetRepository;
import com.waikato.finance.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinanceService {
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public FinanceService(ExpenseRepository expenseRepository, BudgetRepository budgetRepository) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new HashMap<>();
        Double totalExpenses = expenseRepository.getTotalExpenses();
        Double totalBudgets = budgetRepository.getTotalBudgets();
        overview.put("balance", 252.25);
        overview.put("budgets", totalBudgets != null ? totalBudgets : 5350.00);
        overview.put("expenses", totalExpenses != null ? totalExpenses : 5097.75);
        return overview;
    }

    public List<Expense> getTransactions(LocalDateTime start, LocalDateTime end, String store, String sort) {
        List<Expense> results;
        if (store != null && !store.isEmpty() && !store.equals("All Stores")) {
            results = expenseRepository.findByStoreNameContainingIgnoreCase(store);
        } else if (start != null && end != null) {
            results = expenseRepository.findByDateTimeBetweenOrderByDateTimeDesc(start, end);
        } else {
            results = expenseRepository.findAll();
        }

        if ("amount".equalsIgnoreCase(sort)) {
            results.sort((a, b) -> Double.compare(b.getTotalAmount(), a.getTotalAmount()));
        } else {
            results.sort((a, b) -> b.getDateTime().compareTo(a.getDateTime()));
        }
        return results;
    }

    public Expense saveExpense(Expense expense) {
        if (expense.getItems() != null) {
            expense.getItems().forEach(item -> item.setExpense(expense));
            expense.setItemCountLabel(expense.getItems().size() + " items");
        }
        return expenseRepository.save(expense);
    }

    public Optional<Expense> updateExpense(Long id, Expense updated) {
        return expenseRepository.findById(id).map(existing -> {
            existing.setStoreName(updated.getStoreName());
            existing.setCategory(updated.getCategory());
            existing.setTotalAmount(updated.getTotalAmount());
            existing.setDateTime(updated.getDateTime());
            existing.setAddress(updated.getAddress());
            if (updated.getItems() != null) {
                existing.getItems().clear();
                updated.getItems().forEach(existing::addItem);
                existing.setItemCountLabel(updated.getItems().size() + " items");
            }
            return expenseRepository.save(existing);
        });
    }

    public boolean deleteExpense(Long id) {
        if (expenseRepository.existsById(id)) {
            expenseRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Budget> getBudgets() {
        return budgetRepository.findAllByOrderByStartDateDesc();
    }

    public Budget saveBudget(Budget budget) {
        budget.updateStatus();
        return budgetRepository.save(budget);
    }

    public Optional<Budget> updateBudget(Long id, Budget updated) {
        return budgetRepository.findById(id).map(existing -> {
            existing.setAmount(updated.getAmount());
            existing.setStartDate(updated.getStartDate());
            existing.setEndDate(updated.getEndDate());
            existing.setSpent(updated.getSpent());
            return budgetRepository.save(existing);
        });
    }

    public boolean deleteBudget(Long id) {
        if (budgetRepository.existsById(id)) {
            budgetRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("byStore", expenseRepository.getExpensesByStore());
        List<Map<String, Object>> trend = new ArrayList<>();
        String[] months = {"Apr", "May", "Jun", "Jul", "Aug", "Sep"};
        double[] expenses = {450, 920, 980, 960, 820, 930};
        double[] budgets = {480, 880, 1000, 880, 850, 1200};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", months[i]);
            point.put("expenses", expenses[i]);
            point.put("budget", budgets[i]);
            trend.add(point);
        }
        analytics.put("trend", trend);
        return analytics;
    }

    public List<String> getStores() {
        return expenseRepository.findAll().stream()
                .map(Expense::getStoreName)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
