/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";

import { Container } from "../Components/Container";
import { TextComponent } from "../Components/TextComponent";
import { ButtonComponent } from "../Components/ButtonComponent";

type NavItem = { label: string; href: string };

export const PresetHeader = () => {
  const NAV_BG = "#ffffff";
  const TEXT_DIM = "#000";

  const items: NavItem[] = [
    { label: "Home", href: "#" },
    { label: "Docs", href: "#docs" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <Element
      id="preset-navbar"
      canvas
      is={Container}
      background="transparent"
      padding={0}
      width="100%"
      height="auto"
      className="w-full"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="stretch"
      gap={0}
    >
      <Element
        id="navbar-bar"
        canvas
        is={Container}
        background={NAV_BG}
        padding={0}
        className="w-full rounded-2xl"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="stretch"
        gap={0}
      >
        <Element
          id="navbar-bar-inner"
          canvas
          is={Container}
          background="transparent"
          padding={14}
          className="w-full rounded-2xl shadow-sm border border-black/10"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="stretch"
          gap={0}
        >
          <Element
            id="navbar-row"
            canvas
            is={Container}
            background="transparent"
            padding={0}
            className="w-full"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap={0}
          >
            {/* ✅ LEFT – fixed width */}
            <Element
              id="navbar-left"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              width="120px" // ✅ cố định
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              gap={10}
            >
              <Element
                id="navbar-logo"
                canvas
                is={Container}
                background="rgba(0,0,0,.02)"
                padding={0}
                width="80px"
                height="40px"
                className="rounded-lg border border-black/10"
              />
            </Element>

            {/* ✅ CENTER – chiếm phần còn lại & center thật */}
            <Element
              id="navbar-center"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              width="100%" // ✅ ăn hết phần giữa
              flexDirection="row"
              justifyContent="center" // ✅ center
              alignItems="center"
              gap={24}
              className="hidden md:flex"
            >
              {items.map((t, i) => (
                <Element
                  key={i}
                  id={`navbar-link-${i}`}
                  is={TextComponent}
                  text={t.label}
                  fontSize={13}
                  fontWeight="500"
                  textAlign="left"
                  color={TEXT_DIM}
                  paddingTop={0}
                  paddingRight={0}
                  paddingBottom={0}
                  paddingLeft={0}
                />
              ))}
            </Element>

            {/* ✅ RIGHT – fixed width */}
            <Element
              id="navbar-actions"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              width="120px" // ✅ cố định
              flexDirection="row"
              justifyContent="flex-end"
              alignItems="center"
              gap={10}
            >
              
              <Element
                id="navbar-cta"
                is={ButtonComponent}
                text="Free Launch"
                color="primary"
                variant="shadow"
                size="sm"
                radius="full"
                fullWidth={false}
                href="https://example.com"
                openInNewTab={true}
              />
            </Element>
          </Element>
        </Element>
      </Element>
    </Element>
  );
};

(PresetHeader as any).craft = {
  displayName: "Preset / Navbar (White)",
};
