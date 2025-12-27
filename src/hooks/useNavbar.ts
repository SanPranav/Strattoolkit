"use client";

import { useSyncExternalStore } from "react";

type NavbarVariant = "full" | "minimal";

type NavbarState = {
  disabled: boolean;
  variant: NavbarVariant;
  defaultExpanded: boolean;
  expanded: boolean;
};

const initialState: NavbarState = {
  disabled: false,
  variant: "full",
  defaultExpanded: true,
  expanded: true
};

let navbarState = initialState;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return navbarState;
}

const setDisabled = (value: boolean) => {
  navbarState = { ...navbarState, disabled: value };
  emitChange();
};

const setVariant = (variant: NavbarVariant) => {
  navbarState = { ...navbarState, variant };
  emitChange();
};

const setDefaultExpanded = (value: boolean) => {
  navbarState = { ...navbarState, defaultExpanded: value };
  emitChange();
};

const setExpanded = (value: boolean) => {
  navbarState = { ...navbarState, expanded: value };
  emitChange();
};

const configureNavbar = (config: Partial<NavbarState>) => {
  navbarState = { ...navbarState, ...config };
  emitChange();
};

const resetNavbar = (config?: Partial<NavbarState>) => {
  navbarState = { ...initialState, ...config };
  emitChange();
};

export function useNavbar() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...state,
    setDisabled,
    setVariant,
    setDefaultExpanded,
    setExpanded,
    configureNavbar,
    resetNavbar
  } as const;
}
