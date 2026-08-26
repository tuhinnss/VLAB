"use client";
import React from "react";
import { Hero } from "./Hero.jsx";
import Stars from "./Stars.jsx";
import Comets from "./Comets.jsx";
import HeroBackground from "./HeroBackground";
import GradientBackground from "./GradientBackground.jsx";
import ScrollDown from "./ScrollDown";
import useTranslation from "../hooks/useTranslation.ts";

export default function FullLandingPage() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <section
      className={`ph-hero ${isCompleted ? "notranslate" : ""}`}
      aria-label={t("Hero")}
    >
      <GradientBackground />
      <Stars color="var(--stars-color)" opacity={0.3} />
      <Comets
        count={12}
        speed={1}
        direction="down-right"
        color="#AEE3FF"
        opacity={0.3}
        zIndex={1}
      />
      <HeroBackground />
      <Hero />
      <ScrollDown />
    </section>
  );
}
