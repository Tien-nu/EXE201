import LoginTemplate from "@modules/account/templates/login-template"

// Signed-out visitors (or an expired login) on any /account/... page get the
// sign-in form there instead of "Page not found"; after signing in the same
// page shows its content.
export default function LoginFallback() {
  return <LoginTemplate />
}
