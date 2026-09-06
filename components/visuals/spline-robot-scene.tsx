"use client";

import dynamic from "next/dynamic";
import type { Application } from "@splinetool/runtime";
import {
  Component,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

const SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

// Adapted from Serafim's MIT-licensed 21st.dev Spline Scene reference.
// Source and attribution details are retained in references/21st-spline-scene/README.md.

type SceneLabels = {
  description: string;
  loading: string;
  reducedMotion: string;
  enable: string;
  unavailable: string;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

class SceneErrorBoundary extends Component<
  ErrorBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function SceneFallback({
  message,
  pulse = false,
  action,
}: Readonly<{
  message: string;
  pulse?: boolean;
  action?: { label: string; onActivate: () => void };
}>) {
  return (
    <div className="hero-spline__fallback" role="status" aria-live="polite">
      <div className="hero-spline__fallback-mark" aria-hidden="true">
        <span className={pulse ? "hero-spline__pulse" : undefined}>RZ</span>
      </div>
      <p>{message}</p>
      {action ? (
        <button type="button" onClick={action.onActivate}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

export function SplineRobotScene({
  labels,
}: Readonly<{ labels: SceneLabels }>) {
  const [shouldRender, setShouldRender] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionOverride, setMotionOverride] = useState(false);
  const applicationRef = useRef<Application | null>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const prepareScene = () => {
      setReducedMotion(motionQuery.matches);
      if (motionQuery.matches) return;

      if (!window.matchMedia("(max-width: 48rem)").matches) {
        setShouldRender(true);
        return;
      }

      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(
          () => setShouldRender(true),
          { timeout: 1600 },
        );
        return;
      }

      timeoutHandle = window.setTimeout(() => setShouldRender(true), 450);
    };

    const frameHandle = window.requestAnimationFrame(prepareScene);
    return () => {
      window.cancelAnimationFrame(frameHandle);
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  useEffect(() => {
    if (!shouldRender || loaded || (reducedMotion && !motionOverride)) return;
    const handle = window.setTimeout(() => setTimedOut(true), 15000);
    return () => window.clearTimeout(handle);
  }, [loaded, motionOverride, reducedMotion, shouldRender]);

  useEffect(
    () => () => {
      applicationRef.current?.setGlobalEvents(false);
      applicationRef.current = null;
    },
    [],
  );

  const handleSceneLoad = (application: Application) => {
    applicationRef.current = application;
    application.setGlobalEvents(true);
    setLoaded(true);
  };

  const motionBlocked = reducedMotion && !motionOverride;

  const unavailableFallback = (
    <SceneFallback message={labels.unavailable} />
  );

  return (
    <figure className="hero-spline" aria-label={labels.description}>
      <div className="hero-spline__spotlight" aria-hidden="true" />
      <div className="hero-spline__frame">
        {motionBlocked ? (
          <SceneFallback
            message={labels.reducedMotion}
            action={{
              label: labels.enable,
              onActivate: () => {
                setMotionOverride(true);
                setShouldRender(true);
              },
            }}
          />
        ) : timedOut ? (
          unavailableFallback
        ) : (
          <>
            {!loaded ? (
              <SceneFallback message={labels.loading} pulse />
            ) : null}
            {shouldRender ? (
              <SceneErrorBoundary fallback={unavailableFallback}>
                <Spline
                  scene={SCENE_URL}
                  renderOnDemand
                  wasmPath="/spline-wasm"
                  onLoad={handleSceneLoad}
                  className={`hero-spline__canvas ${loaded ? "is-loaded" : ""}`}
                />
              </SceneErrorBoundary>
            ) : null}
          </>
        )}
      </div>
    </figure>
  );
}
