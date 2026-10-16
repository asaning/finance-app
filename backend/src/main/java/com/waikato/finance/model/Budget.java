package com.waikato.finance.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double spent;
    private String status;

    public Budget() {}

    public Budget(Double amount, LocalDate startDate, LocalDate endDate, Double spent) {
        this.amount = amount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.spent = spent;
        updateStatus();
    }

    public void updateStatus() {
        if (spent != null && amount != null) {
            this.status = spent <= amount ? "On Track" : "Over Budget";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Double getSpent() { return spent; }
    public void setSpent(Double spent) { this.spent = spent; updateStatus(); }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getPercentageUsed() {
        if (amount == null || amount == 0) return 0;
        return (spent / amount) * 100;
    }

    public double getRemaining() {
        return amount - spent;
    }
}
