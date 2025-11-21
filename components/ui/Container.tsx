import { ReactNode, ElementType } from "react"

type ContainerProps = {
  as?: ElementType
  className?: string
  children: ReactNode
}

export default function Container({ as: Component = "div", className = "", children }: ContainerProps) {
  const classes = ["mx-auto w-full max-w-6xl px-6 md:px-10", className].filter(Boolean).join(" ")
  return <Component className={classes}>{children}</Component>
}
