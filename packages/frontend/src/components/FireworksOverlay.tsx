import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  active: boolean
}

export function FireworksOverlay({ active }: Props) {
  useEffect(() => {
    if (!active) return

    const end = Date.now() + 3000

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4652b0', '#8c99fc', '#85f6e5'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4652b0', '#8c99fc', '#85f6e5'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [active])

  return null
}
