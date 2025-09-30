export interface Alumni {
  id: number;
  name: string;
  avatar?: string;
  gender?: string;
  year: number;
  description?: string;

  academic_background: string[];
  work_experience: string[];

  phone?: string;
  email?: string;
  contact?: string;

  has_permission?: boolean;
}
