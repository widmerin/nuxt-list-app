// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Nuxt List',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '/assets/css/main.scss',
    '/node_modules/materialize-css/dist/css/materialize.css',
    '/node_modules/material-design-icons/iconfont/material-icons.css'
  ],

  env: {
    SUPABASE_API_URL: process.env.SUPABASE_API_URL || '',
    SUPABASE_APP_KEY: process.env.SUPABASE_APP_KEY || '',
  },
  
  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
//  plugins: ['~/plugins/dataApi.js'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules: https://go.nuxtjs.dev/config-modules
  //modules: ['@nuxtjs/supabase'],


  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
})