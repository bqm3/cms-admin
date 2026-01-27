/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "../Components/Container";
import { HeadingComponent } from "../Components/HeadingComponent";
import { AccordionComponent } from "../Components/AccordionComponent";
import { TOKENS } from "./presetTokens";

export const PresetFAQ = () => {
  return (
    <Element id="preset-faq" canvas is={Container} background="transparent" padding={0} className="w-full">
      <Element id="faq-title" is={HeadingComponent} level="h2" text="FAQ About MimicPC" />
      <Element
        id="faq-acc"
        is={AccordionComponent}
        items={[
          { title: "Is MimicPC suitable for beginners?", content: "Yes. Start with presets and templates." },
          { title: "Can I try it for free?", content: "Free launch depends on plan & availability." },
          { title: "How does pricing work?", content: "Pricing depends on GPU tiers and usage." },
          { title: "Can I upload my own models?", content: "Yes, you can bring custom checkpoints & LoRAs." },
        ]}
        allowMultiple={false}
        defaultOpenIndex={0}
        cardBg={TOKENS.GLASS_BG}
        border={TOKENS.GLASS_BORDER}
        titleColor="rgba(000,000,000,.92)"
        contentColor="rgba(000,000,000,.80)"
      />
    </Element>
  );
};

(PresetFAQ as any).craft = { displayName: "Preset / FAQ" };
