export interface ProjectMetric {
  label: string;
  value: string;
}

export type ProjectCategory = 
  | "All Systems" 
  | "Voice AI Agents" 
  | "n8n Orchestration" 
  | "Full-Stack OS Portals";

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: "Voice AI Agents" | "n8n Orchestration" | "Full-Stack OS Portals";
  liveUrl: string;
  githubUrl?: string;
  image?: string;
  description: string;
  metrics: ProjectMetric[];
  techStack: string[];
  badge?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LeadInquiry {
  id: string;
  agencyName: string;
  contactName: string;
  email: string;
  phone?: string;
  monthlyLeads: string;
  biggestBottleneck: string;
  preferredModel: string;
  notes?: string;
  createdAt: string;
  status: "new" | "contacted" | "booked";
}
