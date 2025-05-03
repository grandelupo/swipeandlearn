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
}