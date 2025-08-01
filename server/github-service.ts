import { z } from "zod";

// GitHub API types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  license: {
    key: string;
    name: string;
  } | null;
  topics: string[];
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  releases_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: {
    id: number;
    name: string;
    download_count: number;
    browser_download_url: string;
    size: number;
  }[];
}

export interface SoftwareItem {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  stars: number;
  license: string;
  downloadUrl: string;
  projectUrl: string;
  imageUrl: string;
  isFree: boolean;
  lastUpdated: string;
  language: string;
  downloads: number;
}

// Category mapping based on topics and language
const CATEGORY_MAPPING: Record<string, string[]> = {
  "Utilities": ["utility", "tool", "cli", "command-line", "productivity", "automation", "system"],
  "Media": ["media", "video", "audio", "image", "graphics", "multimedia", "streaming", "player"],
  "Communication": ["chat", "messaging", "email", "communication", "social", "network", "discord", "telegram"],
  "Business": ["business", "finance", "accounting", "crm", "enterprise", "management", "analytics"],
  "Games": ["game", "gaming", "unity", "godot", "pygame", "gamedev"],
  "Development": ["development", "programming", "code", "developer", "ide", "editor", "framework", "library"],
  "Security": ["security", "encryption", "password", "auth", "authentication", "cybersecurity"],
  "Education": ["education", "learning", "tutorial", "documentation", "study"],
};

const LANGUAGE_CATEGORY_MAPPING: Record<string, string> = {
  "JavaScript": "Development",
  "TypeScript": "Development",
  "Python": "Development",
  "Java": "Development",
  "C++": "Development",
  "C#": "Development",
  "Go": "Development",
  "Rust": "Development",
  "Swift": "Development",
  "Kotlin": "Development",
  "Ruby": "Development",
  "PHP": "Development",
  "Shell": "Utilities",
  "PowerShell": "Utilities",
  "Dockerfile": "Utilities",
};

export class GitHubService {
  private readonly baseUrl = "https://api.github.com";
  private readonly rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  private async makeRequest(endpoint: string): Promise<any> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SoftwareHub-App'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("GitHub API rate limit exceeded. Please try again later.");
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GitHub API request failed:", error);
      throw error;
    }
  }

  private categorizeRepository(repo: GitHubRepository): string {
    const topics = repo.topics || [];
    const language = repo.language?.toLowerCase() || "";
    
    // Check topics first
    for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
      if (topics.some(topic => keywords.includes(topic.toLowerCase()))) {
        return category;
      }
    }
    
    // Check description keywords
    const description = repo.description?.toLowerCase() || "";
    for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        return category;
      }
    }
    
    // Check language
    if (repo.language && LANGUAGE_CATEGORY_MAPPING[repo.language]) {
      return LANGUAGE_CATEGORY_MAPPING[repo.language];
    }
    
    return "Utilities"; // Default category
  }

  private async getLatestRelease(repoFullName: string): Promise<GitHubRelease | null> {
    try {
      const release = await this.makeRequest(`/repos/${repoFullName}/releases/latest`);
      return release;
    } catch (error) {
      // If no releases found, return null
      return null;
    }
  }

  private transformRepositoryToSoftware(repo: GitHubRepository, release?: GitHubRelease | null): SoftwareItem {
    const category = this.categorizeRepository(repo);
    const version = release?.tag_name || "latest";
    const downloadUrl = release?.assets?.[0]?.browser_download_url || repo.html_url;
    const downloads = release?.assets?.reduce((sum, asset) => sum + asset.download_count, 0) || 0;
    
    return {
      id: `github_${repo.id}`,
      name: repo.name,
      description: repo.description || "No description available",
      category,
      version,
      stars: repo.stargazers_count,
      license: repo.license?.name || "No license",
      downloadUrl,
      projectUrl: repo.html_url,
      imageUrl: repo.owner.avatar_url,
      isFree: true, // GitHub repositories are typically free
      lastUpdated: repo.updated_at,
      language: repo.language || "Unknown",
      downloads
    };
  }

  async searchRepositories(query: string, category?: string, page = 1, perPage = 30): Promise<{
    items: SoftwareItem[];
    total: number;
  }> {
    try {
      let searchQuery = query;
      
      // Add category-specific keywords to search
      if (category && CATEGORY_MAPPING[category]) {
        const categoryKeywords = CATEGORY_MAPPING[category].slice(0, 3).join(" OR ");
        searchQuery += ` ${categoryKeywords}`;
      }
      
      const endpoint = `/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&page=${page}&per_page=${perPage}`;
      const data = await this.makeRequest(endpoint);
      
      const items: SoftwareItem[] = [];
      
      for (const repo of data.items) {
        const release = await this.getLatestRelease(repo.full_name);
        const software = this.transformRepositoryToSoftware(repo, release);
        
        // Filter by category if specified
        if (!category || software.category === category) {
          items.push(software);
        }
      }
      
      return {
        items,
        total: data.total_count
      };
    } catch (error) {
      console.error("Failed to search repositories:", error);
      throw error;
    }
  }

  async getPopularRepositories(category?: string, page = 1, perPage = 30): Promise<{
    items: SoftwareItem[];
    total: number;
  }> {
    const query = category ? `topic:${CATEGORY_MAPPING[category]?.[0] || category.toLowerCase()}` : "stars:>1000";
    return this.searchRepositories(query, category, page, perPage);
  }

  async getRecentlyUpdatedRepositories(category?: string, page = 1, perPage = 30): Promise<{
    items: SoftwareItem[];
    total: number;
  }> {
    const baseQuery = "pushed:>2024-01-01";
    const query = category ? `${baseQuery} topic:${CATEGORY_MAPPING[category]?.[0] || category.toLowerCase()}` : baseQuery;
    return this.searchRepositories(query, category, page, perPage);
  }

  async getTrendingRepositories(category?: string, page = 1, perPage = 30): Promise<{
    items: SoftwareItem[];
    total: number;
  }> {
    const baseQuery = "created:>2024-01-01";
    const query = category ? `${baseQuery} topic:${CATEGORY_MAPPING[category]?.[0] || category.toLowerCase()}` : baseQuery;
    return this.searchRepositories(query, category, page, perPage);
  }

  getAvailableCategories(): string[] {
    return Object.keys(CATEGORY_MAPPING);
  }
}

export const githubService = new GitHubService();