declare module '*.tsx' {
  const value: React.ComponentType
  export default value
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.svg' {
  import React from 'react'
  const content: React.FC<React.SVGProps<SVGSVGElement>>
  export default content
}

declare global {
  interface Window {
    ENV: {
      NEXT_PUBLIC_STRIPE_PUBLIC_KEY: string
    }
  }
} 