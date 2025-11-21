import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-2xl"
          }
        }}
      />
    </div>
  )
}
