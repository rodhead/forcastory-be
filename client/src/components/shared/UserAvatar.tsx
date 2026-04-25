// src/components/shared/UserAvatar.tsx
import React, { useState } from 'react'
import { cn } from '@/utils/cn'

interface UserAvatarProps {
  picture?: string
  initials?: string
  name?: string
  size?: number        // px — sets w/h inline
  className?: string
  style?: React.CSSProperties
}

export function UserAvatar({ picture, initials, name, size, className, style }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)

  const fallback = initials ?? name?.[0]?.toUpperCase() ?? 'U'

  return (
    <div
      className={cn('flex items-center justify-center overflow-hidden font-bold', className)}
      style={size ? { width: size, height: size, ...style } : style}
    >
      {picture && !imgFailed ? (
        <img
          src={picture}
          alt={name ?? 'avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        fallback
      )}
    </div>
  )
}
