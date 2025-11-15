import React from "react";
import { motion, MotionProps } from "framer-motion";
import Card from "../Card/Card";

type CardProps = React.ComponentProps<typeof Card>;

export type MotionCardProps = CardProps &
  MotionProps & {
    as?: any;
  };

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className = "", ...rest }, ref) => {
    return (
      <motion.div ref={ref} className={className} {...(rest as MotionProps)}>
        <Card className="" {...(rest as CardProps)}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export default MotionCard;
