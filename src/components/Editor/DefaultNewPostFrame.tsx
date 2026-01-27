/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { Element } from "@craftjs/core";

import { Container } from "./Craft/Components/Container";
import { TextComponent } from "./Craft/Components/TextComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { CardComponent } from "./Craft/Components/CardComponent";
import { SectionComponent } from "./Craft/Components/SectionComponent";

export function DefaultNewPostFrame() {
  const PAGE_BG = "#070A0F";
  const TEXT_SUB = "rgba(161,161,170,.92)";
  const GLASS_BG = "rgba(24,24,27,.55)";
  const GLASS_BORDER = "1px solid rgba(255,255,255,.08)";
  const GLASS_INNER = "rgba(255,255,255,.03)";
  const SHADOW = "0 20px 60px rgba(0,0,0,.45)";

  // ✅ Helper function with proper unique IDs
  const wrapGlassCard = (id: string, children: any, padding = 20) => (
    <Element
      id={id}
      canvas
      is={Container}
      background={GLASS_BG}
      padding={padding}
      // radius={16}
      // shadow="xl"
    >
      {children}
    </Element>
  );

  return (
    <Element
      id="page-root"
      is={Container}
      canvas
      padding={40}
      background="transparent"
      width="100%"
      height="100%"
    >
      {/* FOOTER - Simple default section */}
      <Element
        id="footer-section"
        is={SectionComponent}
        canvas
        maxWidth="xl"
        paddingY={48}
        paddingX={24}
        background="transparent"
        overlay={{ enabled: false, color: "" }}
        borderRadius={0}
      >
        <Element
          id="footer-card-wrapper"
          canvas
          is={Container}
          background={GLASS_BG}
          padding={18}
        >
          <Element
            id="footer-content"
            canvas
            is={Container}
            background="transparent"
            padding={0}
          >
            {/* Brand name */}
            <Element
              id="brand-heading"
              is={HeadingComponent}
              level="h3"
              text="MimicPC"
            />
            
            {/* Copyright text */}
            <Element
              id="copyright-text"
              is={TextComponent}
              text={`© ${new Date().getFullYear()} — Built with Craft.js builder.`}
              fontSize={14}
              fontWeight="400"
              textAlign="left"
              color={TEXT_SUB}
            />
            
            {/* Navigation links info */}
            <Element
              id="footer-links-text"
              is={TextComponent}
              text="Home • Pricing • FAQ • Apps"
              fontSize={13}
              fontWeight="400"
              textAlign="left"
              color="rgba(255,255,255,.7)"
            />
          </Element>
        </Element>
      </Element>
    </Element>
  );
}