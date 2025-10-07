/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/questionnaires/vsme', destination: '/questionnaires/vsme/a', permanent: false },
      { source: '/questionnaires/vsme/overview', destination: '/questionnaires/vsme/a', permanent: false },
    ];
  },
};
export default nextConfig;
