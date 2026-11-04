import React, { useState } from 'react';
import { Property } from '../../types';
import { formatPKR, formatArea } from '../../lib/formatters';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Plus, 
  Edit, 
  Archive, 
  Eye, 
  CheckCircle2, 
  MapPin, 
  Bed, 
  Bath, 
  ShieldCheck, 
  X,
  Image as ImageIcon
} from 'lucide-react';

interface PropertiesManagerViewProps {
  properties: Property[];
  onRefresh: () => void;
}

export const PropertiesManagerView: React.FC<PropertiesManagerViewProps> = ({
  properties,
  onRefresh,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'House' | 'Apartment' | 'Plot' | 'Commercial'>('House');
  const [city, setCity] = useState('Lahore');
  const [areaName, setAreaName] = useState('DHA Phase 6');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState<number>(35000000);
  const [areaSize, setAreaSize] = useState<number>(1);
  const [areaUnit, setAreaUnit] = useState<'Marla' | 'Kanal' | 'Sq Ft' | 'Sq Yd'>('Kanal');
  const [beds, setBeds] = useState<number>(5);
  const [baths, setBaths] = useState<number>(6);
  const [gatedCommunity, setGatedCommunity] = useState(true);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');
  const [description, setDescription] = useState('');
  const [financingAvailable, setFinancingAvailable] = useState('Cash or Bank Financing');

  const openAddModal = () => {
    setEditingProperty(null);
    setTitle('');
    setCategory('House');
    setCity('Lahore');
    setAreaName('DHA Phase 6');
    setAddress('Sector J, Phase 6, DHA, Lahore');
    setPrice(45000000);
    setAreaSize(1);
    setAreaUnit('Kanal');
    setBeds(5);
    setBaths(6);
    setGatedCommunity(true);
    setImageUrl('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');
    setDescription('Brand new custom-built luxury villa featuring imported Spanish tiles and designer fittings.');
    setFinancingAvailable('Cash or Bank Financing');
    setModalOpen(true);
  };

  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setTitle(prop.title);
    setCategory(prop.property_category || 'House');
    setCity(prop.city || 'Lahore');
    setAreaName(prop.area_name || '');
    setAddress(prop.address || '');
    setPrice(prop.price);
    setAreaSize(prop.area_size || 1);
    setAreaUnit(prop.area_unit || 'Kanal');
    setBeds(prop.beds || 4);
    setBaths(prop.baths || 5);
    setGatedCommunity(prop.gated_community);
    setImageUrl(prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');
    setDescription(prop.description || '');
    setFinancingAvailable(prop.financing_available || 'Cash');
    setModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const payload = {
        title,
        slug,
        property_category: category,
        property_type: `${areaSize} ${areaUnit} ${category}`,
        city,
        area_name: areaName,
        address,
        price: Number(price),
        area_size: Number(areaSize),
        area_unit: areaUnit,
        sqft: areaUnit === 'Kanal' ? areaSize * 4500 : areaSize * 225,
        beds: Number(beds),
        baths: Number(baths),
        gated_community: gatedCommunity,
        images: [imageUrl],
        description,
        financing_available: financingAvailable,
        status: 'active'
      };

      if (editingProperty) {
        await supabase.from('properties').update(payload).eq('id', editingProperty.id);
      } else {
        await supabase.from('properties').insert(payload);
      }

      setModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (prop: Property) => {
    try {
      const newStatus = prop.status === 'archived' ? 'active' : 'archived';
      await supabase.from('properties').update({ status: newStatus }).eq('id', prop.id);
      onRefresh();
    } catch (err) {
      console.error('Error archiving property:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-slate-100">
            Property Portfolio Manager
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            All listings are stored dynamically in Supabase database. Add, edit, or archive without touching code.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Listing
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((prop) => {
          const isArchived = prop.status === 'archived';

          return (
            <div
              key={prop.id}
              className={`rounded-2xl border bg-[#0d1424] overflow-hidden flex flex-col transition-all ${
                isArchived ? 'opacity-60 border-slate-800' : 'border-slate-800 hover:border-gold-500/40'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-gold-400 border border-gold-500/30">
                    {prop.property_category || 'House'}
                  </span>
                  {prop.gated_community && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Gated
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    isArchived
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {prop.status}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
                  <span className="text-lg font-serif font-bold text-gold-300 drop-shadow">
                    {formatPKR(prop.price)}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {formatArea(prop.area_size, prop.area_unit)}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
                    {prop.title}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span className="truncate">{prop.area_name}, {prop.city}</span>
                  </p>

                  {prop.property_category !== 'Plot' && (
                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      {prop.beds && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          {prop.beds} Beds
                        </span>
                      )}
                      {prop.baths && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          {prop.baths} Baths
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEditModal(prop)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-gold-400" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleArchive(prop)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isArchived
                        ? 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    {isArchived ? 'Restore' : 'Archive'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Listing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0c1220] border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold-400" />
                {editingProperty ? 'Edit Property Listing' : 'Add New Property Listing'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Property Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Kanal Modern Designer Villa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  >
                    <option value="House">House / Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Plot">Residential Plot</option>
                    <option value="Commercial">Commercial Plaza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Area / Society</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHA Phase 6, Bahria Town, E-7, Clifton"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Price in PKR (Lakh / Crore)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500 font-mono"
                  />
                  <span className="text-[10px] text-gold-400 mt-0.5 block">
                    Displays as: {formatPKR(price)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Area Size</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={areaSize}
                      onChange={(e) => setAreaSize(Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500 font-mono"
                    />
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value as any)}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                    >
                      <option value="Marla">Marla</option>
                      <option value="Kanal">Kanal</option>
                      <option value="Sq Ft">Sq Ft</option>
                      <option value="Sq Yd">Sq Yd</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Beds & Baths</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Beds"
                      value={beds}
                      onChange={(e) => setBeds(Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                    />
                    <input
                      type="number"
                      placeholder="Baths"
                      value={baths}
                      onChange={(e) => setBaths(Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Full physical address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Image URL (High-Res Photo)</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gatedCommunity}
                      onChange={(e) => setGatedCommunity(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-gold-500 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300">
                      Gated Society / Security Checkpoint (Will issue 4-digit security code for verified walkthroughs)
                    </span>
                  </label>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs shadow-lg transition-colors"
                >
                  {loading ? 'Saving...' : editingProperty ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
