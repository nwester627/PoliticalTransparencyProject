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
    // Apply the incoming className to both the motion wrapper and the inner Card
    // so styles that expect the card container to be a flex parent work correctly.
    return (
      <motion.div ref={ref} className={className} {...(rest as MotionProps)}>
        <Card className={className} {...(rest as CardProps)}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export default MotionCard;
