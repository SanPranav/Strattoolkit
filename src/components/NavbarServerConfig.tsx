"use client";
import { useEffect } from "react";
import { useNavbar } from "@/hooks/useNavbar";

type Props = {
  defaultExpanded?: boolean;
  variant?: "full" | "minimal";
  disabled?: boolean;
};

export function NavbarServerConfig({
  defaultExpanded,
  variant,
  disabled
}: Props) {
  const { setDefaultExpanded, setVariant, setDisabled, resetNavbar } =
    useNavbar();

  useEffect(() => {
    if (defaultExpanded !== undefined) setDefaultExpanded(defaultExpanded);
    if (variant) setVariant(variant);
    if (disabled !== undefined) setDisabled(disabled);

    return () => {
      resetNavbar();
    };
  }, [
    defaultExpanded,
    variant,
    disabled,
    setDefaultExpanded,
    setVariant,
    setDisabled,
    resetNavbar
  ]);

  return null;
}
