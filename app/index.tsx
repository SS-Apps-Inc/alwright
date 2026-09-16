// app/index.tsx
import { Platform } from "react-native";

import Splash from "./splash";
import MarketingHome from "@/features/marketing/marketing_home";

export default function Index() {
  if (Platform.OS === "web") {
    return <MarketingHome />;
  }

  return <Splash />;
}
