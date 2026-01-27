/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "../Components/Container";
import { HeadingComponent } from "../Components/HeadingComponent";
import { TextComponent } from "../Components/TextComponent";
import { TOKENS } from "./presetTokens";

export const PresetFooter = () => {
  const IS_LIGHT_BG = true; // nếu footer nằm trên nền trắng (page bg trắng)

  const TEXT_MAIN = IS_LIGHT_BG ? "rgba(17,17,17,.92)" : "rgba(255,255,255,.92)";
  const TEXT_SUB  = IS_LIGHT_BG ? "rgba(17,17,17,.70)" : TOKENS.TEXT_SUB;
  const CARD_BG   = IS_LIGHT_BG ? "rgba(255,255,255,.85)" : TOKENS.GLASS_BG;
  const CARD_BD   = IS_LIGHT_BG ? "1px solid rgba(0,0,0,.08)" : "1px solid rgba(255,255,255,.10)";

  return (
    <Element
      id="preset-footer"
      canvas
      is={Container}
      background="transparent"
      padding={0}
      className="w-full"
    >
      <Element
        id="footer-card"
        canvas
        is={Container}
        background={CARD_BG}
        padding={18}
        // nếu Container đang set border bằng style riêng thì bạn giữ className và dùng style ở Container component
        className="rounded-2xl"
        borderColor={CARD_BD as any}
      >
        <Element
          id="footer-grid"
          canvas
          is={Container}
          background="transparent"
          padding={0}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Element
            id="footer-col-1"
            canvas
            is={Container}
            background="transparent"
            padding={0}
            className="flex flex-col gap-2"
          >
            <Element id="footer-brand" is={HeadingComponent} level="h4" text="MimicPC" color={TEXT_MAIN as any} />
            <Element
              id="footer-desc"
              is={TextComponent}
              text="Open-source AI platform to create, train, and deploy."
              fontSize={12}
              fontWeight="400"
              textAlign="left"
              color={TEXT_SUB}
            />
          </Element>

          <Element
            id="footer-col-2"
            canvas
            is={Container}
            background="transparent"
            padding={0}
            className="flex flex-col gap-2"
          >
            <Element
              id="footer-links-h"
              is={TextComponent}
              text="Navigation"
              fontSize={12}
              fontWeight="700"
              textAlign="left"
              color={TEXT_MAIN}
            />
            {["Home", "Pricing", "Apps", "FAQ"].map((t, i) => (
              <Element
                key={i}
                id={`footer-link-${i}`}
                is={TextComponent}
                text={t}
                fontSize={12}
                fontWeight="400"
                textAlign="left"
                color={TEXT_SUB}
              />
            ))}
          </Element>

          <Element
            id="footer-col-3"
            canvas
            is={Container}
            background="transparent"
            padding={0}
            className="flex flex-col gap-2"
          >
            <Element
              id="footer-contact-h"
              is={TextComponent}
              text="Contact"
              fontSize={12}
              fontWeight="700"
              textAlign="left"
              color={TEXT_MAIN}
            />
            <Element
              id="footer-contact-1"
              is={TextComponent}
              text="support@mimicpc.com"
              fontSize={12}
              fontWeight="400"
              textAlign="left"
              color={TEXT_SUB}
            />
            <Element
              id="footer-contact-2"
              is={TextComponent}
              text="Discord • X • GitHub"
              fontSize={12}
              fontWeight="400"
              textAlign="left"
              color={TEXT_SUB}
            />
          </Element>
        </Element>

        <Element
          id="footer-bottom"
          canvas
          is={Container}
          background="transparent"
          padding={0}
          className="mt-6 pt-4 border-t flex items-center justify-between"
        >
          <Element
            id="footer-copy"
            is={TextComponent}
            text={`© ${new Date().getFullYear()} — Built with Craft.js builder.`}
            fontSize={11}
            fontWeight="400"
            textAlign="left"
            color={IS_LIGHT_BG ? "rgba(17,17,17,.55)" : "rgba(255,255,255,.55)"}
          />
          <Element
            id="footer-legal"
            is={TextComponent}
            text="Terms • Privacy"
            fontSize={11}
            fontWeight="400"
            textAlign="left"
            color={IS_LIGHT_BG ? "rgba(17,17,17,.55)" : "rgba(255,255,255,.55)"}
          />
        </Element>
      </Element>
    </Element>
  );
};

(PresetFooter as any).craft = { displayName: "Preset / Footer" };
