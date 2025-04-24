# SwipeAndLearn - Language Learning Story App

An interactive language learning application that helps users learn new languages through AI-generated stories. Users can create personalized stories in their target language, with specific vocabulary they want to learn, and get instant translations while reading.

## Features

- Create AI-generated stories in multiple languages
- Interactive sentence-by-sentence translation
- Target vocabulary integration in stories
- AI-generated book covers for completed stories
- User authentication and story progress tracking

## Tech Stack

- React Native (Expo)
- Supabase (Authentication & Database)
- OpenAI GPT-4 (Story Generation & Translation)
- DALL-E 3 (Book Cover Generation)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd swipeandlearn
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project and set up the following tables:
   - users
   - stories
   - story_pages
   - translations

4. Create a `.env` file in the root directory with your API keys:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

5. Update the configuration in `src/services/supabase.ts` and `src/services/ai.ts` with your API keys.

6. Start the development server:
```bash
npm start
```

## Database Schema

### users
- id: uuid (primary key)
- email: string
- created_at: timestamp
- last_login: timestamp

### stories
- id: uuid (primary key)
- user_id: uuid (foreign key)
- title: string
- language: string
- cover_image_url: string
- created_at: timestamp
- last_accessed: timestamp
- total_pages: integer

### story_pages
- id: uuid (primary key)
- story_id: uuid (foreign key)
- page_number: integer
- content: text
- target_words: string[]

### translations
- id: uuid (primary key)
- story_id: uuid (foreign key)
- original_text: text
- translated_text: text
- language_from: string
- language_to: string

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 