import { motion } from 'framer-motion';
import { useScrollReveal, revealVariants } from '@/hooks/use-scroll-reveal';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: keyof typeof revealVariants;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const ScrollReveal = ({
  children,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  className = '',
  threshold = 0.1,
  rootMargin = '0px 0px -10% 0px',
  triggerOnce = true
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold, rootMargin, triggerOnce });

  const customVariant = {
    hidden: {
      ...revealVariants[variant].hidden,
      transition: { duration, ease: "easeOut", delay }
    },
    visible: {
      ...revealVariants[variant].visible,
      transition: { duration, ease: "easeOut", delay }
    }
  };

  return (
    <motion.div
      ref={ref as any}
      className={className}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={customVariant}
    >
      {children}
    </motion.div>
  );
};
