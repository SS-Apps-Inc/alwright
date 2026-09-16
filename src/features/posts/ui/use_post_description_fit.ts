// use_post_description_fit.ts
import { useEffect, useMemo, useState } from "react";

type Phase =
  | "measure-min"
  | "measure-max"
  | "measure-search"
  | "resolved";

type Args = {
  text: string;
  actualHeight: number;
  minFontSize: number;
  maxFontSize: number;
};

type Result = {
  ready: boolean;
  shouldScroll: boolean;
  fittedFontSize: number;
  lineHeight: number;

  measurePhase: Phase;
  measureFontSize: number;
  onMeasuredHeight: (height: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function usePostDescriptionFit({
  text,
  actualHeight,
  minFontSize,
  maxFontSize,
}: Args): Result {
  const safeActualHeight = Math.max(actualHeight, 1);

  const [ready, setReady] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [fittedFontSize, setFittedFontSize] = useState(minFontSize);

  const [measurePhase, setMeasurePhase] = useState<Phase>("measure-min");
  const [measureFontSize, setMeasureFontSize] = useState(minFontSize);

  const [minHeight, setMinHeight] = useState<number | null>(null);

  const [lowFit, setLowFit] = useState(minFontSize);
  const [highFail, setHighFail] = useState(maxFontSize);

  useEffect(() => {
    setReady(false);
    setShouldScroll(false);
    setFittedFontSize(minFontSize);

    setMeasurePhase("measure-min");
    setMeasureFontSize(minFontSize);

    setMinHeight(null);

    setLowFit(minFontSize);
    setHighFail(maxFontSize);
  }, [text, safeActualHeight, minFontSize, maxFontSize]);

  function onMeasuredHeight(rawHeight: number) {
    const height = Math.max(rawHeight, 1);

    if (measurePhase === "measure-min") {
      setMinHeight(height);

      if (height > safeActualHeight) {
        setFittedFontSize(minFontSize);
        setShouldScroll(true);
        setReady(true);
        setMeasurePhase("resolved");
        return;
      }

      setMeasureFontSize(maxFontSize);
      setMeasurePhase("measure-max");
      return;
    }

    if (measurePhase === "measure-max") {
      if (height <= safeActualHeight) {
        setFittedFontSize(maxFontSize);
        setShouldScroll(false);
        setReady(true);
        setMeasurePhase("resolved");
        return;
      }

      const safeMinHeight = minHeight ?? 1;
      const safeMaxHeight = height;

      const ratio =
        (safeActualHeight - safeMinHeight) / (safeMaxHeight - safeMinHeight);

      const estimatedFont = clamp(
        minFontSize + (maxFontSize - minFontSize) * ratio,
        minFontSize,
        maxFontSize
      );

      setLowFit(minFontSize);
      setHighFail(maxFontSize);
      setMeasureFontSize(estimatedFont);
      setMeasurePhase("measure-search");
      return;
    }

    if (measurePhase === "measure-search") {
      if (highFail - lowFit <= 0.5) {
        setFittedFontSize(lowFit);
        setShouldScroll(false);
        setReady(true);
        setMeasurePhase("resolved");
        return;
      }

      if (height <= safeActualHeight) {
        const nextLow = measureFontSize;
        const nextHigh = highFail;
        setLowFit(nextLow);
        setMeasureFontSize((nextLow + nextHigh) / 2);
      } else {
        const nextLow = lowFit;
        const nextHigh = measureFontSize;
        setHighFail(nextHigh);
        setMeasureFontSize((nextLow + nextHigh) / 2);
      }
    }
  }

  const lineHeight = useMemo(() => {
    return Math.ceil(fittedFontSize * 1.22);
  }, [fittedFontSize]);

  return {
    ready,
    shouldScroll,
    fittedFontSize,
    lineHeight,
    measurePhase,
    measureFontSize,
    onMeasuredHeight,
  };
}
