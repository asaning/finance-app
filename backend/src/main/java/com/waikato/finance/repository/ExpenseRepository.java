package com.waikato.finance.repository;

import com.waikato.finance.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByDateTimeBetweenOrderByDateTimeDesc(LocalDateTime start, LocalDateTime end);
    List<Expense> findByStoreNameContainingIgnoreCase(String storeName);

    @Query("SELECT SUM(e.totalAmount) FROM Expense e")
    Double getTotalExpenses();

    @Query("SELECT e.storeName, SUM(e.totalAmount) FROM Expense e GROUP BY e.storeName")
    List<Object[]> getExpensesByStore();
}
