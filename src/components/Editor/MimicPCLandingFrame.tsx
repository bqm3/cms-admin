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
import { SliderComponent } from "./Craft/Components/SliderComponent";

export function MimicPCLandingFrame() {
  return (
    <Element
      id="mimicpc-page"
      is={Container}
      canvas
      padding={0}                 // ✅ bỏ padding để full width
      margin={0}
      background="transparent"
      width="100%"
      height="100%"
      className="min-h-screen"    // ✅ full chiều cao màn hình
    >
      {/* ✅ Header full width (không maxWidth xl ở wrapper) */}
      <Element
        id="sec-header"
        is={SectionComponent}
        canvas
        maxWidth="full"           // ✅ full
        paddingY={0}
        paddingX={0}
        background="transparent"
        overlay={{ enabled: false, color: "" }}
        borderRadius={0}
      >
        <PresetHeader />
      </Element>

      {/* ✅ Slider full width - KHÔNG render SliderComponent lần thứ 2 */}
      <Element
        id="sec-slider"
        is={SliderComponent}
        slides={[]}
        height={"420px"}
        overlay={"rgba(0,0,0,.35)"}
        autoPlay={false}
        intervalMs={3000}
        contentAlign={"center"}
        maxContentWidth={"xl"}    // nếu muốn text trong slider nằm gọn
        paddingX={0}
        paddingY={0}
        titleColor={"#fff"}
        subtitleColor={"rgba(255,255,255,.85)"}
      />

      {/* Hero (giữ xl) */}
      <Element
        id="sec-hero"
        is={SectionComponent}
        canvas
        maxWidth="xl"
        paddingY={28}
        paddingX={0}
        background="transparent"
        overlay={{ enabled: false, color: "" }}
        borderRadius={0}
      >
        <PresetHero />
      </Element>

      <Element
        id="sec-offers"
        is={SectionComponent}
        canvas
        maxWidth="xl"
        paddingY={34}
        paddingX={0}
        background="transparent"
        overlay={{ enabled: false, color: "" }}
        borderRadius={0}
      >
        <PresetOffersGrid />
      </Element>

      <Element
        id="sec-faq"
        is={SectionComponent}
        canvas
        maxWidth="xl"
        paddingY={34}
        paddingX={0}
        background="transparent"
        overlay={{ enabled: false, color: "" }}
        borderRadius={0}
      >
        <PresetFAQ />
      </Element>

      <Element
        id="sec-footer"
        is={SectionComponent}
        canvas
        maxWidth="xl"
        paddingY={34}
        paddingX={0}
        background="transparent"
        overlay={{ enabled: false, color: "" }}
        borderRadius={0}
      >
        <PresetFooter />
      </Element>
    </Element>
  );
}
