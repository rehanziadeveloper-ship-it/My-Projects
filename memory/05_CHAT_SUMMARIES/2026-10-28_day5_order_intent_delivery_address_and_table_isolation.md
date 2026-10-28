# Day 5 - Order Intent Bugfix, Delivery Address Capture & Table Isolation

> Date: 2026-10-28  
> Agent: Antigravity  
> Project: Day 5 - The Heritage Bistro AI Restaurant Operating System  
> Focus: Ordering Intent Handler, Delivery Address Collection, Delivery Rider Dispatch Notification, Strict Table Isolation

---

## 1. Objectives & Scope
1. **Generic Ordering Intent:** Fix false "item out of menu" rejection when customers type generic intent like *"I want to order"*, *"can i order"*, or *"order food"*. Prompt them for the first dish instead.
2. **Delivery Address Prompting:** When fulfillment is set to **Delivery**, immediately ask for their complete delivery address and record it in the order state.
3. **Strict Table Isolation:** Completely isolate Table Numbers and reservation logic to **Dining** orders only. Never ask for or mention table options or numbers during **Pickup** or **Delivery**.
4. **Delivery Rider Notification:** For **Delivery** orders only, notify/alert the delivery rider with the customer's address and flag `deliveryPersonNotified: true`. Exclude driver alerts from Pickup and Dining.
5. **Synchronize & Deploy:** Keep Hostinger n8n workflow (`48dlUbDbToXx0tEw`), local `server.js`, and Netlify `netlify/functions/api.js` strictly synchronized and verified on production.

---

## 2. Key Architectural Decisions & Code Changes
- **n8n Workflow (`48dlUbDbToXx0tEw`):**
  - Updated `Chatbot_State_Engine` node with a generic intent regex intercept:
    `/^(i want to order|i'?d like to order|can i order|order food|let me order|place an order|start order|order)\b/i`.
  - Added state transition `AWAITING_DELIVERY_ADDRESS` specifically for delivery orders.
  - Set `state.tableNumber = 'N/A'` and `state.deliveryAddress = 'N/A'` for Pickup; set `state.deliveryAddress = 'N/A'` for Dining.
  - Added rider notification string and badge (`🛵 Delivery driver notified with your address & assigned for pickup!`) strictly for delivery orders.
- **Local & Production Functions ([`server.js`](file:///d:/AI_ASSISANT/day-05-restaurant-reservation-voicebot/server.js) & [`netlify/functions/api.js`](file:///d:/AI_ASSISANT/day-05-restaurant-reservation-voicebot/netlify/functions/api.js)):**
  - Implemented exact mirrored logic in `runFallbackChatbotEngine` and API handler endpoints.
  - Standardized both `sessionState` and `state` payload property compatibility across requests and responses.
  - Fixed syntax anomaly in `api.js` template literal escaping.
- **Git & Deployment:**
  - Pushed commits `26bbc6f4a656ebf62037396763c112f33aa941cb` and `33e55e408a34284cc3f1043f54677e17887f9fcb` to `rehanziadeveloper-ship-it/My-Projects` (`main`).
  - Deployed to Netlify site `ca4afc8b-5817-4d76-bb65-dc0bcaa86ed0` (`heritage-bistro-ai`), deploy ID `6ae197c170564b3d6ee0fc56` (Status: `ready`).

---

## 3. Verification & Live Results
Automated test scripts (`scratch/test-live-netlify.js` and `scratch/test-clean-summary.js`) executed against `https://heritage-bistro-ai.netlify.app/api/chat`:
- **Generic Intent ("i want to order"):** Returns *"We would love to take your order! Which dish would you like to order today? (You can also ask to see the menu anytime.)"*
- **Delivery Path:** Asks for address, summarizes order with `• Order Type: Delivery`, `• Delivery Address: 450 Park Avenue, Apt 12B, New York`, `• Dispatch Alert: 🛵 Delivery driver notified with your address & assigned for pickup!`. Table Number is completely absent.
- **Pickup Path:** Asks for pickup payment, estimated wait time is 15-20 minutes, counter collection instructions. Zero table prompts, zero rider alerts.
- **Dining Path:** Displays available tables, lets customer select table (e.g., Table 2), checks conflict, confirms reservation. Zero rider alerts.

---

## 4. Next Steps
- Day 5 features and bugfixes are 100% complete, tested, and live.
- Ready for Day 6 or client presentation review.
