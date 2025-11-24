import { SignIn } from '@clerk/nextjs'
import { colors, gradients } from '@/lib/design'

export default function Page() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ background: gradients.page }}
    >
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: `bg-[${colors.surface}] backdrop-blur-xl border border-purple-500/30 shadow-2xl`,
            headerTitle: `text-[${colors.textPrimary}]`,
            headerSubtitle: `text-[${colors.textMuted}]`,
            formButtonPrimary: `bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400`,
          }
        }}
      />
    </div>
  )
}
