package com.waikato.finance;

import com.waikato.finance.model.Budget;
import com.waikato.finance.model.Expense;
import com.waikato.finance.model.ExpenseItem;
import com.waikato.finance.repository.BudgetRepository;
import com.waikato.finance.repository.ExpenseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public DataLoader(ExpenseRepository expenseRepository, BudgetRepository budgetRepository) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    @Override
    public void run(String... args) {
        // Sample expenses matching screenshots
        Expense e1 = new Expense("Mithai Hub Indian vegetarian", "Restaurant", 72.85,
                LocalDateTime.of(2025, 9, 28, 19, 30),
                "5 Peachgrove Road, Hamilton East, Hamilton 3216");
        e1.addItem(new ExpenseItem("Paneer Butter Masala", 1, 18.50));
        e1.addItem(new ExpenseItem("Garlic Naan", 2, 4.50));
        e1.addItem(new ExpenseItem("Mango Lassi", 1, 6.00));
        e1.setItemCountLabel("6 items");
        expenseRepository.save(e1);

        Expense e2 = new Expense("The Hillcrest Tavern", "Restaurant", 92.40,
                LocalDateTime.of(2025, 9, 25, 19, 45),
                "247 Clyde Street, Hamilton East, Hamilton 3216");
        e2.setItemCountLabel("6 items");
        expenseRepository.save(e2);

        Expense e3 = new Expense("PAK'nSAVE Mill Street", "Grocery", 87.30,
                LocalDateTime.of(2025, 9, 22, 14, 20),
                "17 Mill Street, Whitiora, Hamilton 3200");
        e3.setItemCountLabel("7 items");
        expenseRepository.save(e3);

        Expense e4 = new Expense("CLYDE STREET SERVICE STATION", "Transportation", 95.20,
                LocalDateTime.of(2025, 9, 21, 16, 45),
                "Cnr Clyde St & 3 Peachgrove Road, Hamilton East, Hamilton 3216");
        expenseRepository.save(e4);

        // Sample budgets matching screenshots
        budgetRepository.save(new Budget(1200.00, LocalDate.of(2025, 9, 1), LocalDate.of(2025, 9, 30), 931.65));
        budgetRepository.save(new Budget(850.00, LocalDate.of(2025, 8, 1), LocalDate.of(2025, 8, 31), 865.75));
        budgetRepository.save(new Budget(900.00, LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 31), 963.20));
        budgetRepository.save(new Budget(1000.00, LocalDate.of(2025, 6, 1), LocalDate.of(2025, 6, 30), 958.40));
        budgetRepository.save(new Budget(900.00, LocalDate.of(2025, 5, 1), LocalDate.of(2025, 5, 31), 933.00));
    }
}
