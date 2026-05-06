'use client'

import { useEffect, useRef, useState } from 'react'

export function CountUp({ to, suffix = '', duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
    const [n, setN] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const started = useRef(false)

    useEffect(() => {
        if (!ref.current) return
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting && !started.current) {
                        started.current = true
                        const start = performance.now()
                        const tick = (now: number) => {
                            const p = Math.min(1, (now - start) / duration)
                            const eased = 1 - Math.pow(1 - p, 3)
                            setN(Math.round(to * eased))
                            if (p < 1) requestAnimationFrame(tick)
                        }
                        requestAnimationFrame(tick)
                    }
                })
            },
            { threshold: 0.4 }
        )
        obs.observe(ref.current)
        return () => obs.disconnect()
    }, [to, duration])

    return (
        <span ref={ref}>
            {n}
            {suffix}
        </span>
    )
}
