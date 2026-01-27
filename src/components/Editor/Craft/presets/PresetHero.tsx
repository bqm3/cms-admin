/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "../Components/Container";
import { HeadingComponent } from "../Components/HeadingComponent";
import { TextComponent } from "../Components/TextComponent";
import { ButtonComponent } from "../Components/ButtonComponent";
import { ImageComponent } from "../Components/ImageComponent";
import { TOKENS } from "./presetTokens";

export const PresetHero = () => {
  return (
    <Element
      canvas
      background="transparent"
      className="w-full"
      id="preset-hero"
      is={Container}
      padding={0}
    >
      <Element
        canvas
        background="transparent"
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
        id="hero-wrap"
        is={Container}
        padding={0}
      >
        {/* Left copy */}
        <Element
          canvas
          background="transparent"
          className="w-full"
          id="hero-left"
          is={Container}
          padding={0}
        >
          <Element
            id="hero-title"
            is={HeadingComponent}
            level="h1"
            text="Open-Source AI Platform, Customizable & Affordable"
          />
          <Element
            color={TOKENS.TEXT_SUB}
            fontSize={14}
            fontWeight="400"
            id="hero-sub"
            is={TextComponent}
            text="Effortlessly create AI images, videos, and audio. Train LoRAs, run workflows, and scale with secure, fast GPUs."
            textAlign="left"
          />
          <Element
            canvas
            background="transparent"
            className="flex items-center gap-3 mt-4"
            id="hero-actions"
            is={Container}
            padding={0}
          >
            <Element
              id="hero-btn-1"
              is={ButtonComponent}
              size="md"
              text="Free Launch"
              variant="bordered"
            />
            <Element
              id="hero-btn-2"
              is={ButtonComponent}
              size="md"
              text="Book a Demo"
              variant="bordered"
            />
          </Element>

          {/* small trust row */}
          <Element
            canvas
            background="transparent"
            className="flex flex-wrap gap-4 mt-6 text-xs"
            id="hero-trust"
            is={Container}
            padding={0}
          >
            {["Fast GPUs", "Private & Secure", "Templates", "Team Collab"].map(
              (t, i) => (
                <Element
                  key={i}
                  color="rgba(255,255,255,.65)"
                  fontSize={12}
                  fontWeight="500"
                  id={`hero-trust-${i}`}
                  is={TextComponent}
                  text={`• ${t}`}
                  textAlign="left"
                />
              ),
            )}
          </Element>
        </Element>

        {/* Right media */}
        <Element
          canvas
          background="transparent"
          className="w-full"
          id="hero-right"
          is={Container}
          padding={0}
        >
          <Element
            canvas
            background={TOKENS.GLASS_BG}
            className="rounded-2xl border border-white/10 shadow-2xl"
            id="hero-card"
            is={Container}
            padding={14}
          >
            <Element
              alt="Hero"
              id="hero-image"
              is={ImageComponent}
              src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80"
              width="100%"
              height="320px"
              objectFit="cover"
              radius="2xl"
            />
          </Element>
        </Element>
      </Element>
    </Element>
  );
};

(PresetHero as any).craft = { displayName: "Preset / Hero" };
