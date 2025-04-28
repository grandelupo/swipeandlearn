export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
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
};

export type BookshelfStackParamList = {
  BookshelfHome: undefined;
}; 