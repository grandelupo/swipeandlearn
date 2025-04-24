# Language Learning App - Development Plan

## Tech Stack
- **Frontend**: React Native (Expo)
- **Backend Services**: 
  - Supabase (Authentication, Database)
  - OpenAI API (GPT-4 for story generation and translations)
  - DALL-E API (for book cover generation)

## Pages & Components

### 1. Authentication Pages
- **Login Screen** (`screens/auth/Login.tsx`)
  - Email/password login form
  - Social auth options
  - Link to registration

- **Registration Screen** (`screens/auth/Register.tsx`)
  - Registration form
  - Terms acceptance
  - Email verification flow

### 2. Main Navigation
- **Tab Navigator** (`navigation/TabNavigator.tsx`)
  - Bookshelf tab
  - New Story tab
  - Profile tab

### 3. Bookshelf Screen (`screens/Bookshelf.tsx`)
Components:
- Book grid display
- Book cover images (AI-generated for stories ≥20 pages)
- Book metadata (language, title, pages count)
- Sorting/filtering options
- Delete/archive functionality

### 4. Story Creation Flow
- **New Story Screen** (`screens/NewStory.tsx`)
  - Language selection
  - Story theme/genre input
  - Initial prompt setup
  - Target words input

- **Story Reader Screen** (`screens/StoryReader.tsx`)
  - Page content display
  - Interactive sentences (clickable for translations)
  - Page navigation (prev/next)
  - Progress indicator
  - Save/exit options

### 5. Profile & Settings (`screens/Profile.tsx`)
- User information
- Language preferences
- Theme settings
- Account management

## Database Schema (Supabase)

### Tables

1. **users**
```sql
- id: uuid (primary key)
- email: string
- created_at: timestamp
- last_login: timestamp
```

2. **stories**
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- title: string
- language: string
- cover_image_url: string
- created_at: timestamp
- last_accessed: timestamp
- total_pages: integer
```

3. **story_pages**
```sql
- id: uuid (primary key)
- story_id: uuid (foreign key)
- page_number: integer
- content: text
- target_words: string[]
```

4. **translations**
```sql
- id: uuid (primary key)
- story_id: uuid (foreign key)
- original_text: text
- translated_text: text
- language_from: string
- language_to: string
```

## API Integration

### OpenAI API Integration (`services/ai.ts`)
1. Story Generation
   - Input: language, theme, target words
   - Output: page content

2. Translation Service
   - Input: sentence, context, source/target language
   - Output: translated text

3. Cover Image Generation
   - Input: story theme, title
   - Output: DALL-E generated image

## Core Features Implementation

### 1. Story Generation System
- Progressive story generation (page by page)
- Context maintenance between pages
- Target word incorporation
- Genre/theme consistency

### 2. Translation System
- Contextual sentence translation
- Caching of common translations
- Batch translation requests

### 3. Book Cover Generation
- Trigger when story reaches 20 pages
- Style consistency
- Safe image generation parameters

## Development Phases

### Phase 1: Foundation
1. Project setup with Expo
2. Supabase integration
3. Basic navigation
4. Authentication system

### Phase 2: Core Features
1. Story generation integration
2. Translation system
3. Basic story reader
4. Database schema implementation

### Phase 3: Enhanced Features
1. Book cover generation
2. Interactive sentence translation
3. Target word integration
4. Bookshelf management

### Phase 4: Polish
1. UI/UX improvements
2. Performance optimization
3. Error handling
4. Testing and bug fixes

## Additional Considerations

### State Management
- Use React Context for global state
- Implement local storage for offline access
- Cache frequently accessed data

### Performance
- Implement pagination for bookshelf
- Cache translations
- Optimize image loading
- Implement proper error boundaries

### Security
- Secure API key storage
- Rate limiting for AI requests
- Input sanitization
- Proper authentication flow

### Testing
- Unit tests for core functionality
- Integration tests for AI features
- E2E tests for critical user flows
- Performance testing

## Next Steps
1. Set up development environment
2. Create project structure
3. Implement authentication
4. Begin with basic story generation feature 