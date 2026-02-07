/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  images: {
    domains: ['vibecaas.com', 'www.neuralquantum.ai'],
  },
};

export default nextConfig;
