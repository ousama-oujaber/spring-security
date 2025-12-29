
export interface DocSection {
  id: string;
  title: string;
  content: string;
  subSections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
