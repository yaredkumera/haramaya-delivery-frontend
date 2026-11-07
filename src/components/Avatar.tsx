import { useEffect, useState } from "react"
import { optimizeImage } from "../utils/format"

type AvatarProps = { name: string; url?: string; size?: number }

function Avatar({ name, url, size = 36 }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [url])

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  if (url && !failed) {
    return (
      <img
        src={optimizeImage(url, size * 2)}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full bg-slate-200 object-cover"
      />
    )
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-teal-600 font-semibold text-white"
    >
      {initials || "?"}
    </span>
  )
}

export default Avatar