"use client";
import Link from "next/link";
import BackToTopButton from "./BackToTop";
import useTranslation from "../hooks/useTranslation";

const links = [
  { label: "Home", to: "/", exact: true },
  { label: "Simulations", to: "/simulations" },
];

function Footer() {
  const year = new Date().getFullYear();

  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  return (
    <footer className={isCompleted ? "notranslate" : ""}>
      <div className="footer-content">
        <div className="footer-section footer-about">
          <h3>
            V-LAB
          </h3>
          <p>
            {t(
              "A small web application to help student understand physics with cool interactive simulations and easily understandable theory."
            )}
          </p>
        </div>
        <div className="footer-section footer-links">
          <h3 className="footer-center">{t("Quick Links")}</h3>
          <ul>
            {links.map(({ to, label }) => (
              <li key={to}>
                <div className="footer-links-dot" />
                <Link href={to}>{t(label)}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {year} V-LAB. {t("Interactive physics simulations for learning.")}
        </p>
        <BackToTopButton />
      </div>
    </footer>
  );
}

export default Footer;
