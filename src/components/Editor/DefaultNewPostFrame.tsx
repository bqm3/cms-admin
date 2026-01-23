/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { useEditor, Editor, Frame, Element } from "@craftjs/core";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Save,
  ChevronLeft,
  Image as ImageIcon,
  Layout,
  MonitorPlay,
  Layers,
} from "lucide-react";

import api, { SERVER_URL } from "../../services/api";

// Import các Craft Components
import { TextComponent } from "./Craft/Components/TextComponent";
import { Container } from "./Craft/Components/Container";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { ImageComponent } from "./Craft/Components/ImageComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { CardComponent } from "./Craft/Components/CardComponent";
import { VideoComponent } from "./Craft/Components/VideoComponent";
import { TableComponent } from "./Craft/Components/TableComponent";
import { ShapeComponent } from "./Craft/Components/ShapeComponent";
import { RowComponent } from "./Craft/Components/RowComponent";
import { ColumnComponent } from "./Craft/Components/ColumnComponent";
import { Toolbox } from "./Craft/Toolbox";
import { SettingsPanel } from "./Craft/SettingsPanel";

export function DefaultNewPostFrame() {
  const PAGE_BG = "#070A0F";              // nền page
  const CARD_BG = "rgba(24, 24, 27, .55)"; // nền card (zinc-900/opacity)
  const CARD_BORDER = "1px solid rgba(255,255,255,.08)";

  const TEXT_SUB = "#A1A1AA"; // zinc-400

  return (
    <Frame>
      <Element
        canvas
        is={Container}
        background={PAGE_BG}
        className="min-h-full text-white"
        height="100%"
        padding={40}
        width="100%"
      >
        {/* HERO */}
        <Element
          is={CardComponent}
          background={CARD_BG}
          padding={0}
          radius={"none"}
          shadow={"none"}
        >
          <div
            className="p-8"
            style={{
              border: CARD_BORDER,
              borderRadius: 16,
              background: "transparent",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <HeadingComponent text="Viverelondon Coupons and Promo Codes" level="h2" />
                <TextComponent
                  text="Tổng hợp deal đã xác thực, cập nhật nhanh để người dùng thao tác ngay."
                  fontSize={0}
                  fontWeight={""}
                  textAlign={""}
                  color={TEXT_SUB}
                />

                <div className="mt-4 flex gap-2 flex-wrap">
                  <ButtonComponent text="All" color="default" variant="flat" size="md" radius="full" fullWidth={false} />
                  <ButtonComponent text="Verified" color="success" variant="solid" size="md" radius="full" fullWidth={false} />
                  <ButtonComponent text="Codes" color="primary" variant="flat" size="md" radius="full" fullWidth={false} />
                  <ButtonComponent text="Deals" color="warning" variant="flat" size="md" radius="full" fullWidth={false} />
                </div>
              </div>

              <div className="w-full md:w-[280px]">
                <div
                  style={{
                    border: CARD_BORDER,
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <ImageComponent src="https://placehold.co/560x360/png" alt="Store Logo" />
                </div>
              </div>
            </div>
          </div>
        </Element>

        {/* GRID: LEFT STORE BOX + RIGHT DEALS LIST */}
        <Element is={RowComponent} canvas>
          {/* LEFT */}
          <Element is={ColumnComponent} canvas>
            <Element
              is={CardComponent}
              background={CARD_BG}
              padding={0}
              radius={"none"}
              shadow={"none"}
            >
              <div
                className="p-5 space-y-3"
                style={{ border: CARD_BORDER, borderRadius: 16 }}
              >
                <HeadingComponent text="Vivere London" level="h4" />
                <TextComponent
                  text="Rating: 5.0 (30 votes)"
                  fontSize={0}
                  fontWeight={""}
                  textAlign={""}
                  color={TEXT_SUB}
                />

                <ButtonComponent
                  text="Get Coupon Alert"
                  color="success"
                  variant="solid"
                  size="md"
                  radius="md"
                  fullWidth={true}
                  href="https://example.com"
                  openInNewTab={true}
                />

                <div className="pt-2 text-xs space-y-1" style={{ color: TEXT_SUB }}>
                  <div className="flex justify-between">
                    <span>Coupon Codes</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deals</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Offer</span>
                    <span>10% Off</span>
                  </div>
                </div>
              </div>
            </Element>
          </Element>

          {/* RIGHT */}
          <Element is={ColumnComponent} canvas>
            <div className="space-y-4">
              {[
                "Extra 10% Off Previous Purchase Price",
                "Save Up To 10% Off Your Purchase",
                "Get Up To 10% Off Your Order",
              ].map((title, idx) => (
                <Element
                  key={idx}
                  is={CardComponent}
                  background={CARD_BG}
                  padding={0}
                  radius={"none"}
                  shadow={"none"}
                >
                  <div
                    className="p-5 flex items-center justify-between gap-4"
                    style={{ border: CARD_BORDER, borderRadius: 16 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-emerald-400 font-bold whitespace-nowrap">
                        10% Off
                      </div>

                      <div>
                        <div className="text-[12px] text-emerald-400 font-semibold">
                          Verified Deal
                        </div>

                        {/* đảm bảo title luôn trắng */}
                        <div className="text-sm font-semibold text-white">{title}</div>

                        <div className="text-xs mt-1" style={{ color: TEXT_SUB }}>
                          Discover difference discounts now! Deal này dành cho bạn nếu muốn.
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <ButtonComponent
                        text="Get Deal"
                        color="success"
                        variant="solid"
                        size="md"
                        radius="md"
                        fullWidth={false}
                        href="https://example.com"
                        openInNewTab={true}
                      />
                    </div>
                  </div>
                </Element>
              ))}
            </div>
          </Element>
        </Element>

        {/* ABOUT STORE */}
        <div className="mt-8">
          <HeadingComponent text="About store" level="h3" />
          <Element is={CardComponent} background={CARD_BG} padding={0} radius={"none"} shadow={"none"}>
            <div className="p-6 space-y-3" style={{ border: CARD_BORDER, borderRadius: 16 }}>
              <HeadingComponent text="ABOUT Vivere London" level="h4" />
              <TextComponent text="/VI.VE.RE/" fontSize={0} fontWeight={""} textAlign={""} color={TEXT_SUB} />
              <TextComponent
                text="Nội dung giới thiệu cửa hàng. Bạn có thể thay nội dung này nhanh chóng mà không phải dựng từ đầu."
                fontSize={0}
                fontWeight={""}
                textAlign={""}
                color={TEXT_SUB}
              />
            </div>
          </Element>
        </div>

        {/* OPTIONAL */}
        <div className="mt-8 grid gap-4">
          <HeadingComponent text="Our Values" level="h3" />
          <Element is={VideoComponent} videoId="dQw4w9WgXcQ" source="youtube" width="100%" />
          <Element is={TableComponent} />
        </div>
      </Element>
    </Frame>
  );
}



