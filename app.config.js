const { expo } = require("./app.json");

// Local development and production use the same application ID. This keeps
// Expo's dev-client launcher aligned with the package installed by Gradle.
const isDevelopment = process.env.APP_VARIANT !== "production";

module.exports = {
  ...expo,
  name: isDevelopment ? `${expo.name} Dev` : expo.name,
  android: {
    ...expo.android,
    package: expo.android.package,
  },
};
