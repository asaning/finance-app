package com.waikato.finance.controller;

import com.waikato.finance.model.Budget;
import com.waikato.finance.model.Expense;
import com.waikato.finance.service.FinanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FinanceController {
    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/overview")
    public Map<String, Object> getOverview() {
        return financeService.getOverview();
    }

    @GetMapping("/transactions")
    public List<Expense> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String store,
            @RequestParam(required = false, defaultValue = "date") String sort) {
        return financeService.getTransactions(start, end, store, sort);
    }

    @PostMapping("/transactions")
    public Expense addExpense(@RequestBody Expense expense) {
        return financeService.saveExpense(expense);
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return financeService.updateExpense(id, expense)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        if (financeService.deleteExpense(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/budgets")
    public List<Budget> getBudgets() {
        return financeService.getBudgets();
    }

    @PostMapping("/budgets")
    public Budget addBudget(@RequestBody Budget budget) {
        return financeService.saveBudget(budget);
    }

    @PutMapping("/budgets/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        return financeService.updateBudget(id, budget)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        if (financeService.deleteBudget(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        return financeService.getAnalytics();
    }

    @GetMapping("/stores")
    public List<String> getStores() {
        return financeService.getStores();
    }
}
