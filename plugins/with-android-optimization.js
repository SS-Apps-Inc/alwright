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

module.exports = function withAndroidOptimization(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const androidRoot = config.modRequest.platformProjectRoot;
      const appBuildGradlePath = path.join(androidRoot, "app", "build.gradle");
      const gradlePropertiesPath = path.join(androidRoot, "gradle.properties");

      const appBuildGradle = fs.readFileSync(appBuildGradlePath, "utf8");
      fs.writeFileSync(appBuildGradlePath, patchAppBuildGradle(appBuildGradle));

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
