import Slider from "@react-native-community/slider";
import React from "react";
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/design-system/tokens";

type Hsv = { h: number; s: number; v: number };

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function hsvToHex({ h, s, v }: Hsv) {
  const chroma = v * s;
  const segment = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const [r1, g1, b1] =
    segment < 1 ? [chroma, x, 0] :
    segment < 2 ? [x, chroma, 0] :
    segment < 3 ? [0, chroma, x] :
    segment < 4 ? [0, x, chroma] :
    segment < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const m = v - chroma;
  const channel = (value: number) =>
    Math.round((value + m) * 255).toString(16).padStart(2, "0");
  return `#${channel(r1)}${channel(g1)}${channel(b1)}`.toUpperCase();
}

function hexToHsv(value: string): Hsv {
  const safe = /^#[0-9a-f]{6}$/i.test(value) ? value : "#E87021";
  const r = parseInt(safe.slice(1, 3), 16) / 255;
  const g = parseInt(safe.slice(3, 5), 16) / 255;
  const b = parseInt(safe.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }

  return {
    h: hue < 0 ? hue + 360 : hue,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
}

export function ColorPickerModal({
  visible,
  initialColor,
  onCancel,
  onSelect,
}: {
  visible: boolean;
  initialColor: string;
  onCancel: () => void;
  onSelect: (color: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [hsv, setHsv] = React.useState<Hsv>(() => hexToHsv(initialColor));
  const [squareSize, setSquareSize] = React.useState(280);

  React.useEffect(() => {
    if (visible) setHsv(hexToHsv(initialColor));
  }, [initialColor, visible]);

  const selectedColor = hsvToHex(hsv);
  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  const updateSaturationValue = React.useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      setHsv((previous) => ({
        ...previous,
        s: clamp(locationX / squareSize),
        v: clamp(1 - locationY / squareSize),
      }));
    },
    [squareSize]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View
          style={[
            styles.card,
            {
              width: Math.min(windowWidth - 32, 380),
              marginBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Choose a color</Text>
              <Text style={styles.hex}>{selectedColor}</Text>
            </View>
            <View style={[styles.preview, { backgroundColor: selectedColor }]} />
          </View>

          <View
            onLayout={(event) => setSquareSize(event.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={updateSaturationValue}
            onResponderMove={updateSaturationValue}
            style={[styles.saturation, { height: squareSize }]}
          >
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="whiteFade" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="blackFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                  <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={hueColor} />
              <Rect width="100%" height="100%" fill="url(#whiteFade)" />
              <Rect width="100%" height="100%" fill="url(#blackFade)" />
            </Svg>
            <View
              pointerEvents="none"
              style={[
                styles.cursor,
                {
                  left: hsv.s * squareSize - 10,
                  top: (1 - hsv.v) * squareSize - 10,
                },
              ]}
            />
          </View>

          <View style={styles.hueTrack}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#FF0000" />
                  <Stop offset="0.17" stopColor="#FFFF00" />
                  <Stop offset="0.33" stopColor="#00FF00" />
                  <Stop offset="0.5" stopColor="#00FFFF" />
                  <Stop offset="0.67" stopColor="#0000FF" />
                  <Stop offset="0.83" stopColor="#FF00FF" />
                  <Stop offset="1" stopColor="#FF0000" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" rx="7" fill="url(#hue)" />
            </Svg>
            <Slider
              value={hsv.h}
              minimumValue={0}
              maximumValue={360}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor={colors.white}
              onValueChange={(h) => setHsv((previous) => ({ ...previous, h }))}
              style={styles.hueSlider}
            />
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onSelect(selectedColor)}
              style={[styles.useButton, { backgroundColor: selectedColor }]}
            >
              <Text style={styles.useText}>Use color</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  card: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.faintBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  hex: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  preview: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.faintBorder,
  },
  saturation: { width: "100%", overflow: "hidden", borderRadius: 16 },
  cursor: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.overlay,
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  hueTrack: { height: 14, marginTop: 18, marginHorizontal: 2 },
  hueSlider: { position: "absolute", left: -12, right: -12, top: -9, height: 32 },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fieldBackground,
  },
  cancelText: { color: colors.textMuted, fontSize: 15, fontWeight: "700" },
  useButton: {
    flex: 1.35,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  useText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowRadius: 3,
  },
});
