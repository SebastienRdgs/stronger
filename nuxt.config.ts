// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      version: process.env.VERSION || '0.0.1',
    }
  },
  app: {
    baseURL: '/nuxt-github-pages/',
    buildAssetsDir: 'assets'
  },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  plugins: [],
})
