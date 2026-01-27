/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "../Components/Container";
import { HeadingComponent } from "../Components/HeadingComponent";
import { TextComponent } from "../Components/TextComponent";
import { TOKENS } from "./presetTokens";

export const PresetFooter = () => {
  return (
    <Element id="preset-footer" canvas is={Container} background="transparent" padding={0} className="w-full">
      <Element
        id="footer-card"
        canvas
        is={Container}
        background={TOKENS.GLASS_BG}
        padding={18}
        className="rounded-2xl border border-white/10"
      >
        <Element
          id="footer-grid"
          canvas
          is={Container}
          background="transparent"
          padding={0}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Element id="footer-col-1" canvas is={Container} background="transparent" padding={0}>
            <Element id="footer-brand" is={HeadingComponent} level="h4" text="MimicPC" />
            <Element
              id="footer-desc"
              is={TextComponent}
              text="Open-source AI platform to create, train, and deploy."
              fontSize={12}
              fontWeight="400"
              textAlign="left"
              color={TOKENS.TEXT_SUB}
            />
          </Element>

          <Element id="footer-col-2" canvas is={Container} background="transparent" padding={0}>
            <Element id="footer-links-h" is={TextComponent} text="Navigation" fontSize={12} fontWeight="700" textAlign="left" color="rgba(255,255,255,.85)" />
            {["Home", "Pricing", "Apps", "FAQ"].map((t, i) => (
              <Element key={i} id={`footer-link-${i}`} is={TextComponent} text={t} fontSize={12} fontWeight="400" textAlign="left" color="rgba(255,255,255,.70)" />
            ))}
          </Element>

          <Element id="footer-col-3" canvas is={Container} background="transparent" padding={0}>
            <Element id="footer-contact-h" is={TextComponent} text="Contact" fontSize={12} fontWeight="700" textAlign="left" color="rgba(255,255,255,.85)" />
            <Element id="footer-contact-1" is={TextComponent} text="support@mimicpc.com" fontSize={12} fontWeight="400" textAlign="left" color="rgba(255,255,255,.70)" />
            <Element id="footer-contact-2" is={TextComponent} text="Discord • X • GitHub" fontSize={12} fontWeight="400" textAlign="left" color="rgba(255,255,255,.70)" />
          </Element>
        </Element>

        <Element
          id="footer-bottom"
          canvas
          is={Container}
          background="transparent"
          padding={0}
          className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between"
        >
          <Element
            id="footer-copy"
            is={TextComponent}
            text={`© ${new Date().getFullYear()} — Built with Craft.js builder.`}
            fontSize={11}
            fontWeight="400"
            textAlign="left"
            color="rgba(255,255,255,.55)"
          />
          <Element
            id="footer-legal"
            is={TextComponent}
            text="Terms • Privacy"
            fontSize={11}
            fontWeight="400"
            textAlign="left"
            color="rgba(255,255,255,.55)"
          />
        </Element>
      </Element>
    </Element>
  );
};

(PresetFooter as any).craft = { displayName: "Preset / Footer" };
