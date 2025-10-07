export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  features: string[];
  targetGroup: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange';
  createdAt: string;
  updatedAt: string;
}


