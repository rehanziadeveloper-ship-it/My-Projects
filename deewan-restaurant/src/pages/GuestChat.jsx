import React, { useState, useEffect, useRef } from 'react';
import { Send, Bell, Image as ImageIcon, RefreshCw, ShoppingBag, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { processUserChat, DEEWAN_MENU, getItemUnitLabel, MAIN_MENU_BUTTONS } from '../services/conversationEngine';
import { supabase } from '../services/supabase';
import WaiterCallModal from '../components/WaiterCallModal';
import ImageModal from '../components/ImageModal';

const MENU_IMAGES = [
  '/assets/menu_page_1.jpg',
  '/assets/menu_page_2.jpg'
];

function FormattedChatText({ text }) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1 text-sm text-stone-900 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Horizontal Dividers
        if (/^[━─=-]{4,}$/.test(trimmed)) {
          return <div key={idx} className="border-t border-stone-200/90 my-2" />;
        }

        // 2. Multi-size branch line (e.g. "├─ 🥣 Half: Rs. 950" or "└─ 🍲 Full: Rs. 1,799")
        const branchMatch = trimmed.match(/^(?:├─|└─)\s*(.*?):\s*(Rs\.\s*[\d,]+.*)$/i);
        if (branchMatch) {
          const rawLabel = branchMatch[1].replace(/\*/g, '').trim();
          const price = branchMatch[2].replace(/\*/g, '').trim();
          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1.5 px-2.5 ml-1 sm:ml-2 my-1 rounded-lg bg-orange-50/70 border border-orange-200/60 text-stone-800"
            >
              <span className="font-semibold text-stone-800 min-w-0 flex-1 truncate pr-2">{rawLabel}</span>
              <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200 shadow-2xs font-mono shrink-0 whitespace-nowrap">
                {price}
              </span>
            </div>
          );
        }

        // 3. Single Item price row (e.g. "▫️ *1. Chicken Biryani* ── Rs. 900" or "• 1x Chicken Biryani ── Rs. 900")
        const itemMatch = trimmed.match(/^(?:▫️|•)?\s*\*?([^─*]+)\*?\s*──+\s*(Rs\.\s*[\d,]+.*)$/i);
        if (itemMatch) {
          const rawLabel = itemMatch[1].replace(/\*/g, '').trim();
          const price = itemMatch[2].replace(/\*/g, '').trim();
          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1.5 px-2.5 my-1 rounded-lg bg-stone-50 border border-stone-200/80 text-stone-900"
            >
              <span className="font-semibold text-stone-800 min-w-0 flex-1 truncate pr-2">{rawLabel}</span>
              <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200 shadow-2xs font-mono shrink-0 whitespace-nowrap">
                {price}
              </span>
            </div>
          );
        }

        // 4. Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // 5. Normal text line with *bold* formatting support
        return (
          <div key={idx} className="leading-snug">
            {renderWithBold(line)}
          </div>
        );
      })}
    </div>
  );
}

function renderWithBold(text) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <strong key={i} className="font-bold text-stone-900">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return part;
  });
}

function MessageButtons({ buttons, onSend }) {
  if (!buttons || buttons.length === 0) return null;

  // 2 Buttons (e.g. Half / Full, or Confirm / Edit, Yes / No): Clean 50/50 2-col grid
  if (buttons.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2.5 w-full max-w-[95%] sm:max-w-[88%]">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => onSend(btn.payload)}
            className="min-h-[42px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-orange-50 active:scale-95 text-orange-800 border-2 border-orange-300 shadow-xs hover:border-orange-500 transition flex items-center justify-center text-center touch-manipulation select-none"
          >
            {btn.label}
          </button>
        ))}
      </div>
    );
  }

  // 3 Buttons: 3-column on mobile & desktop
  if (buttons.length === 3) {
    return (
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2.5 w-full max-w-[95%] sm:max-w-[88%]">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => onSend(btn.payload)}
            className="min-h-[40px] px-1.5 sm:px-2 py-2 rounded-xl font-bold text-[11px] sm:text-xs bg-white hover:bg-orange-50 active:scale-95 text-orange-800 border border-orange-300 shadow-xs hover:border-orange-500 transition flex items-center justify-center text-center touch-manipulation select-none"
          >
            {btn.label}
          </button>
        ))}
      </div>
    );
  }

  // 4 or more Buttons (Categories, Dishes, Follow-ups):
  // Clean, uniform 2-column keypad. Odd items span both columns symmetrically!
  return (
    <div className="grid grid-cols-2 gap-2 mt-2.5 w-full max-w-[95%] sm:max-w-[88%]">
      {buttons.map((btn, idx) => {
        const isLastOdd = buttons.length % 2 !== 0 && idx === buttons.length - 1;
        return (
          <button
            key={idx}
            onClick={() => onSend(btn.payload)}
            className={`min-h-[40px] px-2.5 py-2 rounded-xl font-semibold text-xs bg-white hover:bg-orange-50 active:scale-95 text-orange-800 border border-orange-200/90 shadow-xs hover:border-orange-400 transition flex items-center justify-center text-center touch-manipulation select-none ${
              isLastOdd ? 'col-span-2' : ''
            }`}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}

function QuantitySelector({ item, onUpdate, compact = false }) {
  const currentQty = item?.quantity || 1;
  const [val, setVal] = useState(currentQty);

  useEffect(() => {
    setVal(currentQty);
  }, [currentQty]);

  const handleDec = (e) => {
    e.stopPropagation();
    const newQty = currentQty - 1;
    onUpdate(item.id, newQty);
  };

  const handleInc = (e) => {
    e.stopPropagation();
    const newQty = currentQty + 1;
    onUpdate(item.id, newQty);
  };

  const handleBlur = () => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate(item.id, parsed);
    } else {
      setVal(currentQty);
    }
  };

  const unitLabel = getItemUnitLabel(item, currentQty);

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-white border-2 border-orange-300 rounded-xl px-2 py-1 shadow-xs ${
        compact ? 'py-0.5 px-1.5' : ''
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleDec}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-orange-100 active:scale-90 text-stone-800 font-extrabold text-base transition select-none touch-manipulation"
        title="Decrease quantity by 1"
      >
        −
      </button>

      <div className="flex items-center gap-1 px-1">
        <input
          type="number"
          min="1"
          max="99"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="w-8 text-center font-bold text-xs sm:text-sm text-stone-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400 rounded select-all"
        />
        <span className="text-[11px] font-bold text-stone-600 whitespace-nowrap select-none">
          {unitLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={handleInc}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-90 text-white font-extrabold text-base transition select-none shadow-xs touch-manipulation"
        title="Increase quantity by 1"
      >
        +
      </button>
    </div>
  );
}

export default function GuestChat() {
  const [tableNo, setTableNo] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState({
    step: 'START',
    cart: [],
    table_no: '',
    customer_name: '',
    customer_phone: ''
  });
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, index: 0 });
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const messagesEndRef = useRef(null);
  const sessionInitialized = useRef(false);

  // Initialize table & load chat session on initial mount
  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table') || '';
    if (tbl) {
      setTableNo(tbl);
      setSessionState((prev) => ({ ...prev, table_no: tbl, step: 'BROWSING' }));
    } else {
      setSessionState((prev) => ({ ...prev, step: 'COLLECT_TABLE' }));
    }

    const savedKey = tbl ? `deewan_chat_table_${tbl}` : 'deewan_chat_table_guest';
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasOldIntroImages = parsed.messages?.some((m) => m.id === 'msg_menu_img_1');
        const isStaleGuestSession =
          !tbl &&
          (!parsed.sessionState?.activeOrder ||
            parsed.sessionState?.activeOrder?.status === 'cancelled' ||
            parsed.sessionState?.activeOrder?.status === 'completed');

        if (parsed.messages && parsed.messages.length > 0 && !hasOldIntroImages && !isStaleGuestSession) {
          setMessages(parsed.messages);
          if (parsed.sessionState) {
            setSessionState(parsed.sessionState);
            if (parsed.sessionState.table_no) {
              setTableNo(parsed.sessionState.table_no);
            }
          }
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved chat session', e);
      }
    }

    // Default Initial Screen: Clean Welcome Greeting + Menu & Category suggestions
    const initialButtons = MAIN_MENU_BUTTONS;

    const initialMessages = tbl
      ? [
          {
            id: 'msg_welcome',
            sender: 'bot',
            text: 'Welcome to Deewan-E-Khaas (Namak Mandi)! 🍖🔥\nAap kya order karna chahenge? 😊',
            buttons: initialButtons,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      : [
          {
            id: 'msg_welcome',
            sender: 'bot',
            text: 'Welcome! 😊 Please enter your table number to get started (e.g., Table 1, Table 2, Table 5, or Table 12).',
            buttons: [
              { label: '🪑 Table 1', payload: '1' },
              { label: '🪑 Table 2', payload: '2' },
              { label: '🪑 Table 3', payload: '3' },
              { label: '🪑 Table 5', payload: '5' },
              { label: '🪑 Table 8', payload: '8' },
              { label: '🪑 Table 10', payload: '10' }
            ],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

    setMessages(initialMessages);
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Save chat session to LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = tableNo ? `deewan_chat_table_${tableNo}` : 'deewan_chat_table_guest';
      localStorage.setItem(
        storageKey,
        JSON.stringify({ messages, sessionState })
      );
    }
  }, [messages, sessionState, tableNo]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleUpdateCartQuantity = (itemId, newQty) => {
    setSessionState((prev) => {
      let updatedCart;
      if (newQty <= 0) {
        updatedCart = (prev.cart || []).filter((item) => item.id !== itemId);
      } else {
        updatedCart = (prev.cart || []).map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity: newQty,
              subtotal: item.price * newQty
            };
          }
          return item;
        });
      }
      return {
        ...prev,
        cart: updatedCart
      };
    });
  };

  const handleSendMessage = async (customText, buttonPayload = '') => {
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() && !buttonPayload) return;

    // Handle Waiter Call directly
    if (buttonPayload === 'waiter' || textToSend.toLowerCase().includes('waiter')) {
      setShowWaiterModal(true);
      return;
    }

    // User Message
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend || buttonPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (customText === undefined) setInputText('');
    setLoading(true);

    // Simulate conversational typing delay for natural feel
    setTimeout(async () => {
      try {
        const currentState = {
          ...sessionState,
          table_no: sessionState.table_no || tableNo
        };

        const result = processUserChat(textToSend || buttonPayload, currentState);

        // Update tableNo state if captured in conversation
        if (result.sessionState?.table_no && result.sessionState.table_no !== tableNo) {
          setTableNo(result.sessionState.table_no);
        }

        // ========================================================
        // 1. ORDER CANCELLATION THROUGH CHAT
        // ========================================================
        if (result.isCancelRequest) {
          let activeOrder = currentState.activeOrder;
          const currentTable = result.sessionState?.table_no || currentState.table_no || tableNo;

          // If no active order in session state, look up latest active order for this table from Supabase
          if (!activeOrder && currentTable) {
            try {
              const { data: dbOrders } = await supabase
                .from('orders')
                .select('*')
                .eq('table_no', currentTable)
                .order('created_at', { ascending: false })
                .limit(1);

              if (dbOrders && dbOrders.length > 0) {
                activeOrder = dbOrders[0];
              }
            } catch (err) {
              console.warn('Error fetching order for cancellation:', err);
            }
          }

          if (!activeOrder) {
            const botMsg = {
              id: 'msg_' + Date.now() + '_bot',
              sender: 'bot',
              text: 'Aapka koi active order nahi mila! Agar aap khana mangwana chahein toh menu se dishes select karein. 😊',
              buttons: MAIN_MENU_BUTTONS,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, botMsg]);
            setLoading(false);
            return;
          }

          const displayOrderNum = (num) => (num ? (String(num).startsWith('#') ? num : '#' + num) : '');

          if (activeOrder.status === 'cancelled') {
            const botMsg = {
              id: 'msg_' + Date.now() + '_bot',
              sender: 'bot',
              text: `Order ${displayOrderNum(activeOrder.order_no)} pehle hi cancel ho chuka hai. Agar aap naya order dena chahein toh menu se select karein! 😊`,
              buttons: MAIN_MENU_BUTTONS,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, botMsg]);
            setLoading(false);
            return;
          }

          if (activeOrder.status === 'received' || activeOrder.status === 'pending') {
            try {
              await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', activeOrder.id);
            } catch (err) {
              console.warn('Failed to update status in Supabase:', err);
            }

            setSessionState((prev) => ({
              ...prev,
              cart: [],
              activeOrder: null,
              step: 'BROWSING'
            }));

            const botMsg = {
              id: 'msg_' + Date.now() + '_bot',
              sender: 'bot',
              text: `Aapka Order ${displayOrderNum(activeOrder.order_no)} kamyabi se cancel kar diya gaya hai! 🚫\n\nKitchen ko itla kar di gayi hai aur order screen se hata diya gaya hai. Agar aap dobara naya order dena chahein toh neeche se dish select karein. 😊`,
              buttons: MAIN_MENU_BUTTONS,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, botMsg]);
            setLoading(false);
            return;
          }

          if (['preparing', 'ready', 'served', 'completed'].includes(activeOrder.status)) {
            const statusDesc = activeOrder.status === 'preparing' ? 'kitchen mein tayyar ho raha hai' : 'serve ho chuka hai';
            const botMsg = {
              id: 'msg_' + Date.now() + '_bot',
              sender: 'bot',
              text: `Afsoos! Aapka Order ${displayOrderNum(activeOrder.order_no)} is waqt ${statusDesc}. Restaurant policy ke mutabiq cooking shuru honay ke baad order cancel nahi kiya ja sakta.\n\nBarah-e-karam mazeed maloomat ke liye Waiter ya Manager se rabta karein. 🛎️`,
              buttons: [
                { label: '🛎️ Waiter Bulao', payload: 'waiter' },
                { label: '📜 Poora Menu', payload: 'menu' }
              ],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, botMsg]);
            setLoading(false);
            return;
          }
        }

        // If the result contains menu images (like user saying "menu"), add them as pure image bubbles
        if (result.menuImages && result.menuImages.length > 0) {
          result.menuImages.forEach((img, idx) => {
            setMessages((prev) => [
              ...prev,
              {
                id: 'msg_img_' + Date.now() + '_' + idx,
                sender: 'bot',
                text: '',
                menuImages: [img],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          });
        }

        // Main text response or suggestion buttons
        if (result.reply || (result.buttons && result.buttons.length > 0) || result.itemCard) {
          const botMsg = {
            id: 'msg_' + Date.now() + '_bot',
            sender: 'bot',
            text: result.reply || '',
            buttons: result.buttons || [],
            itemCard: result.itemCard || null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages((prev) => [...prev, botMsg]);
        }
        setSessionState(result.sessionState);

        // If order finalized
        if (result.order) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });

          // Instantly record activeOrder in sessionState for in-memory and cancellation tracking
          setSessionState((prev) => ({
            ...prev,
            activeOrder: { ...result.order, status: 'received' }
          }));

          // Sync order to Supabase & save activeOrder in session
          try {
            const { data: insertedOrder, error: insErr } = await supabase
              .from('orders')
              .insert([
                {
                  order_no: result.order.order_no,
                  table_no: result.order.table_no,
                  customer_name: result.order.customer_name,
                  customer_phone: result.order.customer_phone,
                  total: result.order.total,
                  status: 'received',
                  notes: JSON.stringify(result.order.items)
                }
              ])
              .select();

            if (insertedOrder && insertedOrder.length > 0) {
              setSessionState((prev) => ({
                ...prev,
                activeOrder: insertedOrder[0]
              }));
            }
          } catch (e) {
            console.warn('Supabase order insert note:', e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleReset = () => {
    if (window.confirm('Kya aap naya order shuru karna chahte hain?')) {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table') || '';

      localStorage.removeItem('deewan_chat_table_guest');
      if (tableNo) {
        localStorage.removeItem(`deewan_chat_table_${tableNo}`);
      }

      setTableNo(urlTable);
      setSessionState({
        step: urlTable ? 'BROWSING' : 'COLLECT_TABLE',
        cart: [],
        table_no: urlTable,
        customer_name: '',
        customer_phone: '',
        activeOrder: null
      });

      const initialButtons = MAIN_MENU_BUTTONS;

      const initialMessages = urlTable
        ? [
            {
              id: 'msg_welcome',
              sender: 'bot',
              text: 'Welcome to Deewan-E-Khaas (Namak Mandi)! 🍖🔥\nAap kya order karna chahenge? 😊',
              buttons: initialButtons,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        : [
            {
              id: 'msg_welcome',
              sender: 'bot',
              text: 'Welcome! 😊 Please enter your table number to get started (e.g., Table 1, Table 2, Table 5, or Table 12).',
              buttons: [
                { label: '🪑 Table 1', payload: '1' },
                { label: '🪑 Table 2', payload: '2' },
                { label: '🪑 Table 3', payload: '3' },
                { label: '🪑 Table 5', payload: '5' },
                { label: '🪑 Table 8', payload: '8' },
                { label: '🪑 Table 10', payload: '10' }
              ],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
      setMessages(initialMessages);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-stone-200 sm:p-4 md:py-6 flex justify-center items-center">
      <div className="w-full max-w-lg h-[100dvh] sm:h-[860px] sm:max-h-[92vh] bg-[#efeae2] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border border-stone-300">
        
        {/* Responsive Mobile-First Header */}
        <header className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#c2410c] text-white z-20 shadow-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 p-1 flex items-center justify-center font-black text-lg sm:text-xl shadow-inner border border-white/30 shrink-0">
              🍖
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-sm sm:text-base leading-tight truncate">Deewan-E-Khaas</h1>
                {tableNo && (
                  <button
                    onClick={() => handleSendMessage(undefined, 'change table')}
                    className="bg-white/20 hover:bg-white/30 active:scale-95 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition shrink-0"
                    title="Tap to change table"
                  >
                    <span>🪑 Table #{tableNo}</span>
                    <span className="text-[10px] opacity-75">✏️</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-orange-200 flex items-center gap-1.5 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0"></span>
                <span className="truncate">Dine-In • AI Server Online</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowWaiterModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-900 rounded-full font-bold text-xs shadow-md transition whitespace-nowrap"
              title="Call Waiter"
            >
              <Bell className="w-3.5 h-3.5 fill-current animate-bounce shrink-0" />
              <span>Waiter Bulao</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 text-white/90 active:scale-95 transition shrink-0"
              title="Start Over"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </header>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isPureImage = msg.menuImages && !msg.text;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[95%] sm:max-w-[88%] rounded-2xl ${
                    isPureImage ? 'p-1.5 bg-white border border-stone-200' : 'p-3 sm:p-3.5'
                  } text-sm shadow-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#d9fdd3] text-stone-900 rounded-tr-none'
                      : 'bg-white text-stone-900 rounded-tl-none border border-stone-200'
                  }`}
                >
                  {/* Optional Image Caption */}
                  {msg.caption && (
                    <div className="text-xs font-bold text-stone-700 px-2 pt-1 pb-1 flex items-center gap-1">
                      <span>{msg.caption}</span>
                    </div>
                  )}

                  {/* Clean Pure Images with Tap to Zoom */}
                  {msg.menuImages && msg.menuImages.length > 0 && (
                    <div className="space-y-2">
                      {msg.menuImages.map((imgSrc, idx) => {
                        const imageIndex = MENU_IMAGES.indexOf(imgSrc) !== -1 ? MENU_IMAGES.indexOf(imgSrc) : idx;
                        return (
                          <div
                            key={idx}
                            className="rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-white cursor-pointer relative group"
                            onClick={() => setPreviewModal({ isOpen: true, index: imageIndex })}
                          >
                            <img
                              src={imgSrc}
                              alt="Deewan Menu"
                              className="w-full object-contain max-h-[380px] sm:max-h-[520px] bg-white hover:opacity-95 transition"
                            />
                            <div className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md opacity-90 group-hover:opacity-100 transition">
                              <span>🔍 Tap to Zoom</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text only if present */}
                  {msg.text && (
                    <FormattedChatText text={msg.text} />
                  )}

                  {/* Inline Interactive Item Card with Quantity Selector */}
                  {msg.itemCard && (
                    <div className="mt-2.5 p-2.5 bg-orange-50/90 border border-orange-200/90 rounded-xl shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-stone-900 text-xs sm:text-sm block truncate">
                            {msg.itemCard.name}
                          </span>
                          <span className="text-[11px] text-stone-600 font-mono">
                            Rs. {msg.itemCard.price.toLocaleString()} each
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-orange-700 font-mono text-xs sm:text-sm">
                            Rs. {((sessionState.cart.find((i) => i.id === msg.itemCard.id)?.subtotal) ?? msg.itemCard.subtotal).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-orange-200/60">
                        <span className="text-[11px] text-stone-600 font-semibold">Tadad / Quantity:</span>
                        <QuantitySelector
                          item={sessionState.cart.find((i) => i.id === msg.itemCard.id) || msg.itemCard}
                          onUpdate={handleUpdateCartQuantity}
                        />
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-stone-500' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* Smart Aligned Quick-Reply Grid Buttons below bot bubbles */}
                {!isUser && msg.buttons && msg.buttons.length > 0 && (
                  <MessageButtons
                    buttons={msg.buttons}
                    onSend={(payload) => handleSendMessage(payload)}
                  />
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white/80 rounded-2xl w-fit shadow-xs border border-stone-200">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-200"></span>
              <span className="text-xs text-stone-500 italic ml-1">Deewan likh raha hai...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Cart Indicator */}
        {sessionState && sessionState.cart && sessionState.cart.length > 0 && (
          <div className="mx-2.5 sm:mx-4 mb-2 p-2.5 sm:p-3 bg-stone-900 text-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-between text-xs shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 active:scale-95 transition"
              onClick={() => setShowCartDrawer(true)}
              title="Click to view/edit cart items"
            >
              <div className="p-1.5 bg-orange-500/20 rounded-lg text-orange-400 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0 truncate">
                <span className="font-bold text-white">
                  {sessionState.cart.reduce((s, i) => s + i.quantity, 0)} Items
                </span>
                <span className="text-orange-400 text-[11px] ml-1.5 font-semibold underline underline-offset-2">
                  (View / Edit)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <span className="font-extrabold text-orange-400 text-xs sm:text-sm font-mono whitespace-nowrap">
                Rs. {sessionState.cart.reduce((s, i) => s + i.subtotal, 0).toLocaleString()}
              </span>
              <button
                onClick={() => handleSendMessage('done')}
                className="bg-orange-600 hover:bg-orange-500 active:scale-95 px-3 py-1.5 rounded-lg font-bold text-white transition whitespace-nowrap text-xs shadow-xs"
              >
                Checkout ➔
              </button>
            </div>
          </div>
        )}

        {/* Interactive Cart Drawer (Slide-up modal for all items with + / - selectors) */}
        {showCartDrawer && (
          <div
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowCartDrawer(false)}
          >
            <div
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 bg-stone-900 text-white border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-400" />
                  <h3 className="font-bold text-sm sm:text-base">Aapka Order Cart</h3>
                  <span className="text-xs bg-orange-600 px-2 py-0.5 rounded-full font-bold">
                    {sessionState.cart.reduce((s, i) => s + i.quantity, 0)} Items
                  </span>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 rounded-full hover:bg-white/20 text-stone-300 hover:text-white transition"
                  title="Close Cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-stone-100">
                {sessionState.cart.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-sm">
                    Aapki cart khali hai. Menu se dish add karein.
                  </div>
                ) : (
                  sessionState.cart.map((item) => (
                    <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-stone-900 text-xs sm:text-sm truncate">{item.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          Rs. {item.price.toLocaleString()} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <QuantitySelector item={item} onUpdate={handleUpdateCartQuantity} compact={true} />
                        <span className="font-extrabold text-orange-700 font-mono text-xs sm:text-sm min-w-[62px] text-right">
                          Rs. {item.subtotal.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleUpdateCartQuantity(item.id, 0)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {sessionState.cart.length > 0 && (
                <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Total Bill</div>
                    <div className="font-extrabold text-orange-700 font-mono text-base sm:text-lg">
                      Rs. {sessionState.cart.reduce((s, i) => s + i.subtotal, 0).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      handleSendMessage('done');
                    }}
                    className="flex-1 max-w-[200px] bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs sm:text-sm text-center transition"
                  >
                    Checkout Karein ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Bar with Safe Area Inset & 16px Font (Prevents iOS Safari auto-zoom) */}
        <footer className="p-2.5 sm:p-3 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] sm:pb-3 bg-stone-100 border-t border-stone-200 flex items-center gap-2 z-20 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Order karein (maslan: karahi, biryani)..."
            className="flex-1 bg-white border border-stone-300 rounded-full px-4 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner text-stone-900 placeholder:text-stone-400 min-h-[42px]"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-full shadow-md active:scale-95 transition flex items-center justify-center shrink-0 touch-manipulation"
            title="Send order"
          >
            <Send className="w-4 h-4" />
          </button>
        </footer>

        {/* Interactive Menu Zoom & Pan Modal */}
        {previewModal.isOpen && (
          <ImageModal
            images={MENU_IMAGES}
            initialIndex={previewModal.index}
            onClose={() => setPreviewModal({ isOpen: false, index: 0 })}
          />
        )}

        {/* Waiter Call Modal */}
        {showWaiterModal && (
          <WaiterCallModal
            tableNo={tableNo}
            cooldownRemaining={cooldown}
            onClose={() => setShowWaiterModal(false)}
            onCallSuccess={() => setCooldown(90)}
          />
        )}
      </div>
    </div>
  );
}
