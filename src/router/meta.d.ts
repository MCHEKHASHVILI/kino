import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Header overlays page content (e.g. pages with a backdrop image at the top) */
    overlayHeader?: boolean
    /** Guests are sent to LogInModal with a redirect back */
    requiresAuth?: boolean
  }
}
