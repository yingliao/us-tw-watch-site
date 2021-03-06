import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import appConfig from '~/config/app.json'

export default ctx => {
  const httpLink = new HttpLink({ uri: appConfig.api.url })
  // auth token
  // let token = ctx.isServer ? ctx.req.session : window.__NUXT__.state.session
  let token = null

  // middleware
  const middlewareLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: { authorization: `Bearer ${token}` }
    })
    return forward(operation)
  })
  const link = middlewareLink.concat(httpLink)
  return {
    link,
    cache: new InMemoryCache({
      dataIdFromObject: o => o.id
    })
  }
}
