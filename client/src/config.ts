// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'hmmugssu1g'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-v2k2mzssl022q8ts.us.auth0.com', // Auth0 domain
  clientId: 'uvw8YcZnmfXg1wTREHiFJ7ipDLz2c4kZ', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
