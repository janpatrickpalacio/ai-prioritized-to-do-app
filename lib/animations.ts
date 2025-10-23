// Animation utilities and constants

export const ANIMATIONS = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-200",

  // Slide animations
  slideInFromTop: "animate-in slide-in-from-top-4 duration-300",
  slideInFromBottom: "animate-in slide-in-from-bottom-4 duration-300",
  slideInFromLeft: "animate-in slide-in-from-left-4 duration-300",
  slideInFromRight: "animate-in slide-in-from-right-4 duration-300",

  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-150",

  // Bounce animations
  bounceIn: "animate-in bounce-in duration-500",

  // Stagger animations for lists
  stagger: (index: number) =>
    `animate-in slide-in-from-bottom-4 duration-300 delay-${index * 50}`,

  // Hover animations
  hoverScale: "hover:scale-105 transition-transform duration-200",
  hoverLift: "hover:-translate-y-1 transition-transform duration-200",

  // Loading animations
  pulse: "animate-pulse",
  spin: "animate-spin",

  // Task-specific animations
  taskComplete: "animate-in slide-in-from-left-4 duration-500 ease-out",
  taskAdd: "animate-in zoom-in-95 slide-in-from-bottom-2 duration-400 ease-out",
  taskDelete: "animate-out fade-out zoom-out-95 duration-300 ease-in",

  // Matrix cell animations
  matrixCellHover: "hover:scale-102 transition-all duration-200",
  matrixTaskMove: "animate-in zoom-in-95 duration-300 ease-out",
};

export const TRANSITIONS = {
  // Standard transitions
  standard: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",

  // Specific property transitions
  colors: "transition-colors duration-200",
  transform: "transition-transform duration-200",
  opacity: "transition-opacity duration-200",

  // Interactive transitions
  button: "transition-all duration-200 hover:scale-105 active:scale-95",
  card: "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
  input: "transition-all duration-200 focus:scale-102",
};

export const EASING = {
  easeInOut: "ease-in-out",
  easeOut: "ease-out",
  easeIn: "ease-in",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// Animation delay utilities
export const DELAYS = {
  stagger: (index: number, baseDelay: number = 50) => `${index * baseDelay}ms`,
  fast: "100ms",
  medium: "200ms",
  slow: "300ms",
};

// Intersection Observer for scroll animations
export const createScrollAnimation = (threshold: number = 0.1) => {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: threshold },
    transition: { duration: 0.6, ease: "easeOut" },
  };
};
