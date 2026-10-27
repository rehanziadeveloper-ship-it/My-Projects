const crypto = require('crypto');

const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const N8N_CHATBOT_WEBHOOK = 'https://n8n.srv1767318.hstgr.cloud/webhook/restaurant-chatbot';

const PASSWORDS = {
  kitchen: 'chef123',
  admin: 'admin123'
};

const GOOGLE_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "valiant-epsilon-501913-g2",
  private_key_id: "8231aeffe62304da1b823a23e1d91ff7ade9336e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6/8ATa9+hemSf\naqpP5WQTVHoRIv3JAXCFihZM3vV00/WcKevaQtqM+hYyMWOhapcADH2+rDEEGvJ5\nJij72yzH3j0WgFEFz3wszX1knUHsgHa+m8XSNuyzGeVAydWcAKKeHoS6U20NeOXZ\n40oJUYzPZ6rgGGGztikxzTdoQCGrMhnvVY/ErSyHyU4c6cx5xLbhlEXrMjK611iy\n4Tjn07zydQFVXi9zBflnISIIYDZfWMQ9DYp3GKONaPwA5DvK2W9ev+9PbqZA15XQ\nKnXVBi5v93f2dkrZ+WdG4Rp8AENcNC2iBE6TW8OwTB8JnPSS1gsCexP8ultibc8g\nWRdtPGSRAgMBAAECggEAFbGj49zo5b/gOopSVdCD6qYrPx+zF4WeOy/I5IQdL7+D\nR+mpHfoRhrdgqdQG/evytqO8Vsl9Kj/CD4H40TcdG9bReXHLdIQcoMn6GRkRU9GX\ndQd3TKrojOKdMQX5TQ7ZzsQ1m7Qf+6ch60QuC6S1VD5vmW3ar9GbN9bZ7bM69LQ5\neMyUeFSKAbaju+O1vV3mlPpiz5ndSn+VQsY8NhV8DF1yhYyNlf0QiffdnOQU7Msj\nzGMypJ21EXVdmuKlKhxjYJY4bK9YWUDDg3LmK/vYzCLj7Cl2nDuU/8WBzi3YW7AK\nPzmESzdOnQzw1UErXNo54PH6xpKO1pFMB4tg9ueo3QKBgQDiIpr503zn65tsyazw\n3vELXg+ZZBGwHc7SNsxeTW5P/fDKrVV404cKK5+8Pw+mgoZjDkc3CFaUzAI9pXnR\nvFDclbOk/GKSBPtcJfot94EQUgzlBpeEcqIj8Z9+gaUfuHL7ZYOQzwR0z6fG9A3O\nnlDICb1ja5NvwOYWBwvctr3g2wKBgQDTsf4NnJK+fYRVACgYaXGWm7HvTDa8lR/3\n6PTd9Z72+jCuBRkSqT0OcbxV+CCniZXJJAioFm1raYoP7utn6PjIONC54RzP9nXw\n3HIE5dYJRm7U1Efen5CYxyXg8lIHrMPbwrCAuwcTeE+QizSNfhSBunz7zYvivNUu\nAnWELFrmAwKBgEocGToiy16eYnOGrLzL86dMDkSw/PMA8dUGzHdjXPGuQYnKwKY2\nfJ0iqtjgudpSEITKGyC4BNgC/AEECCZqVv3TueoqJIvCQjZy48jIwm181mkAfguU\nHfs1ppWpG1qH8nbdT/7XOZimrU+QkC3UyJimSIEaslj/mOhDKuoMobHdAoGAeMns\nnbOi/1H6+c0XE6bGixrXUiT4bm3gScIARc1qIJ3svL5n6f/quJ0oyxzC9RVKA/St\ng8sYL9uOTT0T0Lxbh1Lztbu+huKntQDzhdvmXnBzuLhPMbV1+dZXxJw/NeXb8z6J\nG0qb5P4W1/C10a4I4WSY/8vubzczpAb/KqVsUCUCgYEAi7yC38YXnqSKMypyllhg\n21BRoh1a07V+8QY/ahYxzmdLY9cVmgZe9h8fHq18oCZtzJvwBuk8u5tV+7LuGyxi\nwLi5qBlg+zBA0RNT03pmN7D6JJBsdGQ2KtWHYvnBSayt4p/IJJ5Rpi67DDwcfsi8\nKA/MJzN4Cj+IKJnZxvEa7r8=\n-----END PRIVATE KEY-----\n",
  client_email: "antigravity-mcp@valiant-epsilon-501913-g2.iam.gserviceaccount.com"
};

let cachedToken = null;
let tokenExpiry = 0;

async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

  const exp = now + 3600;
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: GOOGLE_SERVICE_ACCOUNT.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp, iat: now
  };

  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const sigIn = `${b64(header)}.${b64(claim)}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(sigIn);
  const sig = signer.sign(GOOGLE_SERVICE_ACCOUNT.private_key, 'base64url');
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

async function readSheetValues(tabName) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(tabName)}?valueRenderOption=UNFORMATTED_VALUE`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    return data.values || [];
  } catch (err) {
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
  } catch (err) {}
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
  } catch (err) {}
}

// In-Memory Fallback State
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

async function routeConfirmedOrder(order) {
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

  memoryFinancials.unshift({
    recordId: `FIN-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    type: 'REVENUE',
    category: 'Food Sales',
    description: `Order ${order.orderId} (${order.customerName})`,
    amount: parseFloat(order.totalPrice),
    orderId: order.orderId
  });

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

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const path = event.path.replace(/\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
  const body = JSON.parse(event.body || '{}');

  // 1. Chatbot endpoint
  if (path === '/chat' && event.httpMethod === 'POST') {
    let n8nResponse = null;
    try {
      const n8nRes = await fetch(N8N_CHATBOT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (n8nRes.ok) n8nResponse = await n8nRes.json();
    } catch (e) {}

    if (!n8nResponse || !n8nResponse.reply) {
      const msg = (body.message || '').trim().toLowerCase();
      let state = body.sessionState || { step: 'START', items: [], name: '', phone: '' };

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

    if (n8nResponse.order && n8nResponse.order.orderId) {
      await routeConfirmedOrder(n8nResponse.order);
    }

    return { statusCode: 200, headers, body: JSON.stringify(n8nResponse) };
  }

  // 2. Kitchen orders
  if (path === '/kitchen/orders' && event.httpMethod === 'GET') {
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
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, orders }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, orders: memoryOrders }) };
  }

  // 3. Kitchen update status
  if (path === '/kitchen/status' && event.httpMethod === 'POST') {
    const { orderId, newStatus } = body;
    const ord = memoryOrders.find(o => o.orderId === orderId);
    if (ord) ord.status = newStatus;

    const rows = await readSheetValues('Restaurant_Kitchen_Orders');
    if (rows && rows.length > 1) {
      const rowIndex = rows.findIndex((r, idx) => idx > 0 && r[0] === orderId);
      if (rowIndex !== -1) {
        await updateSheetRange(`Restaurant_Kitchen_Orders!H${rowIndex + 1}`, [[newStatus]]);
      }
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, orderId, newStatus }) };
  }

  // 4. Admin financials
  if (path === '/admin/financials' && event.httpMethod === 'GET') {
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        metrics: {
          totalRevenue: totalRevenue.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          netProfit: netProfit.toFixed(2),
          orderCount,
          avgCheck
        },
        records
      })
    };
  }

  // 5. Admin add expense
  if (path === '/admin/expenses' && event.httpMethod === 'POST') {
    const { category, description, amount } = body;
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

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, expense: newExpense }) };
  }

  // 6. Auth
  if (path === '/auth' && event.httpMethod === 'POST') {
    const { portal, password } = body;
    const isValid = PASSWORDS[portal] && PASSWORDS[portal] === password;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: isValid, error: isValid ? null : 'Invalid password.' })
    };
  }

  // 7. Menu
  if (path === '/menu' && event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, menu: MENU }) };
  }

  return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };
};
