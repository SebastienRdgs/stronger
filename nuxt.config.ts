// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      version: process.env.VERSION || '1.0.0',
    },
  },
  app: {
    baseURL: '/stronger/',
    buildAssetsDir: 'assets',
  },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  plugins: [],
});
