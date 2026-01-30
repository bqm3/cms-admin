/* eslint-disable prettier/prettier */
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
            id="store-coupon-page"
            is={Container}
            canvas
            padding={0}
            margin={0}
            background="#F3F4F6"
            width="100%"
            height="100%"
            className="min-h-screen"
        >
            {/* Header */}
            <Element
                id="s-header"
                is={SectionComponent}
                canvas
                maxWidth="full"
                paddingY={0}
                paddingX={0}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetHeader />
            </Element>

            {/* Main Content */}
            <Element
                id="s-main"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={40}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <Element id="s-grid" is={GridComponent} columns={3} gap={30} canvas minItemWidth={300} align="start">

                    {/* Sidebar (1 column) */}
                    <Element id="s-sidebar" is={Container} canvas background="transparent" padding={0} className="col-span-1">
                        <Element id="s-store-card" is={CardComponent} canvas padding={24} background="#FFFFFF" radius="lg" shadow="sm">
                            <Element id="s-store-logo" is={Container} background="#F9FAFB" width="120px" height="120px" borderRadius={12} margin={0} className="mx-auto mb-5 border border-gray-100 flex items-center justify-center">
                                <Element id="s-logo-placeholder" is={TextComponent} text="LOGO" fontWeight="700" color="#9CA3AF" textAlign="center" />
                            </Element>
                            <Element id="s-store-name" is={HeadingComponent} text="Organimal" level="h2" align="center" color="#111827" />
                            <Element id="s-store-rating" is={TextComponent} text="⭐⭐⭐⭐⭐ (4.8/5)" color="#F59E0B" textAlign="center" paddingTop={10} />
                            <Element id="s-store-desc" is={TextComponent} text="Organimal provides natural health solutions and supplements for your pets. Verified coupons and promo codes." color="#4B5563" fontSize={14} textAlign="center" paddingTop={16} paddingBottom={24} />
                            <Element id="s-visit-btn" is={ButtonComponent} text="Visit Official Store" color="primary" fullWidth={true} radius="lg" />
                        </Element>

                        <Element id="s-info-card" is={CardComponent} canvas padding={20} background="#FFFFFF" radius="lg" shadow="sm" className="mt-6">
                            <Element id="s-info-title" is={HeadingComponent} text="Store Information" level="h4" color="#111827" align="left" />
                            <div className="mt-4 space-y-3">
                                <Element id="s-info-item-1" is={TextComponent} text="Active Offers: 12" color="#6B7280" fontSize={13} textAlign="left" />
                                <Element id="s-info-item-2" is={TextComponent} text="Best Discount: 20% Off" color="#6B7280" fontSize={13} textAlign="left" />
                                <Element id="s-info-item-3" is={TextComponent} text="Average Savings: $15.40" color="#6B7280" fontSize={13} textAlign="left" />
                            </div>
                        </Element>
                    </Element>

                    {/* Coupon List (2 columns wide) */}
                    <Element id="s-content" is={Container} canvas background="transparent" padding={0} className="col-span-2">
                        <Element id="s-content-header" is={Container} canvas background="transparent" padding={0} className="pb-5">
                            <Element id="s-content-title" is={HeadingComponent} text="Organimal Promo Codes & Coupons" level="h1" color="#111827" align="left" />
                            <Element id="s-content-subline" is={TextComponent} text="Last updated: January 30, 2026" color="#6B7280" fontSize={14} textAlign="left" paddingTop={8} />
                        </Element>

                        {/* Coupon Cards */}
                        {[
                            { val: "15% OFF", title: "15% Off Your Entire Order", code: "SAVE15", type: "Code" },
                            { val: "FREE SHIP", title: "Free Shipping on Orders Over $50", code: "", type: "Deal" },
                            { val: "20% OFF", title: "20% Off Select Pet Supplements", code: "HEALTHY20", type: "Code" },
                            { val: "BUY 1 GET 1", title: "BOGO Free on All Treats", code: "", type: "Deal" }
                        ].map((cp, i) => (
                            <Element key={i} id={`s-coupon-${i}`} is={CardComponent} canvas padding={24} background="#FFFFFF" radius="lg" shadow="sm" className="mb-4">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {/* Discount Badge */}
                                    <Element id={`s-cp-badge-cont-${i}`} is={Container} background="#ECFDF5" width="100px" height="80px" borderRadius={12} className="border-2 border-dashed border-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <Element id={`s-cp-badge-text-${i}`} is={TextComponent} text={cp.val} color="#059669" fontWeight="800" fontSize={16} textAlign="center" />
                                    </Element>

                                    {/* Coupon Info */}
                                    <Element id={`s-cp-info-${i}`} is={Container} canvas background="transparent" padding={0} className="flex-1">
                                        <Element id={`s-cp-title-${i}`} is={HeadingComponent} text={cp.title} level="h3" color="#111827" align="left" />
                                        <div className="flex items-center gap-3 mt-2">
                                            <Element id={`s-cp-status-${i}`} is={BadgeComponent} text="VERIFIED" color="success" variant="soft" size="sm" radius="full" />
                                            <Element id={`s-cp-use-${i}`} is={TextComponent} text="Used 1.2k times today" color="#9CA3AF" fontSize={12} textAlign="left" />
                                        </div>
                                    </Element>

                                    {/* Action Button */}
                                    <Element id={`s-cp-action-${i}`} is={Container} canvas background="transparent" padding={0} width="160px">
                                        <Element
                                            id={`s-cp-btn-${i}`}
                                            is={ButtonComponent}
                                            text={cp.type === "Code" ? "Get Code" : "Get Deal"}
                                            color={cp.type === "Code" ? "primary" : "secondary"}
                                            fullWidth={true}
                                            radius="lg"
                                        />
                                    </Element>
                                </div>
                            </Element>
                        ))}

                        {/* About Store Section */}
                        <Element id="s-about-store" is={Container} canvas padding={30} background="#FFFFFF" borderRadius={16} className="mt-8 shadow-sm">
                            <Element id="s-about-title" is={HeadingComponent} text="About Organimal" level="h2" color="#111827" align="left" />
                            <Element id="s-about-text" is={TextComponent} text="Organimal is dedicated to improving pet health naturally. Their range of supplements and care products are formulated by experts using high-quality ingredients. Whether you are looking for joint support, digestive health, or general wellness for your furry friends, Organimal has a solution." color="#4B5563" fontSize={16} textAlign="left" paddingTop={16} />
                        </Element>
                    </Element>
                </Element>
            </Element>

            {/* FAQ */}
            <Element
                id="s-faq-sec"
                is={SectionComponent}
                canvas
                maxWidth="xl"
                paddingY={60}
                paddingX={20}
                background="transparent"
                overlay={{ enabled: false, color: "" }}
                borderRadius={0}
            >
                <PresetFAQ />
            </Element>

            {/* Footer */}
            <Element
                id="s-footer"
                is={SectionComponent}
                canvas
                maxWidth="full"
                paddingY={0}
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
