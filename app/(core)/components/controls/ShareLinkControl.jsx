// app/components/controls/ShareLinkControl.jsx
"use client";
import { useMemo, useState } from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import Popup from "../Popup";

export default function ShareLinkControl({ simulation, inputs }) {
  const [open, setOpen] = useState(false);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const DEFAULT_SHARE_MESSAGE = `${t("Check out this simulation on V-LAB, it's")} ${simulation}! `;

  // Build URL with query parameters
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(inputs).toString();
    return `${window.location.origin}${simulation}?${params}`;
  }, [simulation, inputs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setOpen(true);
  };

  // Funzioni di condivisione per i vari social
  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      type: "primary",
    },
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(DEFAULT_SHARE_MESSAGE)}`,
      type: "primary",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      type: "primary",
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(DEFAULT_SHARE_MESSAGE + " " + url)}`,
      type: "primary",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(DEFAULT_SHARE_MESSAGE)}`,
      type: "primary",
    },
    {
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(DEFAULT_SHARE_MESSAGE)}`,
      type: "primary",
    },
    {
      label: "Instagram",
      href: `https://www.instagram.com/`, // Instagram non ha un vero sharer URL, si apre la homepage
      type: "primary",
    },
  ];

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <button
        onClick={handleCopy}
        className="btn-glow"
        title={t("Copy shareable link to clipboard")}
      >
        {t("Share")}
      </button>

      <Popup
        isOpen={open}
        onClose={() => setOpen(false)}
        popupContent={{
          title: t("Link Copied!"),
          description: t(
            "The shareable link has been copied to your clipboard.\n Share it now on Social Media:"
          ),
          buttons: [
            ...shareLinks.map((social) => ({
              label: social.label,
              onClick: () => {
                window.open(social.href, "_blank", "noopener,noreferrer");
              },
              type: social.type,
            })),
          ],
        }}
      />
    </div>
  );
}
