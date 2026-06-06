/* eslint-disable import/order */
import { Container } from "./Components/Container";
import { TextComponent } from "./Components/TextComponent";
import { ButtonComponent } from "./Components/ButtonComponent";
import { ImageComponent } from "./Components/ImageComponent";
import { HeadingComponent } from "./Components/HeadingComponent";
import { CardComponent } from "./Components/CardComponent";
import { VideoComponent } from "./Components/VideoComponent";
import { TableComponent } from "./Components/TableComponent";
import { ShapeComponent } from "./Components/ShapeComponent";
import { RowComponent } from "./Components/RowComponent";
import { ColumnComponent } from "./Components/ColumnComponent";
import { InputComponent } from "./Components/InputComponent";
import { PopupModalComponent } from "./Components/PopupModalComponent";
import { PopupOfferComponent } from "./Components/PopupOfferComponent";
import { ScriptComponent } from "./Components/ScriptComponent";
import { NavbarComponent } from "./Components/NavbarComponent";
import { SectionComponent } from "./Components/SectionComponent";
import { GridComponent } from "./Components/GridComponent";
import { BadgeComponent } from "./Components/BadgeComponent";
import { AccordionComponent } from "./Components/AccordionComponent";
import { SpacerComponent } from "./Components/SpacerComponent";
import { SliderComponent } from "./Components/SliderComponent";
import { TiptapComponent } from "./Components/TiptapComponent";
import { SupersetDashboardComponent } from "./Components/SupersetDashboardComponent";

import { DefaultNewPostFrame } from "../DefaultNewPostFrame";
import { MimicPCLandingFrame } from "../MimicPCLandingFrame";
import { PortfolioTemplate } from "../PortfolioTemplate";
import { BlogTemplate } from "../BlogTemplate";
import { ServiceTemplate } from "../ServiceTemplate";
import { ContactTemplate } from "../ContactTemplate";
import { ProductTemplate } from "../ProductTemplate";
import { StoreCouponTemplate } from "../StoreCouponTemplate";

import { PresetHeader } from "./presets/PresetHeader";
import { PresetHero } from "./presets/PresetHero";
import { PresetOffersGrid } from "./presets/PresetOffersGrid";
import { PresetFAQ } from "./presets/PresetFAQ";
import { PresetFooter } from "./presets/PresetFooter";
import { PresetModuleLanding } from "./presets/PresetModuleLanding";

export const CRAFT_RESOLVER = {
  // Default frame
  DefaultNewPostFrame,
  MimicPCLandingFrame,
  PortfolioTemplate,
  BlogTemplate,
  ServiceTemplate,
  ContactTemplate,
  ProductTemplate,
  StoreCouponTemplate,

  // Components
  TextComponent,
  Container,
  ButtonComponent,
  ImageComponent,
  HeadingComponent,
  CardComponent,
  VideoComponent,
  TableComponent,
  ShapeComponent,
  RowComponent,
  ColumnComponent,
  NavbarComponent,
  SectionComponent,
  GridComponent,
  BadgeComponent,
  AccordionComponent,
  SpacerComponent,
  SliderComponent,
  TiptapComponent,
  InputComponent,
  PopupModalComponent,
  PopupOfferComponent,
  ScriptComponent,
  SupersetDashboardComponent,

  // Presets
  PresetHeader,
  PresetHero,
  PresetOffersGrid,
  PresetFAQ,
  PresetFooter,
  PresetModuleLanding,
};
