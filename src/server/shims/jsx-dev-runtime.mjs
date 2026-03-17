// React 19 sets jsxDEV=undefined in production builds, but some pre-compiled
// dependencies (e.g. TanStack Router) call jsxDEV at runtime during SSR.
// Re-export jsx as jsxDEV from the production runtime where it's a real function.
export { jsx as jsxDEV, jsxs, Fragment } from 'react/jsx-runtime';
