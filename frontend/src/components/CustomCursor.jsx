import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false)
    const cursorX = useSpring(0, { damping: 20, stiffness: 250 })
    const cursorY = useSpring(0, { damping: 20, stiffness: 250 })

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
            if (!isVisible) setIsVisible(true)
        }

        const handleMouseEnter = () => setIsVisible(true)
        const handleMouseLeave = () => setIsVisible(false)

        window.addEventListener('mousemove', moveCursor)
        document.body.addEventListener('mouseenter', handleMouseEnter)
        document.body.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            document.body.removeEventListener('mouseenter', handleMouseEnter)
            document.body.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [cursorX, cursorY, isVisible])

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
            style={{
                x: cursorX,
                y: cursorY,
                translateX: '-50%',
                translateY: '-50%',
                backgroundColor: 'white',
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
        />
    )
}

export default CustomCursor
