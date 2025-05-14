module.exports = {
  expo: {
    name: "Swipe and Learn",
    slug: "swipeandlearn",
    scheme: "swipeandlearn",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: '#FF6F1A'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.latovi.swipeandlearn"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: '#FF6F1A',
        iconBackground: '#FF6F1A'
      },
      package: "com.latovi.swipeandlearn",
      permissions: ['com.android.vending.BILLING'],
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      eas: {
        projectId: "d4b1d833-533f-4e4d-a351-a1613d22b568"
      }
    },
    owner: "latovi",
    plugins: [
      'expo-router',
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-8821837072274540~5417339989",
        }
      ],
    ],
    experiments: {
      tsconfigPaths: true
    },
    newArchEnabled: true
  }
};
