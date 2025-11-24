import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/subscription-tiers'

interface UpgradePromptProps {
  currentTier: SubscriptionTier
  onClose: () => void
}

export default function UpgradePrompt({ currentTier, onClose }: UpgradePromptProps) {
  const tiers: SubscriptionTier[] = ['free', 'pro', 'premium']
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-8 max-w-5xl w-full border border-purple-500/30 shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Upgrade Your Plan
            </h2>
            <p className="text-gray-300 mt-2">Unlock more dreams and premium features</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const tierData = SUBSCRIPTION_TIERS[tier]
            const isCurrent = tier === currentTier
            
            return (
              <div
                key={tier}
                className={`
                  rounded-xl p-6 border-2 transition-all
                  ${isCurrent 
                    ? 'border-cyan-400 bg-cyan-400/10 scale-105' 
                    : 'border-purple-500/30 bg-black/20 hover:border-purple-400/50'
                  }
                `}
              >
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tierData.name}
                  </h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    ${tierData.price}
                    <span className="text-sm text-gray-400">/mo</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tierData.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-300">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/30"
                  >
                    Current Plan
                  </button>
                ) : tier === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg bg-gray-600/20 text-gray-400 font-semibold"
                  >
                    Downgrade
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      alert(`Stripe integration coming soon! You selected ${tierData.name} - $${tierData.price}/mo`)
                      onClose()
                    }}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-purple-500/50"
                  >
                    Upgrade to {tierData.name}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          All plans include secure cloud storage and AI-powered dream analysis
        </p>
      </div>
    </div>
  )
}
