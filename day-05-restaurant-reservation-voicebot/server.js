const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;
const KEY_PATH = path.join(__dirname, '..', 'valiant-epsilon-501913-g2-8231aeffe623.json');
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const N8N_CHATBOT_WEBHOOK = 'https://n8n.srv1767318.hstgr.cloud/webhook/restaurant-chatbot';

// Default Passwords
const PASSWORDS = {
  kitchen: 'chef123',
  admin: 'admin123'
};

// Load Google Service Account
let serviceAccount = null;
try {
  serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  console.log(`[Google Auth] Loaded service account: ${serviceAccount.client_email}`);
} catch (e) {
  console.error('[Google Auth] Notice:', e.message);
}

// Google OAuth Access Token Cache
let cachedToken = null;
let tokenExpiry = 0;

async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

  const exp = now + 3600;
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp, iat: now
  };

  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const sigIn = `${b64(header)}.${b64(claim)}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(sigIn);
  const sig = signer.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${sigIn}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await res.json();
  if (data.access_token) {
    cachedToken = data.access_token;
    tokenExpiry = exp;
    return cachedToken;
  }
  throw new Error(`Google token error: ${JSON.stringify(data)}`);
}

// Google Sheets Helper Functions
async function readSheetValues(tabName) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(tabName)}?valueRenderOption=UNFORMATTED_VALUE`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.error(`Read error (${tabName}):`, err.message);
    return [];
  }
}

async function appendSheetRow(tabName, rowData) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(tabName + '!A1')}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [rowData] })
    });
    return await res.json();
  } catch (err) {
    console.error(`Append error (${tabName}):`, err.message);
  }
}

async function updateSheetRange(range, values) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values })
    });
    return await res.json();
  } catch (err) {
    console.error(`Update error (${range}):`, err.message);
  }
}

// In-Memory Fallback State (Synced with Sheets)
let memoryOrders = [
  {
    orderId: 'ORD-1001',
    timestamp: '2026-10-27 12:30:00',
    customerName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    items: '1x Bistro Steak Frites ($22), 1x Classic Creme Brulee ($9)',
    specialInstructions: 'Steak cooked medium-rare please',
    totalPrice: 31.00,
    status: 'COOKING'
  },
  {
    orderId: 'ORD-1002',
    timestamp: '2026-10-27 12:45:00',
    customerName: 'Michael Chang',
    phone: '+1 (555) 876-5432',
    items: '2x Classic Bistro Burger ($30), 1x Fresh Mint Lemonade ($5)',
    specialInstructions: 'Extra pickles on one burger',
    totalPrice: 35.00,
    status: 'PENDING'
  }
];

let memoryFinancials = [
  { recordId: 'FIN-001', date: '2026-10-27', type: 'REVENUE', category: 'Food Sales', description: 'Order ORD-1001 (Sarah Jenkins)', amount: 31.00, orderId: 'ORD-1001' },
  { recordId: 'FIN-002', date: '2026-10-27', type: 'REVENUE', category: 'Food Sales', description: 'Order ORD-1002 (Michael Chang)', amount: 35.00, orderId: 'ORD-1002' },
  { recordId: 'FIN-003', date: '2026-10-27', type: 'EXPENSE', category: 'Inventory', description: 'Daily fresh beef & seafood delivery (US Foods)', amount: -125.00, orderId: 'N/A' },
  { recordId: 'FIN-004', date: '2026-10-27', type: 'EXPENSE', category: 'Utilities', description: 'Kitchen gas & electricity daily allocation', amount: -45.00, orderId: 'N/A' },
  { recordId: 'FIN-005', date: '2026-10-27', type: 'EXPENSE', category: 'Packaging', description: 'Biodegradable takeout boxes & cutlery', amount: -30.00, orderId: 'N/A' }
];

const MENU = [
  { id: 'APP-01', category: 'Appetizers', name: 'French Onion Soup', desc: 'Caramelized onions, beef broth, toasted baguette, melted Gruyere', price: 9.00 },
  { id: 'APP-02', category: 'Appetizers', name: 'Baked Gulf Oysters', desc: 'Garlic, shallots, creamy spinach, buttered herb breadcrumbs', price: 13.00 },
  { id: 'APP-03', category: 'Appetizers', name: 'Crispy Fried Green Tomatoes', desc: 'Pickled okra, peach-jalapeno relish, remoulade', price: 7.00 },
  { id: 'APP-04', category: 'Appetizers', name: 'Classic Caesar Salad', desc: 'Crisp romaine, shaved parmesan, house croutons, creamy caesar', price: 11.00 },
  { id: 'APP-05', category: 'Appetizers', name: 'Bistro Spinach & Artichoke Dip', desc: 'Warm blend of artisan cheeses, roasted garlic, tortilla chips', price: 8.00 },
  { id: 'ENT-01', category: 'Entrees', name: 'Bistro Steak Frites', desc: 'Pan-seared flank steak, herb garlic butter, shoestring fries, arugula', price: 22.00 },
  { id: 'ENT-02', category: 'Entrees', name: 'Shrimp & Grits', desc: 'Sauteed shrimp, tomatoes, cheddar grits, white wine reduction', price: 19.00 },
  { id: 'ENT-03', category: 'Entrees', name: 'Hand-Made Truffle Pasta', desc: 'Fresh fettuccine, black truffle oil, garlic, shaved Parmesan', price: 17.00 },
  { id: 'ENT-04', category: 'Entrees', name: 'Classic Bistro Burger', desc: 'Ground chuck patty, brioche bun, white cheddar, house pickles, fries', price: 15.00 },
  { id: 'ENT-05', category: 'Entrees', name: 'Grilled Catch of the Day', desc: 'Wild sustainable fish, steamed new potatoes, seasonal vegetables', price: 21.00 },
  { id: 'DES-01', category: 'Desserts', name: 'Caramelized Banana Cheesecake', desc: 'NY-style cheesecake with warm caramelized bananas & cream', price: 10.00 },
  { id: 'DES-02', category: 'Desserts', name: 'Traditional Apple Cobbler', desc: 'Heirloom apples, warm cinnamon crumble, vanilla bean ice cream', price: 9.00 },
  { id: 'DES-03', category: 'Desserts', name: 'Dark Chocolate Brownie Sundae', desc: 'Warm fudge brownie, walnuts, vanilla ice cream, chocolate drizzle', price: 8.00 },
  { id: 'DES-04', category: 'Desserts', name: 'Classic Creme Brulee', desc: 'Vanilla bean custard with crisp torched sugar crust', price: 9.00 },
  { id: 'BEV-01', category: 'Beverages', name: 'Fresh Mint Lemonade', desc: 'Fresh squeezed lemons, garden mint, cane sugar water', price: 5.00 },
  { id: 'BEV-02', category: 'Beverages', name: 'Italian Sparkling Water', desc: 'San Pellegrino chilled sparkling mineral water (750ml)', price: 4.00 },
  { id: 'BEV-03', category: 'Beverages', name: 'House Roasted Iced Coffee', desc: 'Cold-brewed artisanal espresso with Madagascar vanilla cream', price: 4.50 }
];

// Helper: Push confirmed order to Kitchen & Admin database
async function routeConfirmedOrder(order) {
  // 1. Kitchen Portal Memory
  memoryOrders.unshift({
    orderId: order.orderId,
    timestamp: new Date().toLocaleString(),
    customerName: order.customerName,
    phone: order.phone,
    items: order.itemSummary,
    specialInstructions: order.deliveryType || 'Standard Dine-In/Pickup',
    totalPrice: parseFloat(order.totalPrice),
    status: 'PENDING'
  });

  // 2. Admin Financials Memory
  memoryFinancials.unshift({
    recordId: `FIN-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    type: 'REVENUE',
    category: 'Food Sales',
    description: `Order ${order.orderId} (${order.customerName})`,
    amount: parseFloat(order.totalPrice),
    orderId: order.orderId
  });

  // 3. Google Sheets Kitchen Orders
  await appendSheetRow('Restaurant_Kitchen_Orders', [
    order.orderId,
    new Date().toLocaleString(),
    order.customerName,
    order.phone,
    order.itemSummary,
    order.deliveryType || 'Pickup',
    parseFloat(order.totalPrice),
    'PENDING'
  ]);

  // 4. Google Sheets Admin Financials
  await appendSheetRow('Restaurant_Admin_Financials', [
    `FIN-${Date.now().toString().slice(-4)}`,
    new Date().toISOString().split('T')[0],
    'REVENUE',
    'Food Sales',
    `Order ${order.orderId} (${order.customerName})`,
    parseFloat(order.totalPrice),
    order.orderId
  ]);
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse Body Helper
  const getBody = () => new Promise(resolve => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
  });

  // ==========================================
  // 1. CHATBOT WEBHOOK ROUTING (n8n & Dual-Write)
  // ==========================================
  if (req.url === '/api/chat' && req.method === 'POST') {
    const payload = await getBody();
    let n8nResponse = null;

    try {
      const n8nRes = await fetch(N8N_CHATBOT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (n8nRes.ok) {
        n8nResponse = await n8nRes.json();
      }
    } catch (err) {
      console.warn('[n8n Webhook] Notice:', err.message);
    }

    // Fallback if n8n is processing or down
    if (!n8nResponse || !n8nResponse.reply) {
      const msg = (payload.message || '').trim().toLowerCase();
      let state = payload.sessionState || { step: 'START', items: [], name: '', phone: '' };

      if (/menu|dishes|options|what do you have/i.test(msg)) {
        n8nResponse = {
          reply: "Here is our menu. What would you like to order today?",
          menuImage: "/images/bistro-menu.png",
          sessionState: state
        };
      } else {
        n8nResponse = {
          reply: "Hello! What would you like to order today?",
          sessionState: state
        };
      }
    }

    // Strict Rule 6: If an order was confirmed by chatbot, route to Kitchen & Admin DB
    if (n8nResponse.order && n8nResponse.order.orderId) {
      await routeConfirmedOrder(n8nResponse.order);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(n8nResponse));
    return;
  }

  // ==========================================
  // 2. KITCHEN PORTAL ENDPOINTS
  // ==========================================
  if (req.url === '/api/kitchen/orders' && req.method === 'GET') {
    // Try to read live from Sheets
    const rows = await readSheetValues('Restaurant_Kitchen_Orders');
    if (rows && rows.length > 1) {
      const orders = rows.slice(1).map(r => ({
        orderId: r[0],
        timestamp: r[1],
        customerName: r[2],
        phone: r[3],
        items: r[4],
        specialInstructions: r[5],
        totalPrice: parseFloat(r[6] || 0),
        status: r[7] || 'PENDING'
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, orders }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, orders: memoryOrders }));
    return;
  }

  if (req.url === '/api/kitchen/status' && req.method === 'POST') {
    const { orderId, newStatus } = await getBody();
    
    // Update memory
    const ord = memoryOrders.find(o => o.orderId === orderId);
    if (ord) ord.status = newStatus;

    // Update in Google Sheets
    const rows = await readSheetValues('Restaurant_Kitchen_Orders');
    if (rows && rows.length > 1) {
      const rowIndex = rows.findIndex((r, idx) => idx > 0 && r[0] === orderId);
      if (rowIndex !== -1) {
        await updateSheetRange(`Restaurant_Kitchen_Orders!H${rowIndex + 1}`, [[newStatus]]);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, orderId, newStatus }));
    return;
  }

  // ==========================================
  // 3. ADMIN PORTAL ENDPOINTS
  // ==========================================
  if (req.url === '/api/admin/financials' && req.method === 'GET') {
    let records = memoryFinancials;
    const rows = await readSheetValues('Restaurant_Admin_Financials');
    if (rows && rows.length > 1) {
      records = rows.slice(1).map(r => ({
        recordId: r[0],
        date: r[1],
        type: r[2],
        category: r[3],
        description: r[4],
        amount: parseFloat(r[5] || 0),
        orderId: r[6]
      }));
    }

    const totalRevenue = records.filter(r => r.type === 'REVENUE').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = Math.abs(records.filter(r => r.type === 'EXPENSE').reduce((sum, r) => sum + r.amount, 0));
    const netProfit = totalRevenue - totalExpenses;
    const orderCount = records.filter(r => r.type === 'REVENUE').length;
    const avgCheck = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : '0.00';

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      metrics: {
        totalRevenue: totalRevenue.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netProfit: netProfit.toFixed(2),
        orderCount,
        avgCheck
      },
      records
    }));
    return;
  }

  if (req.url === '/api/admin/expenses' && req.method === 'POST') {
    const { category, description, amount } = await getBody();
    const cost = Math.abs(parseFloat(amount) || 0) * -1;
    const recordId = `FIN-${Date.now().toString().slice(-4)}`;
    const date = new Date().toISOString().split('T')[0];

    const newExpense = {
      recordId,
      date,
      type: 'EXPENSE',
      category: category || 'Operating Expense',
      description: description || 'Restaurant Expense',
      amount: cost,
      orderId: 'N/A'
    };

    memoryFinancials.unshift(newExpense);

    await appendSheetRow('Restaurant_Admin_Financials', [
      recordId,
      date,
      'EXPENSE',
      newExpense.category,
      newExpense.description,
      cost,
      'N/A'
    ]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, expense: newExpense }));
    return;
  }

  // ==========================================
  // 4. AUTHENTICATION VERIFICATION
  // ==========================================
  if (req.url === '/api/auth' && req.method === 'POST') {
    const { portal, password } = await getBody();
    const isValid = PASSWORDS[portal] && PASSWORDS[portal] === password;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: isValid, error: isValid ? null : 'Invalid password. Please check your credentials.' }));
    return;
  }

  // ==========================================
  // 5. MENU DATA ENDPOINT
  // ==========================================
  if (req.url === '/api/menu' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, menu: MENU }));
    return;
  }

  // ==========================================
  // 6. STATIC FILE SERVING
  // ==========================================
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  if (extname === '.css') contentType = 'text/css';
  if (extname === '.json') contentType = 'application/json';
  if (extname === '.png') contentType = 'image/png';
  if (extname === '.jpg' || extname === '.jpeg') contentType = 'image/jpeg';
  if (extname === '.svg') contentType = 'image/svg+xml';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`
======================================================
🍝 Clean AI Restaurant Operating System
📡 Live Server: http://localhost:${PORT}
👨‍🍳 Kitchen Portal: Protected (default: chef123)
📊 Admin Dashboard: Protected (default: admin123)
💬 Chatbot Webhook: Connected to Hostinger n8n
📊 Google Sheets: Connected to Spreadsheet ${SPREADSHEET_ID}
======================================================
  `);
});
