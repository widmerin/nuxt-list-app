export default {
  target: 'static',
  ssr: true,

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
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~assets/css/main.scss',
    '~node_modules/materialize-css/dist/css/materialize.css',
    '~node_modules/material-design-icons/iconfont/material-icons.css'
  ],

  env: {
    SUPABASE_API_URL: process.env.SUPABASE_API_URL || '',
    SUPABASE_APP_KEY: process.env.SUPABASE_APP_KEY || '',
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/dotenv',
    '@nuxtjs/pwa',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],

  pwa: {
    manifest: {
      name: 'List App',
      short_name: 'List App',
      lang: 'de'
    },
    icon: {
      fileName: 'app-icon.png',
      purpose: "maskable"

    },

  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
