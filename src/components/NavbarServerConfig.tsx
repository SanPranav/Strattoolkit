"use client";
import { useEffect } from "react";
import { useNavbar } from "@/hooks/useNavbar";

type Props = {
  setDefaultShown?: boolean;
  setRenderOnlyHome?: boolean;
};

export function NavbarServerConfig({ ...props }: Props) {
  const navbar = useNavbar();
  useEffect(() => {
    if (props.setDefaultShown !== undefined) {
      navbar.setDefaultShown(props.setDefaultShown);
    }
    if (props.setRenderOnlyHome !== undefined) {
      navbar.setRenderOnlyHome(props.setRenderOnlyHome);
    }
  }, [props.setDefaultShown, props.setRenderOnlyHome, navbar]);
  return null;
}
