package com.waikato.finance.repository;

import com.waikato.finance.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    @Query("SELECT SUM(b.amount) FROM Budget b")
    Double getTotalBudgets();

    List<Budget> findAllByOrderByStartDateDesc();
}
