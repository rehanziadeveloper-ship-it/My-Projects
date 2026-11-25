// Centralized Restaurant Service for Deewan-E-Khaas (Namak Mandi)
// Handles Restaurant Profile, Categories CRUD, Menu Items CRUD,
// Sequential Display IDs ('01', '02', '03'...), and Live System Synchronization.

import { supabase } from './supabase';

export const RESTAURANT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Default initial restaurant profile
export const DEFAULT_RESTAURANT = {
  id: RESTAURANT_ID,
  display_id: '01',
  name: 'Deewan-E-Khaas (Deewan Namak Mandi)',
  slug: 'deewan-e-khaas',
  phone: '+92 313 88 88 458',
  address: 'North Circular Road Near Fowara Chowk, D.I Khan',
  currency: 'PKR',
  opening_hours: '12:00 PM - 02:00 AM',
  description: 'Authentic Shinwari Karahi, Dum Pukht, BBQ & Traditional Namak Mandi Flavors.',
  is_open: true,
  logo_url: ''
};

// Local storage keys for resilient persistence
const STORAGE_KEYS = {
  PROFILE: 'deewan_live_restaurant_profile',
  CATEGORIES: 'deewan_live_categories',
  ITEMS: 'deewan_live_menu_items'
};

// Helper: Format sequential ID with leading zero (e.g. 1 -> '01', 9 -> '09', 12 -> '12', 106 -> '106')
export function formatSeqId(num) {
  if (num === null || num === undefined) return '01';
  const n = parseInt(num, 10);
  if (isNaN(n)) return String(num);
  return n < 10 ? `0${n}` : `${n}`;
}

// Global broadcast channel for instant multi-tab sync
let syncChannel = null;
if (typeof window !== 'undefined' && window.BroadcastChannel) {
  try {
    syncChannel = new BroadcastChannel('deewan_restaurant_sync');
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

export function broadcastChange(type, data) {
  if (typeof window === 'undefined') return;
  // Dispatch local window event
  window.dispatchEvent(new CustomEvent('deewan_sync_event', { detail: { type, data } }));
  // Broadcast across tabs
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, data });
    } catch (e) {
      console.warn('Failed to broadcast across tabs', e);
    }
  }
}

export function onSyncChange(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e) => callback(e.detail);
  const handleBroadcast = (e) => callback(e.data);

  window.addEventListener('deewan_sync_event', handleCustom);
  if (syncChannel) {
    syncChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('deewan_sync_event', handleCustom);
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

// ==============================================================================
// 1. RESTAURANT PROFILE MODULE
// ==============================================================================

export async function getRestaurantProfile() {
  // 1. Check local storage first for fast hydrated state
  let profile = { ...DEFAULT_RESTAURANT };
  const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (cached) {
    try {
      profile = { ...profile, ...JSON.parse(cached) };
    } catch (e) {
      console.warn('Error parsing cached profile', e);
    }
  }

  // 2. Fetch latest from Supabase
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      profile = {
        ...profile,
        ...data,
        display_id: formatSeqId(data.display_id || 1),
        is_open: data.is_open !== undefined ? data.is_open : true
      };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }
  } catch (err) {
    console.warn('Supabase fetch restaurants error (using cached profile):', err);
  }

  return profile;
}

export async function updateRestaurantProfile(updates) {
  const current = await getRestaurantProfile();
  const merged = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString()
  };

  // 1. Save to local storage for immediate persistence
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged));

  // 2. Persist to Supabase
  try {
    const payload = {
      id: RESTAURANT_ID,
      name: merged.name,
      slug: merged.slug || 'deewan-e-khaas',
      phone: merged.phone,
      address: merged.address,
      currency: merged.currency || 'PKR',
      description: merged.description,
      opening_hours: merged.opening_hours,
      is_open: merged.is_open,
      logo_url: merged.logo_url,
      display_id: merged.display_id || '01'
    };

    const { error } = await supabase
      .from('restaurants')
      .upsert(payload, { onConflict: 'slug' });

    if (error) {
      console.warn('Supabase restaurant upsert notice (saved locally):', error.message);
    }
  } catch (err) {
    console.warn('Supabase profile update notice:', err);
  }

  broadcastChange('PROFILE_UPDATED', merged);
  return merged;
}

// ==============================================================================
// 2. CATEGORIES MANAGEMENT MODULE
// ==============================================================================

export async function getCategories() {
  let categories = [];

  // Check cached
  const cached = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (cached) {
    try {
      categories = JSON.parse(cached);
    } catch (e) {
      console.warn('Error parsing cached categories', e);
    }
  }

  // Fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (data && !error && data.length > 0) {
      categories = data.map((cat, idx) => ({
        ...cat,
        display_id: formatSeqId(cat.display_id || cat.display_order || idx + 1),
        is_active: cat.is_active !== undefined ? cat.is_active : true
      }));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  } catch (err) {
    console.warn('Supabase categories fetch error:', err);
  }

  // Ensure sequential display_id on every category
  categories = categories.map((cat, idx) => ({
    ...cat,
    display_id: formatSeqId(cat.display_id || cat.display_order || idx + 1),
    is_active: cat.is_active !== undefined ? cat.is_active : true
  }));

  return categories;
}

export async function saveCategory(categoryData) {
  const currentCategories = await getCategories();
  let updatedList = [...currentCategories];
  let savedCategory = null;

  if (categoryData.id) {
    // Edit existing
    const idx = updatedList.findIndex((c) => c.id === categoryData.id);
    if (idx !== -1) {
      savedCategory = {
        ...updatedList[idx],
        ...categoryData,
        display_id: formatSeqId(categoryData.display_id || updatedList[idx].display_id || idx + 1)
      };
      updatedList[idx] = savedCategory;
    }
  } else {
    // Create new
    const nextOrder = updatedList.length > 0 
      ? Math.max(...updatedList.map((c) => c.display_order || 0)) + 1 
      : 1;
    const nextSeq = formatSeqId(nextOrder);
    const newId = 'c1000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');
    const slug = (categoryData.name || 'category')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    savedCategory = {
      id: newId,
      restaurant_id: RESTAURANT_ID,
      name: categoryData.name,
      slug: slug,
      display_order: categoryData.display_order || nextOrder,
      display_id: nextSeq,
      is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
      created_at: new Date().toISOString()
    };
    updatedList.push(savedCategory);
  }

  // Sort by display order
  updatedList.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // Save to local cache
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedList));

  // Attempt Supabase sync
  try {
    const { error } = await supabase.from('menu_categories').upsert({
      id: savedCategory.id,
      restaurant_id: RESTAURANT_ID,
      name: savedCategory.name,
      slug: savedCategory.slug,
      display_order: savedCategory.display_order,
      display_id: savedCategory.display_id,
      is_active: savedCategory.is_active
    });
    if (error) {
      console.warn('Supabase category upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase category sync notice:', err);
  }

  broadcastChange('CATEGORIES_UPDATED', updatedList);
  return { success: true, category: savedCategory, categories: updatedList };
}

export async function deleteCategory(categoryId) {
  // SAFETY CHECK: Prevent accidental deletion when products are assigned to this category
  const items = await getMenuItems();
  const assignedItems = items.filter(
    (i) => i.category_id === categoryId || i.category === categoryId
  );

  if (assignedItems.length > 0) {
    return {
      success: false,
      error: `Cannot delete category: ${assignedItems.length} menu item(s) are assigned to it (e.g. "${assignedItems[0].name}"). Please reassign or delete them first.`
    };
  }

  const currentCategories = await getCategories();
  const updatedList = currentCategories.filter((c) => c.id !== categoryId);

  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedList));

  try {
    await supabase.from('menu_categories').delete().eq('id', categoryId);
  } catch (err) {
    console.warn('Supabase category delete notice:', err);
  }

  broadcastChange('CATEGORIES_UPDATED', updatedList);
  return { success: true, categories: updatedList };
}

// ==============================================================================
// 3. MENU MANAGEMENT MODULE
// ==============================================================================

export async function getMenuItems() {
  let items = [];

  // Check cached
  const cached = localStorage.getItem(STORAGE_KEYS.ITEMS);
  if (cached) {
    try {
      items = JSON.parse(cached);
    } catch (e) {
      console.warn('Error parsing cached menu items', e);
    }
  }

  // Fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('item_number', { ascending: true });

    if (data && !error && data.length > 0) {
      // Merge with any locally added/edited items that might not have pushed
      const dbMap = new Map(data.map((d) => [d.id, d]));
      const merged = data.map((d) => {
        const local = items.find((i) => i.id === d.id);
        return {
          ...d,
          ...(local || {}),
          price: Number(local?.price !== undefined ? local.price : d.price),
          is_available: local?.is_available !== undefined ? local.is_available : d.is_available,
          display_id: formatSeqId(d.display_id || d.item_number)
        };
      });

      // Add any locally created items not in DB yet
      items.forEach((loc) => {
        if (!dbMap.has(loc.id)) {
          merged.push(loc);
        }
      });

      items = merged;
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    }
  } catch (err) {
    console.warn('Supabase items fetch error:', err);
  }

  // Sort by item_number and ensure sequential display_id
  items.sort((a, b) => (a.item_number || 0) - (b.item_number || 0));
  items = items.map((item, idx) => ({
    ...item,
    display_id: formatSeqId(item.display_id || item.item_number || idx + 1),
    unit: item.unit || 'Portion',
    unit_plural: item.unit_plural || 'Portions'
  }));

  return items;
}

export async function saveMenuItem(itemData) {
  const currentItems = await getMenuItems();
  let updatedList = [...currentItems];
  let savedItem = null;

  if (itemData.id) {
    // Edit existing
    const idx = updatedList.findIndex((i) => i.id === itemData.id);
    if (idx !== -1) {
      savedItem = {
        ...updatedList[idx],
        ...itemData,
        price: Number(itemData.price),
        display_id: formatSeqId(itemData.display_id || itemData.item_number || updatedList[idx].item_number)
      };
      updatedList[idx] = savedItem;
    }
  } else {
    // Create new
    const nextNumber = updatedList.length > 0
      ? Math.max(...updatedList.map((i) => i.item_number || 0)) + 1
      : 1;
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : ('b1000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0'));

    savedItem = {
      id: newId,
      restaurant_id: RESTAURANT_ID,
      category_id: itemData.category_id || null,
      item_number: nextNumber,
      display_id: formatSeqId(nextNumber),
      name: itemData.name,
      aliases: itemData.aliases || [itemData.name.toLowerCase()],
      price: Number(itemData.price),
      description: itemData.description || '',
      unit: itemData.unit || 'Portion',
      unit_plural: itemData.unit_plural || 'Portions',
      photo_url: itemData.photo_url || null,
      is_available: itemData.is_available !== undefined ? itemData.is_available : true,
      has_sizes: Boolean(itemData.has_sizes),
      sizes: itemData.sizes || null,
      created_at: new Date().toISOString()
    };
    updatedList.push(savedItem);
  }

  // Sort and persist locally
  updatedList.sort((a, b) => (a.item_number || 0) - (b.item_number || 0));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedList));

  // Attempt Supabase sync
  try {
    const payload = {
      id: savedItem.id,
      restaurant_id: RESTAURANT_ID,
      category_id: savedItem.category_id,
      item_number: savedItem.item_number,
      name: savedItem.name,
      aliases: savedItem.aliases,
      price: savedItem.price,
      photo_url: savedItem.photo_url,
      is_available: savedItem.is_available,
      description: savedItem.description,
      unit: savedItem.unit,
      unit_plural: savedItem.unit_plural,
      has_sizes: savedItem.has_sizes,
      sizes: savedItem.sizes,
      display_id: savedItem.display_id
    };

    const { error } = await supabase.from('menu_items').upsert(payload);
    if (error) {
      console.warn('Supabase menu item upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase menu item sync notice:', err);
  }

  broadcastChange('MENU_ITEMS_UPDATED', updatedList);
  return { success: true, item: savedItem, items: updatedList };
}

export async function deleteMenuItem(itemId) {
  const currentItems = await getMenuItems();
  const updatedList = currentItems.filter((i) => i.id !== itemId);

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedList));

  try {
    await supabase.from('menu_items').delete().eq('id', itemId);
  } catch (err) {
    console.warn('Supabase menu item delete notice:', err);
  }

  broadcastChange('MENU_ITEMS_UPDATED', updatedList);
  return { success: true, items: updatedList };
}

export async function toggleItemAvailability(itemId, currentVal) {
  const newVal = !currentVal;
  const currentItems = await getMenuItems();
  const updatedList = currentItems.map((i) =>
    i.id === itemId ? { ...i, is_available: newVal } : i
  );

  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedList));

  try {
    await supabase
      .from('menu_items')
      .update({ is_available: newVal })
      .eq('id', itemId);
  } catch (err) {
    console.warn('Supabase availability toggle notice:', err);
  }

  broadcastChange('MENU_ITEMS_UPDATED', updatedList);
  return { success: true, is_available: newVal, items: updatedList };
}
