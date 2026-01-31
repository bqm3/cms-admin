/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "../Components/Container";
import { HeadingComponent } from "../Components/HeadingComponent";
import { AccordionComponent } from "../Components/AccordionComponent";
import { TOKENS } from "./presetTokens";

export const PresetFAQ = () => {
  return (
    <Element
      id="preset-faq"
      canvas
      is={Container}
      background="transparent"
      padding={0}
      width="100%"
      alignItems="center"         // ✅ center children theo trục ngang
      className="w-full"
    >
      {/* wrapper để giới hạn/ căn giữa tiêu đề */}
      <Element
        id="faq-inner"
        canvas
        is={Container}
        background="transparent"
        padding={0}
        width="100%"
        className="w-full max-w-4xl mx-auto"   // ✅ bạn có thể đổi max-w-... tùy ý
        alignItems="stretch"
        gap={16}
      >
        <Element id="faq-title" is={HeadingComponent} level="h2" text="FAQ About MimicPC" />

        {/* bọc accordion bằng container stretch để nó full width */}
        <Element
          id="faq-acc-wrap"
          canvas
          is={Container}
          background="transparent"
          padding={0}
          width="100%"
          alignItems="stretch"
          className="w-full"
        >
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
            titleColor="rgba(0,0,0,.92)"
            contentColor="rgba(0,0,0,.80)"
          />
        </Element>
      </Element>
    </Element>
  );
};

(PresetFAQ as any).craft = { displayName: "Preset / FAQ" };
