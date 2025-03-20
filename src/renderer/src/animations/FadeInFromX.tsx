import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  offset?: number;
  gameId?: string;
}

const FadeInFromX = ({ children, duration = 0.2, offset = 64 }: FadeInProps): JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: offset }}
      transition={{ duration, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInFromX;
