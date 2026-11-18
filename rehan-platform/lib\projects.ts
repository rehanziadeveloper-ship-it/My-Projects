import fs from "fs";
import path from "path";
import { Project } from "./types";

const dataFilePath = path.join(process.cwd(), "data", "projects.json");

export function getProjects(): Project[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const projects: Project[] = JSON.parse(fileData);
    // Sort with featured first, then newest
    return projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

export function saveProject(newProjectData: Partial<Project>): { success: boolean; project?: Project; error?: string } {
  try {
    if (!newProjectData.title || !newProjectData.liveUrl) {
      return { success: false, error: "Title and Live URL are mandatory fields." };
    }

    const projects = getProjects();
    
    // Generate clean slug and ID if not provided
    const slug = newProjectData.slug || newProjectData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const id = newProjectData.id || `${slug}-${Date.now().toString(36)}`;

    const existingIndex = projects.findIndex(p => p.id === id || p.slug === slug);

    const project: Project = {
      id,
      slug,
      title: newProjectData.title,
      category: newProjectData.category || "Full-Stack OS Portals",
      liveUrl: newProjectData.liveUrl,
      githubUrl: newProjectData.githubUrl || "https://github.com/rehanziadeveloper-ship-it/My-Projects",
      image: newProjectData.image || "/images/solutions/default.png",
      description: newProjectData.description || "Autonomous production system engineered for high-availability agency operations.",
      metrics: newProjectData.metrics && newProjectData.metrics.length > 0 
        ? newProjectData.metrics 
        : [
            { label: "Deployment", value: "Verified Production" },
            { label: "Integrations", value: "Full-Stack Connected" }
          ],
      techStack: newProjectData.techStack && newProjectData.techStack.length > 0
        ? newProjectData.techStack
        : ["n8n", "Next.js", "AI Agent Engine"],
      badge: newProjectData.badge || "Live Verified",
      featured: typeof newProjectData.featured === "boolean" ? newProjectData.featured : false,
      createdAt: newProjectData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = { ...projects[existingIndex], ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift(project);
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(projects, null, 2), "utf8");
    return { success: true, project };
  } catch (error: any) {
    console.error("Error saving project:", error);
    return { success: false, error: error.message || "Failed to persist project." };
  }
}

export function deleteProject(id: string): boolean {
  try {
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== id && p.slug !== id);
    if (filtered.length === projects.length) return false;
    fs.writeFileSync(dataFilePath, JSON.stringify(filtered, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
}
