/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";

import { Container } from "../Components/Container";
import { TextComponent } from "../Components/TextComponent";
import { ButtonComponent } from "../Components/ButtonComponent";

type NavItem = { label: string; href: string };

export const PresetHeader = () => {
  const NAV_BG = "#ffffff";
  const NAV_BORDER = "1px solid rgba(0,0,0,.08)";
  const TEXT_MAIN = "rgba(24,24,27,.95)";
  const TEXT_DIM = "rgba(24,24,27,.62)";

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
      // nếu Container support:
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
          className="w-full rounded-2xl shadow-sm"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="stretch"
          gap={0}
        //   style={{
        //     border: NAV_BORDER,
        //     boxSizing: "border-box",
        //   }}
        >
          {/* ✅ ROW thật sự */}
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
            gap={16}
          >
            {/* Left brand */}
            <Element
              id="navbar-brand"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              className=""
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              gap={12}
            >
              <Element
                id="navbar-logo"
                canvas
                is={Container}
                background="rgba(0,0,0,.06)"
                padding={0}
                className="w-9 h-9 rounded-xl border border-black/10"
                flexDirection="column"
                justifyContent="flex-start"
                alignItems="stretch"
                gap={0}
              />

              <Element
                id="navbar-brand-text"
                is={TextComponent}
                text="MimicPC"
                fontSize={16}
                fontWeight="700"
                textAlign="left"
                color={TEXT_MAIN}
                paddingTop={0}
                paddingRight={0}
                paddingBottom={0}
                paddingLeft={0}
              />
            </Element>

            {/* Middle links (row) */}
            <Element
              id="navbar-links"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              className="hidden md:flex"
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              gap={20}
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

            {/* Right actions (row) */}
            <Element
              id="navbar-actions"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              className=""
              flexDirection="row"
              justifyContent="flex-end"
              alignItems="center"
              gap={10}
            >
              <Element
                id="navbar-login"
                is={ButtonComponent}
                text="Login"
                color="default"
                variant="bordered"
                size="sm"
                radius="full"
                fullWidth={false}
                href=""
                openInNewTab={true}
              />
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
