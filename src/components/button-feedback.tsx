"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "uds-button-sound";
const PREFERENCE_EVENT = "uds-button-sound-change";

function getSoundPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

function subscribeToSoundPreference(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREFERENCE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREFERENCE_EVENT, onChange);
  };
}

function getServerSoundPreference() {
  return true;
}

export default function ButtonFeedback() {
  const soundEnabled = useSyncExternalStore(
    subscribeToSoundPreference,
    getSoundPreference,
    getServerSoundPreference,
  );
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let lastPlayedAt = 0;

    function playSoftTick() {
      if (!getSoundPreference()) return;

      const now = performance.now();
      if (now - lastPlayedAt < 55) return;
      lastPlayedAt = now;

      try {
        const AudioContextConstructor = window.AudioContext;
        if (!AudioContextConstructor) return;

        const context = audioContextRef.current ?? new AudioContextConstructor();
        audioContextRef.current = context;
        if (context.state === "suspended") void context.resume().catch(() => {});

        const oscillator = context.createOscillator();
        const volume = context.createGain();
        const startAt = context.currentTime;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(720, startAt);
        oscillator.frequency.exponentialRampToValueAtTime(520, startAt + 0.06);
        volume.gain.setValueAtTime(0.014, startAt);
        volume.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.06);
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.065);
      } catch {
        // Audio is an enhancement; unsupported or blocked audio must not affect the action.
      }
    }

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button");
      if (!button || button.disabled || button.hasAttribute("data-silent")) return;
      playSoftTick();
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    };
  }, []);

  function toggleSound() {
    const enabled = !soundEnabled;
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(new Event(PREFERENCE_EVENT));
  }

  return (
    <button
      type="button"
      data-silent
      aria-label={`${soundEnabled ? "Mute" : "Enable"} button sound effects`}
      aria-pressed={soundEnabled}
      onClick={toggleSound}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
    >
      <span aria-hidden="true">{soundEnabled ? "♪" : "♪̸"}</span>
      Sound {soundEnabled ? "on" : "off"}
    </button>
  );
}