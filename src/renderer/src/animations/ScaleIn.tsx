import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  scale?: number;
}

const ScaleIn = ({ children, duration = 0.2, scale = 0.8 }: FadeInProps): JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, transform: `scale(${scale})` }}
      animate={{ opacity: 1, transform: "scale(1)" }}
      exit={{ opacity: 0, transform: `scale(${scale})` }}
      transition={{ duration, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
};

export default ScaleIn;
