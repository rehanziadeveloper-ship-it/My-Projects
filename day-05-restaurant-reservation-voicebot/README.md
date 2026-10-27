# 🍽️ The Heritage Bistro — AI Restaurant Operating System

> **A modern, clean, uncluttered AI Restaurant Operating System featuring three distinct portals: Public Customer Portal with an AI order chatbot, a password-protected Kitchen Portal for order fulfillment, and a password-protected Admin Dashboard for real-time financial tracking and expense logging.**

[![Live Local Server](https://img.shields.io/badge/Port-3005-orange?style=for-the-badge&logo=node.js)](http://localhost:3005)
[![Google Sheets Database](https://img.shields.io/badge/Google%20Sheets-Live%20Database-success?style=for-the-badge&logo=googlesheets)](https://docs.google.com/spreadsheets/d/1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo)
[![n8n Workflow](https://img.shields.io/badge/n8n-Active%20Chatbot%20Engine-red?style=for-the-badge&logo=n8n)](https://n8n.srv1767318.hstgr.cloud)

---

## 📌 Three Distinct Portals

### 1. 🌐 Customer Portal (Public Access)
- **Header:** Navigation links (Home, Menu, Contact, and Portal unlocks).
- **Hero Section:** Smooth automated image carousel featuring artisanal dishes (Steak Frites, Truffle Pasta, Bistro Burger, Crème Brûlée).
- **Content Sections:** Curated menu items with descriptions & prices, restaurant hours, and contact details.
- **Text-Based Order Chatbot:**
  - **No Voice:** Strictly text-based conversational interface.
  - **Conversational Simplicity:** Zero annoying upsell spam; direct, natural assistance.
  - **Step-by-Step Flow:** Asks exactly ONE question at a time (Item ➔ Additional items / That's all ➔ Name ➔ Phone ➔ Pickup/Delivery ➔ Confirmation).
  - **Menu Image:** When the user asks for the menu, replies with the high-resolution menu graphic (`bistro-menu.png`).
  - **Strict Validation:** Cross-references all requests against the database. Unlisted items are rejected politely.
  - **Data Routing:** Pushes confirmed orders straight to the Kitchen Portal and logs revenue to the Admin Dashboard.

### 2. 👨‍🍳 Kitchen Portal (Password Protected)
- **Default Password:** `chef123`
- Clean, focused display screen designed for kitchen tablet / desktop operations.
- Real-time queue of incoming orders showing: Order ID, Timestamp, Customer Name, Phone, Items breakdown, and Delivery/Pickup preferences.
- Workflow Progression: `[🍳 Start Cooking]` ➔ `[✅ Mark Ready for Pickup]` ➔ `[📦 Complete Order]`.
- Directly updates the Google Sheets kitchen database and local cache.

### 3. 📊 Admin Dashboard (Password Protected)
- **Default Password:** `admin123`
- Comprehensive business analytics:
  - 💰 **Total Revenue** (Calculated from all fulfilled orders)
  - 📉 **Total Expenses** (Operating costs, vendor invoices, utilities)
  - 📈 **Net Operating Profit** (Revenue minus Expenses)
  - 📦 **Total Orders Count**
  - 🏷️ **Average Order Value (AOV)**
- **Two Tab Views:**
  1. **Order History Table:** Complete breakdown of customer orders, timestamps, totals, and fulfillment status.
  2. **Operating Expenses Log:** Logged restaurant expenses with a quick **"➕ Log New Expense"** modal to record new supplier invoices.

---

## 🗄️ Database Schema (Google Sheets)

Spreadsheet ID: `1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo`

1. **`Restaurant_Menu`**:
   `Item_ID`, `Category`, `Item_Name`, `Description`, `Price`, `Is_Available`
2. **`Restaurant_Kitchen_Orders`**:
   `Order_ID`, `Timestamp`, `Customer_Name`, `Phone`, `Items`, `Special_Instructions`, `Total_Price`, `Status`
3. **`Restaurant_Admin_Financials`**:
   `Record_ID`, `Date`, `Type` (REVENUE/EXPENSE), `Category`, `Description`, `Amount`, `Order_ID`

---

## ⚡ Active n8n Workflow

- **Workflow Name:** `AI Restaurant Chatbot & Order Routing Engine`
- **Workflow ID:** `48dlUbDbToXx0tEw`
- **Production Webhook:** `https://n8n.srv1767318.hstgr.cloud/webhook/restaurant-chatbot`
- **Status:** 🟢 Active & Live

---

## 🚀 Running Locally

```bash
# Start the local server
node server.js
```
Open [`http://localhost:3005`](http://localhost:3005) in any browser.
