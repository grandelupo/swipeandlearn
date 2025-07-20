export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Bookshelf: undefined;
  NewStory: undefined;
  StoryReader: {
    storyId: string;
    pageNumber?: number;
  };
  Profile: undefined;
  Archive: undefined;
  Catalog: {
    sortBy?: 'newest' | 'most_liked';
  };
};

export type BookshelfStackParamList = {
  BookshelfHome: undefined;
}; 