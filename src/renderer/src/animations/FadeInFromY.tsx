import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  offset?: number;
}

const FadeInFromY = ({ children, duration = 0.2, offset = 64 }: FadeInProps): JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: offset }}
      transition={{ duration, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInFromY;
