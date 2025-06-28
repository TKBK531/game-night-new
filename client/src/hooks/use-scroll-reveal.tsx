import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -10% 0px',
    triggerOnce = true
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Animation variants for different reveal effects
export const revealVariants = {
  fadeInUp: {
    hidden: { 
      opacity: 0, 
      y: 50,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  fadeInDown: {
    hidden: { 
      opacity: 0, 
      y: -50,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  fadeInLeft: {
    hidden: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  fadeInRight: {
    hidden: { 
      opacity: 0, 
      x: 50,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  fadeIn: {
    hidden: { 
      opacity: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  scaleIn: {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },
  slideInUp: {
    hidden: { 
      opacity: 0, 
      y: 100,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }
};

// Stagger animation for multiple children
export const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};
