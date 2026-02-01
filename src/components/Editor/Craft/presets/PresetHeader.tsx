/* eslint-disable prettier/prettier */
import React, { useEffect } from "react";
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

  useEffect(() => {
    const toggle = document.getElementById("mobile-menu-toggle");
    const menu = document.getElementById("mobile-menu-container");
    if (!toggle || !menu) return;

    const handleToggle = () => {
      menu.classList.toggle("hidden");
    };

    toggle.addEventListener("click", handleToggle);
    return () => toggle.removeEventListener("click", handleToggle);
  }, []);

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
            {/* LEFT – Logo */}
            <Element
              id="navbar-left"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              width="auto"
              className="flex-shrink-0"
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

            {/* CENTER – Desktop Links (Wrapped in div to avoid Container display conflict) */}
            <div className="hidden md:flex flex-1 justify-center items-center">
              <Element
                id="navbar-center"
                canvas
                is={Container}
                background="transparent"
                padding={0}
                width="auto"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                gap={24}
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
            </div>

            {/* RIGHT – Actions */}
            <Element
              id="navbar-actions"
              canvas
              is={Container}
              background="transparent"
              padding={0}
              width="auto"
              className="flex-shrink-0"
              flexDirection="row"
              justifyContent="flex-end"
              alignItems="center"
              gap={10}
            >
              {/* Desktop CTA (Wrapped in div) */}
              <div className="hidden md:block">
                <Element
                  id="navbar-cta-wrapper"
                  canvas
                  is={Container}
                  background="transparent"
                  padding={0}
                  width="auto"
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
              </div>

              {/* Mobile Menu Toggle */}
              <div
                id="mobile-menu-toggle"
                className="md:hidden flex p-2 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </Element>
          </Element>

          {/* Mobile Menu Content */}
          <div
            id="mobile-menu-container"
            className="hidden md:hidden pt-4 mt-4 border-t border-black/5 flex flex-col gap-4"
          >
            {items.map((t, i) => (
              <Element
                key={i}
                id={`mobile-link-container-${i}`}
                canvas
                is={Container}
                background="transparent"
                padding={0}
                className="w-full"
              >
                <Element
                  id={`mobile-link-${i}`}
                  is={TextComponent}
                  text={t.label}
                  fontSize={14}
                  fontWeight="500"
                  textAlign="left"
                  color={TEXT_DIM}
                />
              </Element>
            ))}
            <Element
              id="mobile-cta-btn"
              is={ButtonComponent}
              text="Free Launch"
              color="primary"
              variant="shadow"
              size="sm"
              radius="full"
              fullWidth={true}
            />
          </div>
        </Element>
      </Element>
    </Element>
  );
};

(PresetHeader as any).craft = {
  displayName: "Preset / Navbar (White)",
};
