import React from "react"

type FeatureCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  className?: string
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className = "",
}: FeatureCardProps) => {
  return (
    <div
      className={`
        bg-white/10 
        backdrop-blur-sm 
        rounded-2xl 
        p-6 
        border border-white/20 
        shadow-lg 
        transition-all 
        hover:bg-white/15 
        hover:scale-[1.03]
        ${className}
      `}
    >
      <div className="flex gap-4 items-start my-2">
        
        {/* Icon container */}
        <div className="w-12 h-12 bg-[#FDB022] rounded-xl flex items-center justify-center">
          <Icon className="w-12 h-6"/>
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <h4 className="text-xl font-semibold text-white">
            {title}
          </h4>
          <p className="text-white/80 leading-relaxed">
            {description}
          </p>
        </div>

      </div>
    </div>
  )
}

export default FeatureCard
