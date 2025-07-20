import { supabase } from './supabase';
import { Story, StoryLike, StoryShare } from '@/types/story';

export interface CatalogFilters {
  sortBy?: 'newest' | 'most_liked';
  language?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

export const catalogService = {
  // Fetch published stories for catalog
  async getPublishedStories(filters: CatalogFilters = {}): Promise<Story[]> {
    try {
      console.log('Catalog service filters:', filters);
      let query = supabase
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .eq('archived', false);

      // Apply sorting
      if (filters.sortBy === 'most_liked') {
        query = query.order('like_count', { ascending: false });
      } else {
        query = query.order('published_at', { ascending: false });
      }

      // Apply filters
      if (filters.language) {
        console.log('Filtering by language:', filters.language);
        query = query.eq('language', filters.language);
      }
      if (filters.difficulty) {
        console.log('Filtering by difficulty:', filters.difficulty);
        query = query.eq('difficulty', filters.difficulty);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data: stories, error } = await query;
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return stories || [];
    } catch (error) {
      console.error('Error fetching published stories:', error);
      throw error;
    }
  },

  // Publish a story
  async publishStory(storyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          is_published: true,
          published_at: new Date().toISOString()
        })
        .eq('id', storyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error publishing story:', error);
      throw error;
    }
  },

  // Unpublish a story
  async unpublishStory(storyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          is_published: false,
          published_at: null
        })
        .eq('id', storyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unpublishing story:', error);
      throw error;
    }
  },

  // Like a story
  async likeStory(storyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('story_likes')
        .insert({
          story_id: storyId,
          user_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error liking story:', error);
      throw error;
    }
  },

  // Unlike a story
  async unlikeStory(storyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('story_likes')
        .delete()
        .eq('story_id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking story:', error);
      throw error;
    }
  },

  // Check if user has liked a story
  async hasUserLikedStory(storyId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return !!data;
    } catch (error) {
      console.error('Error checking if user liked story:', error);
      return false;
    }
  },

  // Create a share link for a story
  async createStoryShare(storyId: string, expiresAt?: string): Promise<StoryShare> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('story_shares')
        .insert({
          story_id: storyId,
          share_code: await this.generateShareCode(),
          created_by: user.id,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating story share:', error);
      throw error;
    }
  },

  // Get story by share code
  async getStoryByShareCode(shareCode: string): Promise<Story | null> {
    try {
      const { data: shareData, error: shareError } = await supabase
        .from('story_shares')
        .select('*')
        .eq('share_code', shareCode)
        .eq('is_active', true)
        .single();

      if (shareError) throw shareError;
      if (!shareData) return null;

      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', shareData.story_id)
        .single();

      if (storyError) throw storyError;
      if (!story) return null;

      return story;
    } catch (error) {
      console.error('Error getting story by share code:', error);
      return null;
    }
  },

  // Generate a unique share code
  async generateShareCode(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_share_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating share code:', error);
      // Fallback: generate a simple code
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  },

  // Get user's published stories
  async getUserPublishedStories(): Promise<Story[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_published', true)
        .eq('archived', false)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user published stories:', error);
      throw error;
    }
  }
}; 