export type Skill = {
  id: string;
  name: string;
  category: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  repo_url: string | null;
  image_url: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  skills?: Skill[];
};