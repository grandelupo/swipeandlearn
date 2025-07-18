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
      compileSdkVersion: 35,
      targetSdkVersion: 35,
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
      '@react-native-google-signin/google-signin',
      [
        'react-native-fbsdk-next',
        {
          "appID": "725982793731293",
          "displayName": "Swipe and Learn",
          "clientToken": "1e125b75b8054a47fc82223a7ca92710",
          "scheme": "fb725982793731293",
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-8821837072274540~5417339989",
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
          }
        }
      ]
    ],
    experiments: {
      tsconfigPaths: true
    },
    newArchEnabled: true
  }
};
