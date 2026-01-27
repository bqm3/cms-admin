/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "./Craft/Components/Container";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetHero } from "./Craft/presets/PresetHero";
import { PresetOffersGrid } from "./Craft/presets/PresetOffersGrid";
import { PresetFAQ } from "./Craft/presets/PresetFAQ";
import { PresetFooter } from "./Craft/presets/PresetFooter";

export function MimicPCLandingFrame() {
  return (
    <Element
      id="mimicpc-page"
      is={Container}
      canvas
      padding={40}
      background="transparent"
      width="100%"
      height="100%"
      className="min-h-full"
    >
      {/* Header */}
      <Element id="sec-header" is={SectionComponent} canvas maxWidth="xl" paddingY={20} paddingX={0} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
        <PresetHeader />
      </Element>

      {/* Hero */}
      <Element id="sec-hero" is={SectionComponent} canvas maxWidth="xl" paddingY={28} paddingX={0} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
        <PresetHero />
      </Element>

      {/* Offers */}
      <Element id="sec-offers" is={SectionComponent} canvas maxWidth="xl" paddingY={34} paddingX={0} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
        <PresetOffersGrid />
      </Element>

      {/* FAQ */}
      <Element id="sec-faq" is={SectionComponent} canvas maxWidth="xl" paddingY={34} paddingX={0} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
        <PresetFAQ />
      </Element>

      {/* Footer */}
      <Element id="sec-footer" is={SectionComponent} canvas maxWidth="xl" paddingY={34} paddingX={0} background="transparent" overlay={{ enabled: false, color: "" }} borderRadius={0}>
        <PresetFooter />
      </Element>
    </Element>
  );
}
