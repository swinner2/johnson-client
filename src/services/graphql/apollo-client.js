import ApolloClient from 'apollo-boost';
import { NETWORK_INTERFACE } from '../../config'
import { getCookie, setCookie } from '../cookies'
import { updateToken } from '../../store/actions/token_actions'
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, from } from 'apollo-link';

const httpLink = new HttpLink({ uri: NETWORK_INTERFACE });

const tokenSeparator = '$'

const authMiddleware = new ApolloLink((operation, forward) => {
  const refreshToken = getCookie('refresh_token')
  const accessToken = getCookie('access_token')

  const token = `Bearer ${refreshToken + tokenSeparator + accessToken}`
  // add the authorization to the headers
  operation.setContext({
    headers: {
      authorization: token,
    }
  });

  return forward(operation);
})


// GET AND SEND TOKENS
// networkInterface.use([{
//   applyMiddleware(req, next) {
//     const refreshToken = getCookie('refresh_token')
//     const accessToken = getCookie('access_token')
//
//     if (refreshToken && accessToken) {
//       if (!req.options.headers) {
//         req.options.headers = {}
//       }
//
//       req.options.headers.authorization = `Bearer ${refreshToken + tokenSeparator + accessToken}`
//     }
//
//     next()
//   }
// }])
const authAfterware = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    if (response.headers.get('Authorization')) {
      const [refreshToken, accessToken] = response.headers.get('Authorization').split(tokenSeparator)
      setCookie('access_token', accessToken)
      setCookie('refresh_token', refreshToken)
      window.store.dispatch(updateToken({ refreshToken, accessToken }))
    }
    return response;
  });
});

// SET_TOKENS
// networkInterface.useAfter([{
//   applyAfterware({ response }, next) {
//     if (response.headers.get('Authorization')) {
//       const [refreshToken, accessToken] = response.headers.get('Authorization').split(tokenSeparator)
//       setCookie('access_token', accessToken)
//       setCookie('refresh_token', refreshToken)
//       window.store.dispatch(updateToken({ refreshToken, accessToken }))
//     }
//
//     next()
//   }
// }])

export default new ApolloClient({
  uri: NETWORK_INTERFACE,
  link: from([
      authMiddleware,
      authAfterware,
      httpLink
    ])
})
