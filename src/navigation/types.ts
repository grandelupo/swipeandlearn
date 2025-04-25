export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Bookshelf: undefined;
  NewStory: undefined;
  Profile: undefined;
  StoryReader: {
    storyId: string;
    pageNumber?: number;
  };
};

export type BookshelfStackParamList = {
  BookshelfHome: undefined;
}; 