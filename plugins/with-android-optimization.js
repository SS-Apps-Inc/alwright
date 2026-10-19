const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

function upsertGradleProperty(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=.*$`, "m");

  if (pattern.test(contents)) {
    return contents.replace(pattern, line);
  }

  return `${contents.trimEnd()}\n${line}\n`;
}

function patchAppBuildGradle(contents) {
  let next = contents;

  next = next.replace(
    /def enableShrinkResources = findProperty\('android\.enableShrinkResourcesInReleaseBuilds'\) \?: '(?:true|false)'/,
    "def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'true'",
  );

  next = next.replace(
    /getDefaultProguardFile\(["']proguard-android(?:-optimize)?\.txt["']\)/g,
    'getDefaultProguardFile("proguard-android-optimize.txt")',
  );

  return next;
}

function patchSplashResources(androidRoot) {
  const stylesPath = path.join(androidRoot, "app", "src", "main", "res", "values", "styles.xml");
  const nightColorsPath = path.join(androidRoot, "app", "src", "main", "res", "values-night", "colors.xml");
  const blankDrawablePath = path.join(androidRoot, "app", "src", "main", "res", "drawable", "splashscreen_blank.xml");
  const legacySplashDrawablePath = path.join(
    androidRoot,
    "app",
    "src",
    "main",
    "res",
    "drawable",
    "splashscreen_logo.xml",
  );
  const launcherBackgroundPath = path.join(
    androidRoot,
    "app",
    "src",
    "main",
    "res",
    "drawable",
    "ic_launcher_background.xml",
  );

  const styles = fs.readFileSync(stylesPath, "utf8").replace(
    /<item name="windowSplashScreenAnimatedIcon">.*<\/item>/,
    '<item name="windowSplashScreenAnimatedIcon">@drawable/splashscreen_blank</item>',
  );
  fs.writeFileSync(stylesPath, styles);

  if (fs.existsSync(nightColorsPath)) {
    const nightColors = fs.readFileSync(nightColorsPath, "utf8").replace(
      /(<color name="splashscreen_background">).*?(<\/color>)/,
      "$1#FAFAFA$2",
    );
    fs.writeFileSync(nightColorsPath, nightColors);
  }

  const transparentDrawable =
    '<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">\n  <solid android:color="@android:color/transparent" />\n  <size android:width="1dp" android:height="1dp" />\n</shape>\n';

  fs.writeFileSync(blankDrawablePath, transparentDrawable);
  // Older generated splash styles may retain this resource name even when no
  // native splash image is configured. Provide a transparent compatibility
  // drawable so a clean release prebuild can always link successfully.
  fs.writeFileSync(legacySplashDrawablePath, transparentDrawable);

  // Expo can leave this generated layer-list pointing at splashscreen_logo even
  // when the native splash image is intentionally omitted. Keep the adaptive
  // icon background independent from the splash resources so release linking
  // succeeds after a clean prebuild.
  fs.writeFileSync(
    launcherBackgroundPath,
    '<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">\n  <solid android:color="#FAFAFA" />\n</shape>\n',
  );
}

module.exports = function withAndroidOptimization(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const androidRoot = config.modRequest.platformProjectRoot;
      const appBuildGradlePath = path.join(androidRoot, "app", "build.gradle");
      const gradlePropertiesPath = path.join(androidRoot, "gradle.properties");

      const appBuildGradle = fs.readFileSync(appBuildGradlePath, "utf8");
      fs.writeFileSync(
        appBuildGradlePath,
        patchAppBuildGradle(appBuildGradle),
      );
      patchSplashResources(androidRoot);

      let gradleProperties = fs.readFileSync(gradlePropertiesPath, "utf8");
      gradleProperties = upsertGradleProperty(gradleProperties, "reactNativeArchitectures", "armeabi-v7a,arm64-v8a,x86,x86_64");
      gradleProperties = upsertGradleProperty(gradleProperties, "android.enableMinifyInReleaseBuilds", "true");
      gradleProperties = upsertGradleProperty(gradleProperties, "android.enableShrinkResourcesInReleaseBuilds", "true");
      gradleProperties = upsertGradleProperty(gradleProperties, "android.r8.optimizedResourceShrinking", "true");
      fs.writeFileSync(gradlePropertiesPath, gradleProperties);

      return config;
    },
  ]);
};
