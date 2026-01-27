/* eslint-disable prettier/prettier */
import React from "react";
import { Element } from "@craftjs/core";
import { Container } from "../Components/Container";
import { HeadingComponent } from "../Components/HeadingComponent";
import { TextComponent } from "../Components/TextComponent";
import { CardComponent } from "../Components/CardComponent";
import { ImageComponent } from "../Components/ImageComponent";
import { TOKENS } from "./presetTokens";

const cards = [
  { title: "Image Creation", desc: "Generate images with SDXL, Flux, etc.", img: "https://images.unsplash.com/photo-1520975693416-35a7d7c1d2d4?auto=format&fit=crop&w=1200&q=80" },
  { title: "Model Training", desc: "Train LoRA & fine-tune quickly.", img: "https://images.unsplash.com/photo-1520975958225-2b1b94f2c6a5?auto=format&fit=crop&w=1200&q=80" },
  { title: "Video Creation", desc: "Create short videos from prompts.", img: "https://images.unsplash.com/photo-1520975682290-9c9d4e6c1e62?auto=format&fit=crop&w=1200&q=80" },
  { title: "Face Swapping", desc: "Swap faces with control & safety.", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" },
  { title: "Audio Creation", desc: "Music, voice, and audio tools.", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80" },
  { title: "Large Language Models", desc: "Run LLMs & workflows securely.", img: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1200&q=80" },
];

export const PresetOffersGrid = () => {
  return (
    <Element id="preset-offers" canvas is={Container} background="transparent" padding={0} className="w-full">
      <Element id="offers-title" is={HeadingComponent} level="h2" text="We Can Offer" />
      <Element
        id="offers-sub"
        is={TextComponent}
        text="Choose what you need. Drag-drop blocks and customize everything."
        fontSize={13}
        fontWeight="400"
        textAlign="left"
        color={TOKENS.TEXT_SUB}
      />

      <Element
        id="offers-grid"
        canvas
        is={Container}
        background="transparent"
        padding={0}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
      >
        {cards.map((c, i) => (
          <Element
            key={i}
            id={`offer-card-${i}`}
            canvas
            is={CardComponent}
            background={TOKENS.GLASS_BG}
            padding={14}
            radius="sm"
            shadow="md"
            // className="border border-white/10"
          >
            <Element
              id={`offer-img-${i}`}
              is={ImageComponent}
              src={c.img}
              alt={c.title}
              width="100%"
            //   height={140}
            //   radius="xl"
            />
            <Element id={`offer-h-${i}`} is={HeadingComponent} level="h4" text={c.title} />
            <Element
              id={`offer-t-${i}`}
              is={TextComponent}
              text={c.desc}
              fontSize={12}
              fontWeight="400"
              textAlign="left"
              color="rgba(255,255,255,.70)"
            />
          </Element>
        ))}
      </Element>
    </Element>
  );
};

(PresetOffersGrid as any).craft = { displayName: "Preset / Offer Cards" };
