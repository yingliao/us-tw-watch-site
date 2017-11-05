module.exports = {
  css: [
    'bulma/css/bulma.css',
    '~/assets/css/main.css'
  ],
  render: {
    bundleRenderer: {
      cache: require('lru-cache')({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      shouldPreload: (file, type) => {
        return ['script', 'style', 'font'].includes(type)
      }
    }
  },
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    players: [
      { id: 1, name: 'Kobe Bryant', number: 24 },
      { id: 2, name: 'Michael Jordan', number: 23 },
      { id: 3, name: 'Stephen Curry', number: 30 },
      { id: 4, name: 'Lebron James', number: 23 },
      { id: 5, name: 'Kevin Durant', number: 35 },
      { id: 6, name: 'Kyrie Irving', number: 2 }
    ]
  },
  loading: '~/components/loading.vue',
  plugins: [
    '~/plugins/i18n.js',
    // ssr: false to only include it on client-side
    { src: '~/plugins/vue-notifications.js', ssr: false }
  ],
  generate: {
    routes: [
      '/fr',
      '/players/1',
      '/players/2',
      '/players/3',
      '/players/4',
      '/players/5',
      '/players/6'
    ]
  },
  router: {
    middleware: ['visits', 'user-agent', 'i18n'],
    base: process.env.BASE_URL ? process.env.BASE_URL : '/'
  },
  head: {
    titleTemplate: '%s - Paca',
    htmlAttrs: {
      'lang': 'en-US'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Meta description' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  srcDir: 'src/',
  build: {
    vendor: ['axios', 'mini-toastr', 'vue-notifications', 'vue-i18n'],

    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}