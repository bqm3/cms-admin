import React from "react";
import { Element } from "@craftjs/core";

import { Container } from "./Craft/Components/Container";
import { SectionComponent } from "./Craft/Components/SectionComponent";
import { HeadingComponent } from "./Craft/Components/HeadingComponent";
import { TextComponent } from "./Craft/Components/TextComponent";
import { ButtonComponent } from "./Craft/Components/ButtonComponent";
import { CardComponent } from "./Craft/Components/CardComponent";
import { GridComponent } from "./Craft/Components/GridComponent";
import { BadgeComponent } from "./Craft/Components/BadgeComponent";
import { PresetHeader } from "./Craft/presets/PresetHeader";
import { PresetFooter } from "./Craft/presets/PresetFooter";
import { PresetFAQ } from "./Craft/presets/PresetFAQ";

export function StoreCouponTemplate() {
  return (
    <Element
      canvas
      background="#F3F4F6"
      className="min-h-screen"
      height="100%"
      id="store-coupon-page"
      is={Container}
      margin={0}
      padding={0}
      width="100%"
    >
      {/* Header */}
      <Element
        canvas
        background="transparent"
        borderRadius={0}
        id="s-header"
        is={SectionComponent}
        maxWidth="full"
        overlay={{ enabled: false, color: "" }}
        paddingX={0}
        paddingY={0}
      >
        <PresetHeader />
      </Element>

      {/* Main Content */}
      <Element
        canvas
        background="transparent"
        borderRadius={0}
        id="s-main"
        is={SectionComponent}
        maxWidth="xl"
        overlay={{ enabled: false, color: "" }}
        paddingX={20}
        paddingY={40}
      >
        <Element canvas align="start" columns={3} gap={30} id="s-grid" is={GridComponent} minItemWidth={300}>
          {/* Sidebar (1 column) */}
          <Element canvas background="transparent" className="col-span-1" id="s-sidebar" is={Container} padding={0}>
            <Element canvas background="#FFFFFF" id="s-store-card" is={CardComponent} padding={24} radius="lg" shadow="sm">
              <Element
                background="#F9FAFB"
                borderRadius={12}
                height="120px"
                id="s-store-logo"
                is={Container}
                margin={0}
                width="120px"
                alignItems="center"
                justifyContent="center"
              >
                <Element color="#9CA3AF" fontWeight="700" id="s-logo-placeholder" is={TextComponent} text="LOGO" textAlign="center" />
              </Element>

              <Element align="center" color="#111827" id="s-store-name" is={HeadingComponent} level="h2" text="Organimal" />
              <Element color="#F59E0B" id="s-store-rating" is={TextComponent} paddingTop={10} text="⭐⭐⭐⭐⭐ (4.8/5)" textAlign="center" />
              <Element
                color="#4B5563"
                fontSize={14}
                id="s-store-desc"
                is={TextComponent}
                paddingBottom={24}
                paddingTop={16}
                text="Organimal provides natural health solutions and supplements for your pets. Verified coupons and promo codes."
                textAlign="center"
              />
              <Element color="primary" fullWidth={true} id="s-visit-btn" is={ButtonComponent} radius="lg" text="Visit Official Store" />
            </Element>

            <Element canvas background="#FFFFFF" id="s-info-card" is={CardComponent} padding={20} radius="lg" shadow="sm">
              <Element align="left" color="#111827" id="s-info-title" is={HeadingComponent} level="h4" text="Store Information" />

              {/* ❌ bỏ div mt-4 space-y-3 -> ✅ dùng Container gap */}
              <Element
                id="s-info-list"
                canvas
                is={Container}
                background="transparent"
                padding={0}
                margin={0}
                flexDirection="column"
                gap={12}
                alignItems="flex-start"
                justifyContent="flex-start"
                width="100%"
              >
                <Element color="#6B7280" fontSize={13} id="s-info-item-1" is={TextComponent} text="Active Offers: 12" textAlign="left" />
                <Element color="#6B7280" fontSize={13} id="s-info-item-2" is={TextComponent} text="Best Discount: 20% Off" textAlign="left" />
                <Element color="#6B7280" fontSize={13} id="s-info-item-3" is={TextComponent} text="Average Savings: $15.40" textAlign="left" />
              </Element>
            </Element>
          </Element>

          {/* Coupon List (2 columns wide) */}
          <Element canvas background="transparent" className="col-span-2" id="s-content" is={Container} padding={0}>
            <Element canvas background="transparent" className="pb-5" id="s-content-header" is={Container} padding={0}>
              <Element align="left" color="#111827" id="s-content-title" is={HeadingComponent} level="h1" text="Organimal Promo Codes & Coupons" />
              <Element color="#6B7280" fontSize={14} id="s-content-subline" is={TextComponent} paddingTop={8} text="Last updated: January 30, 2026" textAlign="left" />
            </Element>

            {/* Coupon Cards */}
            {[
              { val: "15% OFF", title: "15% Off Your Entire Order", code: "SAVE15", type: "Code" },
              { val: "FREE SHIP", title: "Free Shipping on Orders Over $50", code: "", type: "Deal" },
              { val: "20% OFF", title: "20% Off Select Pet Supplements", code: "HEALTHY20", type: "Code" },
              { val: "BUY 1 GET 1", title: "BOGO Free on All Treats", code: "", type: "Deal" }
            ].map((cp, i) => (
              <Element key={i} canvas background="#FFFFFF" id={`s-coupon-${i}`} is={CardComponent} padding={24} radius="lg" shadow="sm" fullWidth>
                {/* ❌ bỏ div flex... -> ✅ Container row */}
                <Element
                  id={`s-cp-row-${i}`}
                  canvas
                  is={Container}
                  background="transparent"
                  padding={0}
                  margin={0}
                  width="100%"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="flex-start"
                  gap={24}
                >
                  {/* Discount Badge */}
                  <Element
                    background="#ECFDF5"
                    borderRadius={12}
                    height="80px"
                    id={`s-cp-badge-cont-${i}`}
                    is={Container}
                    width="100px"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Element
                      color="#059669"
                      fontSize={16}
                      fontWeight="800"
                      id={`s-cp-badge-text-${i}`}
                      is={TextComponent}
                      text={cp.val}
                      textAlign="center"
                    />
                  </Element>

                  {/* Coupon Info */}
                  <Element
                    canvas
                    background="transparent"
                    id={`s-cp-info-${i}`}
                    is={Container}
                    padding={0}
                    margin={0}
                    width="100%"
                    flexDirection="column"
                    gap={8}
                    alignItems="flex-start"
                    justifyContent="flex-start"
                  >
                    <Element align="left" color="#111827" id={`s-cp-title-${i}`} is={HeadingComponent} level="h3" text={cp.title} />

                    {/* ❌ bỏ div flex items... -> ✅ Container row */}
                    <Element
                      id={`s-cp-meta-${i}`}
                      canvas
                      is={Container}
                      background="transparent"
                      padding={0}
                      margin={0}
                      flexDirection="row"
                      gap={12}
                      alignItems="center"
                      justifyContent="flex-start"
                      width="100%"
                    >
                      <Element color="success" id={`s-cp-status-${i}`} is={BadgeComponent} radius="full" size="sm" text="VERIFIED" variant="soft" />
                      <Element color="#9CA3AF" fontSize={12} id={`s-cp-use-${i}`} is={TextComponent} text="Used 1.2k times today" textAlign="left" />
                    </Element>
                  </Element>

                  {/* Action Button */}
                  <Element
                    canvas
                    background="transparent"
                    id={`s-cp-action-${i}`}
                    is={Container}
                    padding={0}
                    margin={0}
                    width="160px"
                    alignItems="stretch"
                    justifyContent="center"
                  >
                    <Element
                      color={cp.type === "Code" ? "primary" : "secondary"}
                      fullWidth={true}
                      id={`s-cp-btn-${i}`}
                      is={ButtonComponent}
                      radius="lg"
                      text={cp.type === "Code" ? "Get Code" : "Get Deal"}
                    />
                  </Element>
                </Element>
              </Element>
            ))}

            {/* About Store Section */}
            <Element canvas background="#FFFFFF" borderRadius={16} id="s-about-store" is={Container} padding={30}>
              <Element align="left" color="#111827" id="s-about-title" is={HeadingComponent} level="h2" text="About Organimal" />
              <Element
                color="#4B5563"
                fontSize={16}
                id="s-about-text"
                is={TextComponent}
                paddingTop={16}
                text="Organimal is dedicated to improving pet health naturally. Their range of supplements and care products are formulated by experts using high-quality ingredients. Whether you are looking for joint support, digestive health, or general wellness for your furry friends, Organimal has a solution."
                textAlign="left"
              />
            </Element>
          </Element>
        </Element>
      </Element>

      {/* FAQ — CHỈ SỬA CHIỀU NGANG (xem phần 2) */}
      <Element canvas background="transparent" borderRadius={0} id="s-faq-sec" is={SectionComponent} maxWidth="xl" overlay={{ enabled: false, color: "" }} paddingX={20} paddingY={60} > <PresetFAQ /> </Element>

      {/* Footer */}
      <Element
        canvas
        background="transparent"
        borderRadius={0}
        id="s-footer"
        is={SectionComponent}
        maxWidth="full"
        overlay={{ enabled: false, color: "" }}
        paddingX={0}
        paddingY={0}
      >
        <PresetFooter />
      </Element>
    </Element>
  );
}
