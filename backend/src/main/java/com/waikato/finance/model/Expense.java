package com.waikato.finance.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String storeName;
    private String category;
    private Double totalAmount;
    private LocalDateTime dateTime;
    private String address;
    private String itemCountLabel;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseItem> items = new ArrayList<>();

    public Expense() {}

    public Expense(String storeName, String category, Double totalAmount, LocalDateTime dateTime, String address) {
        this.storeName = storeName;
        this.category = category;
        this.totalAmount = totalAmount;
        this.dateTime = dateTime;
        this.address = address;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getItemCountLabel() { return itemCountLabel; }
    public void setItemCountLabel(String itemCountLabel) { this.itemCountLabel = itemCountLabel; }
    public List<ExpenseItem> getItems() { return items; }
    public void setItems(List<ExpenseItem> items) { this.items = items; }

    public void addItem(ExpenseItem item) {
        items.add(item);
        item.setExpense(this);
    }
}
