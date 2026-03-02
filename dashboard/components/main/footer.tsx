import Image from "next/image";
import Link from "next/link";
import { RiTwitterXLine } from "react-icons/ri";
import { RxLinkedinLogo, RxGithubLogo, RxDiscordLogo } from "react-icons/rx";
import { FaYoutube } from "react-icons/fa";

const NAV_COLS = [
  {
    title: "CurbAI",
    links: [
      { name: "Home", href: "/#hero" },
      { name: "About us", href: "/#about" },
      { name: "Pricing", href: "/#pricing" },
      { name: "Customer Stories", href: "/#stories" },
      { name: "Contact us", href: "/#contact" },
      { name: "Extension", href: "/extension/curbai-extension.zip" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Free mentorship", href: "#" },
      { name: "Community", href: "#" },
      { name: "Designer", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of service", href: "#" },
      { name: "Privacy policy", href: "#" },
      { name: "CurbAI Designer Agreement", href: "#" },
    ],
  },
];

const SOCIAL = [
  { icon: RiTwitterXLine, href: "https://twitter.com", label: "X" },
  { icon: RxLinkedinLogo, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: RxGithubLogo, href: "https://github.com", label: "GitHub" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
  { icon: RxDiscordLogo, href: "https://discord.com", label: "Discord" },
];

export const Footer = () => {
  return (
    <footer className="w-full" style={{ background: "#1a1a1a" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-8 sm:pb-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-0">
          <div className="flex-[1.2] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/curbai-logo-transparent.png"
                alt="CurbAI Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-white font-bold text-xl tracking-tight">CurbAI</span>
            </div>

            <div className="flex items-center flex-wrap gap-4 mt-6 md:mt-12">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="text-gray-400 hover:text-white transition-colors text-lg"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex-[2] grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {NAV_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-base mb-5 tracking-wide">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 text-base hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#1e1e1e] mt-8 sm:mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-gray-500 text-sm">
            Copyright &copy; CurbAI {new Date().getFullYear()} | CurbAI is created and owned by CurbAI Inc.
          </span>
        </div>
      </div>
    </footer>
  );
};
