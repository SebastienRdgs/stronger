// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      version: process.env.VERSION || '0.0.1',
    }
  },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  plugins: [],
})
