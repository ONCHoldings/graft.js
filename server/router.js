// Implement a separate router object to handle the
// paths we will mount.
//
// We do this to work around the fact that express will
// register the app.router middleware the moment any route
// is mounted.
//
// this causes chaos in contrib modules that need to have
// their routers mounted in different orders.


