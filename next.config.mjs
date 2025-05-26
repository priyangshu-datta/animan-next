import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["knex"],
  images: {
    remotePatterns: [new URL("https://s4.anilist.co/**")],
  },
};

export default nextConfig;
