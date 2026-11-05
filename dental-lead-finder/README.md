# Client Lead Prospector (Standalone Web Application)

Standalone AI-powered lead prospecting and Google Maps contact extraction tool.

## Features
- **Search Query Input:** Search any local business or dental clinic title in any city.
- **Lead Volume:** 50 to 100 leads per execution.
- **Data Extracted:**
  - Business / Clinic Title
  - Direct Phone (with click-to-dial & WhatsApp link)
  - Official Website (with indicator if website is missing)
  - Contact Emails (with 1-click copy)
  - Instagram Profile Link
  - Facebook Page Link
  - Google Star Rating & Review Count
  - Google Maps Listing URL
- **Google Sheets CRM Sync:** Auto-appends rows to spreadsheet `1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo` (`Apify_Dental_Leads` tab).
- **Cold Outreach Script Generator:** Trojan Horse Offer ($800–$1,200 website) & 24/7 Web Concierge Upsell.
- **CSV Export:** 1-click export of current filtered view.

## Stack
- Vite 5 + React 18 + TypeScript + Tailwind CSS + Lucide Icons
- n8n Automation Webhook (`/webhook/scrape-dental-leads`)
- Apify Google Places Crawler (`compass/crawler-google-places`)
