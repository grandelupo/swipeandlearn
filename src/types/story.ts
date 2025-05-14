export interface Story {
    id: string;
    title: string;
    language: string;
    cover_image_url: string;
    total_pages: number;
    theme?: string;
    last_accessed: string;
    difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Divine';
    last_viewed_page?: number;
    author_style?: 'Default' | 'Ernest Hemingway' | 'Terry Pratchett' | 'Douglas Adams' | 'George Orwell' | 'Joan Didion' | 'Adam Mickiewicz' | 'Alexandre Dumas' | 'Vladimir Nabokov' | 'Oscar Wilde' | 'F. Scott Fitzgerald';
}