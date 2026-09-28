# Eagles Resort — Central Warehouse Database Diagram & ERD Specification

This document provides visual diagrams, DBML definitions, and relational mapping for the **Eagles Resort Central Warehouse Management System**, reflecting its **Ledger-First Architecture** and MySQL 8.x schema.

---

DBML (Database Markup Language) for dbdiagram.io

To generate an interactive schema diagram on [dbdiagram.io](https://dbdiagram.io), copy and paste the following snippet:

```dbml
// ==========================================
// EAGLES RESORT - CENTRAL WAREHOUSE SCHEMA
// ==========================================

Table users {
  default laravel user
}

Table warehouses {
  id bigint [pk, increment]
  name varchar(255) [not null]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp
}

Table sectors {
  id bigint [pk, increment]
  name varchar(255) [not null]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp

  indexes {
    is_active
  }
}

Table employees {
  id bigint [pk, increment]
  name varchar(255) [not null]
  department varchar(100)
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp
}

Table item_categories {
  id bigint [pk, increment]
  name varchar(255) [not null]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp

  indexes {
    is_active
  }
}

Table units {
  id bigint [pk, increment]
  name varchar(50) [not null]
  symbol varchar(20) [not null]
  created_at timestamp
  updated_at timestamp
}

Table items {
  id bigint [pk, increment]
  name varchar(255) [not null]
  category_id bigint [not null]
  unit_id bigint [not null]
  description text
  minimum_stock decimal(12, 3) [default: 0]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp

  indexes {
    category_id
    is_active
  }
}

Table suppliers {
  id bigint [pk, increment]
  name varchar(255) [not null]
  phone varchar(50)
  notes text
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp
}

// ------------------------------------------
// PURCHASE WORKFLOW
// ------------------------------------------

Table purchase_invoices {
  id bigint [pk, increment]
  supplier_id bigint [not null]
  warehouse_id bigint [not null]
  invoice_date date [not null]
  received_at timestamp [null]
  subtotal decimal(14, 2) [default: 0]
  discount decimal(14, 2) [default: 0]
  total decimal(14, 2) [default: 0]
  status varchar(30) [not null, default: 'DRAFT', note: 'DRAFT, CLOSED, CANCELLED']
  notes text
  created_by bigint [not null]
  approved_by bigint [null]
  approved_at timestamp [null]
  created_at timestamp
  updated_at timestamp

  indexes {
    (supplier_id, invoice_date)
    invoice_date
    status
  }
}

Table purchase_invoice_items {
  id bigint [pk, increment]
  purchase_invoice_id bigint [not null]
  item_id bigint [not null]
  quantity decimal(12, 3) [not null]
  unit_price decimal(14, 2) [not null]
  total decimal(14, 2) [not null]
  created_at timestamp
  updated_at timestamp
}

// ------------------------------------------
// DISPATCH / ISSUE WORKFLOW
// ------------------------------------------

Table dispatch_vouchers {
  id bigint [pk, increment]
  warehouse_id bigint [not null]
  sector_id bigint [not null]
  recipient_employee_id bigint [null]
  recipient_name_snapshot varchar(255) [not null]
  issued_by bigint [not null, note: 'Warehouse user who issued the stock']
  issue_date date [not null]
  notes text
  status varchar(30) [not null, default: 'DRAFT', note: 'DRAFT, CLOSED, CANCELLED']
  created_by bigint [not null]
  approved_by bigint [null]
  approved_at timestamp [null]
  created_at timestamp
  updated_at timestamp

  indexes {
    (sector_id, issue_date)
    issue_date
    status
  }
}

Table dispatch_voucher_items {
  id bigint [pk, increment]
  dispatch_voucher_id bigint [not null]
  item_id bigint [not null]
  quantity decimal(12, 3) [not null]
  created_at timestamp
  updated_at timestamp
}

// ------------------------------------------
// WASTE / SCRAP WORKFLOW
// ------------------------------------------

Table waste_reports {
  id bigint [pk, increment]
  warehouse_id bigint [not null]
  reason varchar(50) [not null, note: 'EXPIRED, DAMAGED, BROKEN, LOST, SPOILED, OTHER']
  description text
  status varchar(30) [not null, default: 'DRAFT', note: 'DRAFT, CLOSED, CANCELLED']
  created_by bigint [not null]
  approved_by bigint [null]
  approved_at timestamp [null]
  created_at timestamp
  updated_at timestamp
}

Table waste_report_items {
  id bigint [pk, increment]
  waste_report_id bigint [not null]
  item_id bigint [not null]
  quantity decimal(12, 3) [not null]
  notes text
  created_at timestamp
  updated_at timestamp
}

// ------------------------------------------
// PHYSICAL COUNT & STOCK ADJUSTMENTS
// ------------------------------------------

Table stock_adjustments {
  id bigint [pk, increment]
  warehouse_id bigint [not null]
  adjustment_date date [not null]
  reason varchar(100) [not null]
  description text
  status varchar(30) [not null, default: 'DRAFT', note: 'DRAFT, CLOSED, CANCELLED']
  created_by bigint [not null]
  approved_by bigint [null]
  approved_at timestamp [null]
  created_at timestamp
  updated_at timestamp

  indexes {
    adjustment_date
    status
  }
}

Table stock_adjustment_items {
  id bigint [pk, increment]
  stock_adjustment_id bigint [not null]
  item_id bigint [not null]
  system_quantity decimal(12, 3) [not null]
  physical_quantity decimal(12, 3) [not null]
  difference decimal(12, 3) [not null]
  notes text
  created_at timestamp
  updated_at timestamp
}

// ------------------------------------------
// INVENTORY STATE & LEDGER
// ------------------------------------------

Table stock_balances {
  id bigint [pk, increment]
  warehouse_id bigint [not null]
  item_id bigint [not null]
  quantity decimal(12, 3) [not null, default: 0]
  updated_at timestamp

  indexes {
    (warehouse_id, item_id) [unique]
  }
}

Table stock_movements {
  id bigint [pk, increment]
  warehouse_id bigint [not null]
  item_id bigint [not null]
  movement_type varchar(50) [not null, note: 'PURCHASE_IN, DISPATCH_OUT, WASTE_OUT, ADJUSTMENT_IN, ADJUSTMENT_OUT']
  quantity decimal(12, 3) [not null, note: 'Signed value (+ for in, - for out)']
  balance_after decimal(12, 3) [not null]
  reference_type varchar(100) [not null]
  reference_id bigint [not null]
  movement_date timestamp [not null]
  created_by bigint [not null]
  created_at timestamp

  indexes {
    (item_id, created_at)
    (warehouse_id, item_id, created_at)
    (movement_type, created_at)
    (reference_type, reference_id)
  }
}

// ------------------------------------------
// SYSTEM AUDIT LOGS
// ------------------------------------------

Table audit_logs {
  id bigint [pk, increment]
  user_id bigint [null]
  action varchar(50) [not null, note: 'CREATE, CLOSE, APPROVE, CANCEL, PRINT, REVERSE']
  auditable_type varchar(100) [not null]
  auditable_id bigint [not null]
  old_values json [null]
  new_values json [null]
  ip_address varchar(45) [null]
  user_agent text [null]
  created_at timestamp

  indexes {
    (auditable_type, auditable_id)
    user_id
    created_at
  }
}

// ==========================================
// RELATIONSHIPS & FOREIGN KEYS
// ==========================================

// Hierarchical references

// Master catalog references
Ref: items.category_id > item_categories.id
Ref: items.unit_id > units.id

// Purchase cycle
Ref: purchase_invoices.supplier_id > suppliers.id
Ref: purchase_invoices.warehouse_id > warehouses.id
Ref: purchase_invoices.created_by > users.id
Ref: purchase_invoices.approved_by > users.id
Ref: purchase_invoice_items.purchase_invoice_id > purchase_invoices.id [delete: cascade]
Ref: purchase_invoice_items.item_id > items.id

// Dispatch cycle
Ref: dispatch_vouchers.warehouse_id > warehouses.id
Ref: dispatch_vouchers.sector_id > sectors.id
Ref: dispatch_vouchers.recipient_employee_id > employees.id [delete: set null]
Ref: dispatch_vouchers.issued_by > users.id
Ref: dispatch_vouchers.created_by > users.id
Ref: dispatch_vouchers.approved_by > users.id
Ref: dispatch_voucher_items.dispatch_voucher_id > dispatch_vouchers.id [delete: cascade]
Ref: dispatch_voucher_items.item_id > items.id

// Waste cycle
Ref: waste_reports.warehouse_id > warehouses.id
Ref: waste_reports.created_by > users.id
Ref: waste_reports.approved_by > users.id
Ref: waste_report_items.waste_report_id > waste_reports.id [delete: cascade]
Ref: waste_report_items.item_id > items.id

// Stock adjustment cycle
Ref: stock_adjustments.warehouse_id > warehouses.id
Ref: stock_adjustments.created_by > users.id
Ref: stock_adjustments.approved_by > users.id
Ref: stock_adjustment_items.stock_adjustment_id > stock_adjustments.id [delete: cascade]
Ref: stock_adjustment_items.item_id > items.id

// Current stock balance
Ref: stock_balances.warehouse_id > warehouses.id
Ref: stock_balances.item_id > items.id

// Stock movement ledger
Ref: stock_movements.warehouse_id > warehouses.id
Ref: stock_movements.item_id > items.id
Ref: stock_movements.created_by > users.id

// Audit logs
Ref: audit_logs.user_id > users.id [delete: set null]
```

---

## 3. Structural Breakdown by Architectural Subsystem

### 3.1 Master Catalog Subsystem

Contains reference data that remains relatively stable and defines resort entities and consumable items.

- **`warehouses`**: Multi-warehouse root (Central, Maintenance, Hotel).
- **`sectors`**: Tree structure (`parent_id`) classifying consumption entities (e.g., Villas $\rightarrow$ Villa 101; Hotels $\rightarrow$ Hotel A).
- **`employees`**: Physical consumers who receive materials on site (independent from system users).
- **`item_categories`**: Hierarchical category tree.
- **`units`**: Measurement units specifying fractional precision ($0$ for discrete pieces, $3$ for metric decimals like kg/L).
- **`items`**: Catalog definitions with min/max thresholds for automated low-stock warnings.
- **`suppliers`**: Commercial vendor profiles.

### 3.2 Inventory Operational Workflows

All business transactions start as `DRAFT` documents with line items, undergo business validation, and transition to `POSTED` inside an ACID database transaction.

```
+----------------------------------------------------------------------------------------------------+
|                                    BUSINESS TRANSACTIONS (HEADERS)                                  |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+  |
|  | purchase_invoices  |   | dispatch_vouchers  |   |   waste_reports    |   | stock_adjustments  |  |
|  +---------+----------+   +---------+----------+   +---------+----------+   +---------+----------+  |
+------------|------------------------|------------------------|------------------------|-------------+
             |                        |                        |                        |
             v                        v                        v                        v
+----------------------------------------------------------------------------------------------------+
|                                     LINE ITEMS (QUANTITIES & VALUES)                                |
|  +--------------------+   +--------------------+   +--------------------+   +--------------------+  |
|  | purchase_inv_items |   |  dispatch_items    |   |    waste_items     |   |  adjustment_items  |  |
|  +---------+----------+   +---------+----------+   +---------+----------+   +---------+----------+  |
+------------|------------------------|------------------------|------------------------|-------------+
             |                        |                        |                        |
             +--------------------+   |   +--------------------+------------------------+
                                  |   |   |
                                  v   v   v
+----------------------------------------------------------------------------------------------------+
|                                       POSTING TRANSACTION ENGINE                                   |
|                          • Lock stock_balances row (`lockForUpdate()`)                             |
|                          • Validate positive balance / threshold                                   |
|                          • Write signed quantity to stock_movements                                |
|                          • Project updated balance to stock_balances                               |
|                          • Mark business document as POSTED (Immutable)                            |
+----------------------------------------------------------------------------------------------------+
```

### 3.3 The Ledger Engine & State Projection

- **`stock_movements` (Immutable Source of Truth):**
    - Uses signed quantities ($> 0$ for ingress, $< 0$ for egress).
    - Maintains `balance_after` for instant historical validation and single-row ledger card generation.
    - Polymorphic reference columns `(reference_type, reference_id)` point directly back to the posting voucher/invoice/report.
- **`stock_balances` (Materialized Read-Optimized State):**
    - Maintains composite unique index on `(warehouse_id, item_id)`.
    - Targeted by `SELECT ... FOR UPDATE` row locks to prevent race conditions and negative inventory during concurrent dispatches.
