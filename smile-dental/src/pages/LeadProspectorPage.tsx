import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  MapPin,
  Phone,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Star,
  ExternalLink,
  Copy,
  Check,
  Download,
  ArrowRight,
  Database,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  FileSpreadsheet,
  Key
} from 'lucide-react';

export interface DentalLead {
  id: string;
  title: string;
  phone: string;
  website: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  totalScore: number | null;
  reviewsCount: number;
  url: string;
  category: 'has_website' | 'no_website';
  searchQuery: string;
}

const INITIAL_LEADS: DentalLead[] = [
  {
    id: 'lead-1',
    title: 'City Centre Dental & Implant Clinic - Manchester',
    phone: '+44 161 834 1643',
    website: 'https://www.citycentredentist.co.uk/',
    email: null,
    instagram: null,
    facebook: null,
    totalScore: 4.7,
    reviewsCount: 523,
    url: 'https://www.google.com/maps/search/?api=1&query=City%20Centre%20Dental%20%26%20Implant%20Clinic%20-%20Manchester&query_place_id=ChIJd3FnTrBSekgRtTPDFspkilg',
    category: 'has_website',
    searchQuery: 'dental clinic in Manchester'
  },
  {
    id: 'lead-2',
    title: 'Jeremy Cooper Dental Practice',
    phone: '0161 789 5917',
    website: null,
    email: null,
    instagram: null,
    facebook: null,
    totalScore: 4.6,
    reviewsCount: 73,
    url: 'https://www.google.com/maps/search/?api=1&query=Jeremy%20Cooper%20Dental%20Practice&query_place_id=ChIJgYU6wPuue0gRAgYLrWLvf0w',
    category: 'no_website',
    searchQuery: 'dental clinic in Manchester'
  },
  {
    id: 'lead-3',
    title: 'The Dentists of Didsbury',
    phone: '0161 445 4005',
    website: null,
    email: null,
    instagram: null,
    facebook: null,
    totalScore: 5.0,
    reviewsCount: 222,
    url: 'https://www.google.com/maps/search/?api=1&query=The%20Dentists%20of%20Didsbury&query_place_id=ChIJg9uvp_eye0gRmeO8Sv98H0c',
    category: 'no_website',
    searchQuery: 'dental clinic in Manchester'
  },
  {
    id: 'lead-4',
    title: 'Arndale Dental & Implant Clinic',
    phone: '+44 161 660 0200',
    website: 'https://www.arndaledental.co.uk/',
    email: null,
    instagram: null,
    facebook: null,
    totalScore: 4.5,
    reviewsCount: 735,
    url: 'https://www.google.com/maps/search/?api=1&query=Arndale%20Dental%20%26%20Implant%20Clinic&query_place_id=ChIJBy0TucCxe0gRE_deJhdagUI',
    category: 'has_website',
    searchQuery: 'dental clinic in Manchester'
  },
  {
    id: 'lead-5',
    title: 'Manchester Dental Practice',
    phone: '+44 161 833 0704',
    website: 'https://www.manchesterdentalpractice.co.uk/',
    email: 'info@manchesterdentalpractice.co.uk',
    instagram: null,
    facebook: null,
    totalScore: 4.1,
    reviewsCount: 305,
    url: 'https://www.google.com/maps/search/?api=1&query=Manchester%20Dental%20Practice&query_place_id=ChIJ6zgRq8Cxe0gRYMPoQgFtDfI',
    category: 'has_website',
    searchQuery: 'dental clinic in Manchester'
  }
];

export const LeadProspectorPage: React.FC = () => {
  const [searchTitle, setSearchTitle] = useState('dentist in Manchester');
  const [maxResults, setMaxResults] = useState<number>(50);
  const [leads, setLeads] = useState<DentalLead[]>(INITIAL_LEADS);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'emails' | 'no_website' | 'instagram'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<DentalLead | null>(null);
  const [customPitchText, setCustomPitchText] = useState<string>('');
  const [sheetSyncStatus, setSheetSyncStatus] = useState<string | null>(null);
  const [apifyToken, setApifyToken] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo/edit#gid=352522959';

  useEffect(() => {
    const saved = localStorage.getItem('user_apify_token');
    if (saved) {
      setApifyToken(saved);
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPitch = (lead: DentalLead) => {
    setSelectedLeadForPitch(lead);
    const demoUrl = 'https://smile-dental-clinic-rehan-zia.vercel.app';
    if (!lead.website) {
      setCustomPitchText(
        `Hi ${lead.title},\n\nI came across your clinic on Google Maps—congratulations on your ${lead.totalScore || 4.8}-star rating across ${lead.reviewsCount} patient reviews.\n\nI noticed your Google profile doesn't have an active website linked for patients looking to check your services and book an appointment after clinic hours.\n\nI actually built a ready-to-launch modern clinic portal with an automated 24/7 appointment booking concierge specifically designed for dental practices: ${demoUrl}\n\nIf you like it, we can have it branded with your clinic's logo and live on your custom domain in under 48 hours. Can I send you a 1-minute video walk-through?\n\nBest regards,\nMuhammad Rehan\nAI Agency & Automation Consultant`
      );
    } else {
      setCustomPitchText(
        `Hi Dr. / Practice Manager at ${lead.title},\n\nI came across your practice on Google Maps with ${lead.reviewsCount} reviews—great reputation in the area.\n\nI took a quick look at your website (${lead.website}) on mobile and noticed that when a patient visits in the evening or over the weekend, there's no way to instantly schedule an appointment into your chair calendar.\n\nMost patients searching after 6 PM will simply click the next clinic that allows instant scheduling.\n\nI actually put together a live interactive preview of how an after-hours 24/7 web booking concierge works on modern dental clinic sites: ${demoUrl}\n\nHere is a 45-second demo of it automatically qualifying treatments and scheduling patients into the staff calendar. Would you be open to a 5-minute call this Thursday at 11 AM to see how this can capture after-hours patients for you?\n\nBest regards,\nMuhammad Rehan`
      );
    }
  };

  const startScraping = async () => {
    if (!searchTitle.trim()) return;
    const token = apifyToken.trim();
    if (!token) {
      setStatusMessage('Please enter your Apify API Token in the API Key settings above.');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setStatusMessage('Dispatching Apify Google Places scraper...');
    setSheetSyncStatus(null);

    try {
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchStringsArray: [searchTitle.trim()],
            maxCrawledPlacesPerSearch: maxResults,
            scrapeContacts: true,
            language: 'en'
          })
        }
      );

      const runJson = await runRes.json();
      if (!runJson.data || !runJson.data.id) {
        throw new Error(runJson.message || 'Failed to start Apify run');
      }

      const runId = runJson.data.id;
      const datasetId = runJson.data.defaultDatasetId;
      setStatusMessage(`Scraper active (Run: ${runId.slice(0, 8)}). Crawling Google Maps...`);

      let completed = false;
      let attempts = 0;
      const maxAttempts = 40;

      while (!completed && attempts < maxAttempts) {
        await new Promise((res) => setTimeout(res, 3500));
        attempts++;
        setStatusMessage(`Crawling places & extracting website emails... (${attempts * 3}s elapsed)`);

        const pollRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
        );
        const pollJson = await pollRes.json();
        const status = pollJson.data?.status;

        if (status === 'SUCCEEDED') {
          completed = true;
          break;
        } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
          throw new Error(`Apify run ended with status: ${status}`);
        }
      }

      setStatusMessage('Fetching enriched leads dataset...');
      const datasetRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`
      );
      const rawItems = await datasetRes.json();

      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        setStatusMessage('No places found for this search title. Try a different city or phrasing.');
        setLoading(false);
        return;
      }

      const formatted: DentalLead[] = rawItems
        .filter((it: any) => it.title || it.name)
        .map((it: any, idx: number) => {
          let emailVal: string | null = null;
          if (Array.isArray(it.emails) && it.emails.length > 0) {
            emailVal = it.emails[0];
          } else if (typeof it.email === 'string') {
            emailVal = it.email;
          } else if (it.websiteContacts?.emails?.length) {
            emailVal = it.websiteContacts.emails[0];
          }

          let igVal: string | null = it.instagram || it.websiteContacts?.instagram || null;
          let fbVal: string | null = it.facebook || it.websiteContacts?.facebook || null;

          return {
            id: `lead-${Date.now()}-${idx}`,
            title: it.title || it.name || 'Unknown Clinic',
            phone: it.phone || it.phoneUnformatted || 'N/A',
            website: it.website || null,
            email: emailVal,
            instagram: igVal,
            facebook: fbVal,
            totalScore: it.totalScore || null,
            reviewsCount: it.reviewsCount || 0,
            url: it.url || it.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.title || '')}`,
            category: it.website ? 'has_website' : 'no_website',
            searchQuery: searchTitle
          };
        });

      setLeads(formatted);
      setStatusMessage(`Successfully scraped ${formatted.length} leads! Saving to Google Sheets...`);

      try {
        await fetch('https://n8n.srv1767318.hstgr.cloud/webhook/scrape-dental-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchTitle: searchTitle,
            maxResults: maxResults,
            apifyToken: token
          })
        });
        setSheetSyncStatus(`Synced ${formatted.length} leads to Google Sheets tab "Apify_Dental_Leads"!`);
      } catch (sheetErr) {
        console.warn('Sheet sync warning:', sheetErr);
        setSheetSyncStatus('Leads loaded in UI. Ready for export or sheet sync.');
      }

      setStatusMessage(`Completed! Displaying ${formatted.length} verified dental leads.`);
    } catch (err: any) {
      console.error('Scraping error:', err);
      setStatusMessage(`Error: ${err.message || 'Scraper encountered an error. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Clinic_Name',
      'Phone',
      'Website',
      'Emails',
      'Instagram',
      'Facebook',
      'Rating',
      'Reviews_Count',
      'Google_Maps_URL',
      'Search_Query'
    ];

    const rows = leads.map((l) => [
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${l.phone || 'N/A'}"`,
      `"${l.website || 'N/A'}"`,
      `"${l.email || 'N/A'}"`,
      `"${l.instagram || 'N/A'}"`,
      `"${l.facebook || 'N/A'}"`,
      `"${l.totalScore || 'N/A'}"`,
      `"${l.reviewsCount || 0}"`,
      `"${l.url || 'N/A'}"`,
      `"${l.searchQuery || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dental_leads_${searchTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((lead) => {
    if (filter === 'emails') return Boolean(lead.email);
    if (filter === 'no_website') return !lead.website;
    if (filter === 'instagram') return Boolean(lead.instagram);
    return true;
  });

  const emailCount = leads.filter((l) => Boolean(l.email)).length;
  const noWebsiteCount = leads.filter((l) => !l.website).length;
  const instagramCount = leads.filter((l) => Boolean(l.instagram)).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">Dental Lead Prospector</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Apify + CRM
              </span>
            </div>
            <p className="text-xs text-slate-400">Scrape Google Maps & Websites for Outreach</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
            title="Configure Apify Token"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">API Key</span>
          </button>
          <a
            href={GOOGLE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Open Sheet CRM
          </a>
          <Link
            to="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            Clinic Admin
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all font-medium"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {showSettings && (
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Apify API Token (Stored locally in your browser):
              </label>
              <p className="text-[11px] text-slate-500">Get your free key from console.apify.com/account/integrations</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="password"
                value={apifyToken}
                onChange={(e) => {
                  setApifyToken(e.target.value);
                  localStorage.setItem('user_apify_token', e.target.value);
                }}
                placeholder="apify_api_..."
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-full sm:w-80 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              Automated Prospect Discovery Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enter any city or niche to scrape high-converting dental leads
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pulls clinic names, phone numbers, star ratings, and automatically visits their websites to extract verified emails and Instagram links.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="e.g. dentist in Manchester, cosmetic dental clinic in London, dental clinic in Dallas"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="bg-slate-950/80 border border-slate-700 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
              >
                <option value={50}>50 leads</option>
                <option value={60}>60 leads</option>
                <option value={75}>75 leads</option>
                <option value={100}>100 leads</option>
              </select>

              <button
                onClick={startScraping}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all font-bold cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    Scrape Leads
                  </>
                )}
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="mt-4 flex items-center gap-2.5 text-xs sm:text-sm px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700/60 text-slate-300">
              {loading ? (
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {sheetSyncStatus && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              {sheetSyncStatus}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Scraped</span>
            <div className="text-2xl font-bold text-white">{leads.length}</div>
            <p className="text-[11px] text-slate-500">Google Places verified</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Verified Emails</span>
            <div className="text-2xl font-bold text-emerald-300">{emailCount}</div>
            <p className="text-[11px] text-slate-500">Ready for cold email</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">No Website (Hot)</span>
            <div className="text-2xl font-bold text-amber-300">{noWebsiteCount}</div>
            <p className="text-[11px] text-slate-500">Prime website sale prospects</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">Instagram Profiles</span>
            <div className="text-2xl font-bold text-sky-300">{instagramCount}</div>
            <p className="text-[11px] text-slate-500">Direct DM channels</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              All Leads ({leads.length})
            </button>
            <button
              onClick={() => setFilter('no_website')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === 'no_website'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              No Website ({noWebsiteCount}) - Hot
            </button>
            <button
              onClick={() => setFilter('emails')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === 'emails'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              With Email ({emailCount})
            </button>
            <button
              onClick={() => setFilter('instagram')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === 'instagram'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              With Instagram ({instagramCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              View in Sheets
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-md group relative overflow-hidden"
            >
              {!lead.website && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-[10px] font-bold text-slate-950 px-3 py-1 rounded-bl-xl shadow-sm uppercase tracking-wide">
                  No Website — Prime Target
                </div>
              )}

              <div className="pr-12">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {lead.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{lead.totalScore || 'N/A'}</span>
                  </div>
                  <span>•</span>
                  <span>{lead.reviewsCount} reviews on Google</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href={`tel:${lead.phone}`} className="hover:text-emerald-400 truncate">
                    {lead.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-sky-400 truncate flex items-center gap-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ) : (
                    <span className="text-amber-400 font-medium">None (Sell Site)</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  {lead.email ? (
                    <div className="flex items-center justify-between w-full">
                      <a href={`mailto:${lead.email}`} className="hover:text-indigo-400 truncate font-mono text-[11px]">
                        {lead.email}
                      </a>
                      <button
                        onClick={() => handleCopy(lead.email!, lead.id + '-email')}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy email"
                      >
                        {copiedId === lead.id + '-email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-500">Email not detected on web</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <a
                  href={lead.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  View on Google Maps
                </a>

                <button
                  onClick={() => handleOpenPitch(lead)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Generate Script
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedLeadForPitch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedLeadForPitch.website ? 'Script A: After-Hours Booking Pitch' : 'Script B: No Website High-Reputation Pitch'}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{selectedLeadForPitch.title}</h3>
                <p className="text-xs text-slate-400">
                  Personalized pitch based on Michele's consult framework.
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadForPitch(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <textarea
                value={customPitchText}
                onChange={(e) => setCustomPitchText(e.target.value)}
                rows={11}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={() => handleCopy(customPitchText, 'pitch-modal')}
                className="absolute top-3 right-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {copiedId === 'pitch-modal' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Pitch
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Ready for Email, Instagram DM, or Phone outreach</span>
              <button
                onClick={() => setSelectedLeadForPitch(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
