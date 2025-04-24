export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  StoryReader: {
    storyId: string;
    pageNumber?: number;
  };
};

export type MainTabParamList = {
  Bookshelf: undefined;
  NewStory: undefined;
  Profile: undefined;
};

export type BookshelfStackParamList = {
  BookshelfHome: undefined;
}; 