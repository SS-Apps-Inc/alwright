import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { colors, postBackgroundColors } from "@/design-system/tokens";
import { UI_CONSTANTS } from "@/config";
import { ColorPickerModal } from "./color_picker_modal";

export const MIN_BACKGROUND_OPACITY = UI_CONSTANTS.minimumBackgroundOpacity;

type Props = {
  active: boolean;
  color: string | null;
  opacity: number;
  palette: readonly string[];
  allowClear?: boolean;
  sectionSpacing?: number;
  onChangeColor: (color: string | null) => void;
  onChangeOpacity: (opacity: number) => void;
};

export function BackgroundStyleControls({
  active,
  color,
  opacity,
  palette,
  allowClear = false,
  sectionSpacing = 24,
  onChangeColor,
  onChangeOpacity,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [customColorSelected, setCustomColorSelected] = useState(false);
  const wasActive = useRef(false);
  const gap = 8;
  const itemSize = Math.max(46, (windowWidth - 20 - gap * 6) / 6.5);
  const circleSize = 34;

  useEffect(() => {
    if (active && !wasActive.current) {
      setCustomColorSelected(
        !!color &&
          !palette.some((preset) => preset.toLowerCase() === color.toLowerCase())
      );
    }
    wasActive.current = active;
  }, [active, color, palette]);

  return (
    <>
      <View style={{ marginBottom: sectionSpacing }}>
        <Text style={styles.label}>Background color</Text>
        <ScrollView
          horizontal
          decelerationRate="fast"
          snapToInterval={itemSize + gap}
          showsHorizontalScrollIndicator={false}
          style={styles.edgeToEdgePalette}
          contentContainerStyle={styles.colorsRow}
        >
          {allowClear ? (
            <Pressable
              accessibilityLabel="Clear background color"
              accessibilityState={{ selected: color === null }}
              onPress={() => {
                setCustomColorSelected(false);
                onChangeColor(null);
              }}
              style={[styles.colorButton, { width: itemSize, height: itemSize }]}
            >
              <View
                style={[
                  styles.clearCircle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    borderColor:
                      color === null ? colors.text : colors.surfaceBorder,
                    borderWidth: color === null ? 3 : 1,
                  },
                ]}
              >
                <Text style={styles.clearText}>Clear</Text>
              </View>
              {color === null ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          ) : null}

          {palette.map((hex) => {
            const selected =
              !customColorSelected && color?.toLowerCase() === hex.toLowerCase();

            return (
              <Pressable
                key={hex}
                accessibilityLabel={`Background color ${hex}`}
                accessibilityState={{ selected }}
                onPress={() => {
                  setCustomColorSelected(false);
                  onChangeColor(hex);
                }}
                style={[styles.colorButton, { width: itemSize, height: itemSize }]}
              >
                <View
                  style={[
                    {
                      width: circleSize,
                      height: circleSize,
                      borderRadius: circleSize / 2,
                      backgroundColor: hex,
                      borderColor: selected ? colors.text : colors.surfaceBorder,
                      borderWidth: selected ? 3 : 1,
                    },
                  ]}
                />
                {selected ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          })}

          <Pressable
            accessibilityLabel="Choose a custom background color"
            accessibilityState={{ selected: customColorSelected }}
            onPress={() => setColorPickerVisible(true)}
            style={[styles.chooseColorButton, { height: itemSize }]}
          >
            {customColorSelected && color ? (
              <View style={styles.customColorSwatchWrap}>
                <View
                  style={[styles.customColorSwatch, { backgroundColor: color }]}
                />
                <Text style={styles.customColorCheck}>✓</Text>
              </View>
            ) : null}
            <Text style={styles.chooseColorText}>Choose color</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View style={{ marginBottom: sectionSpacing }}>
        <View style={styles.valueRow}>
          <Text style={styles.labelNoMargin}>Background opacity</Text>
          <Text style={styles.valueText}>{Math.round(opacity * 100)}%</Text>
        </View>
        <Slider
          value={opacity}
          minimumValue={MIN_BACKGROUND_OPACITY}
          maximumValue={1}
          step={0.01}
          minimumTrackTintColor={colors.text}
          maximumTrackTintColor="#444444"
          thumbTintColor={colors.text}
          onValueChange={(nextOpacity) =>
            onChangeOpacity(Math.max(MIN_BACKGROUND_OPACITY, nextOpacity))
          }
        />
      </View>

      <ColorPickerModal
        visible={colorPickerVisible}
        initialColor={color ?? palette[0] ?? postBackgroundColors[0]}
        onCancel={() => setColorPickerVisible(false)}
        onSelect={(selectedColor) => {
          onChangeColor(selectedColor);
          setCustomColorSelected(true);
          setColorPickerVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 14,
  },
  labelNoMargin: { color: colors.text, fontSize: 15, fontWeight: "800" },
  edgeToEdgePalette: { marginHorizontal: -20 },
  colorsRow: { gap: 8, paddingHorizontal: 20 },
  colorButton: { alignItems: "center", justifyContent: "center" },
  clearCircle: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: { color: colors.textMuted, fontSize: 8, fontWeight: "900" },
  check: {
    position: "absolute",
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 2,
  },
  chooseColorButton: {
    minWidth: 128,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.fieldBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.faintBorder,
  },
  customColorSwatchWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  customColorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.text,
  },
  customColorCheck: {
    position: "absolute",
    color: colors.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 2,
  },
  chooseColorText: { color: colors.text, fontSize: 13, fontWeight: "800" },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  valueText: { color: colors.textMuted, fontWeight: "700" },
});
