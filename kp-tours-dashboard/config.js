// KPK TOURS - Client Dashboard Configuration
// Realtime-enabled client config (using publishable anon key)
window.APP_CONFIG = {
  SUPABASE_URL: window.ENV_SUPABASE_URL || 'https://xfwaborsrhavnltjbtfc.supabase.co',
  SUPABASE_ANON_KEY: window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmd2Fib3Jzcmhhdm5sdGpidGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMDc0NjIsImV4cCI6MjEwOTc4MzQ2Mn0.oRdkMZsdUPr9_ugi16cvrWEV2Z_oizdg4p-vlohO6sI',
  N8N_BASE_URL: window.ENV_N8N_BASE_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/kp-tours/dashboard',
  GATEWAY_STATUS_URL: '/status'
};
