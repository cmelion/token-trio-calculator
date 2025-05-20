import { ArrowRight } from "lucide-react";

interface SwapArrowProps {
  onClick?: () => void;
}

const SwapArrow = ({ onClick }: SwapArrowProps) => {
  return (
    <button
      onClick={onClick}
      aria-label="Swap tokens"
      role="button"
      className="flex items-center justify-center w-8 h-8 -mx-1 z-10 bg-transparent border-none"
    >
      <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-md shadow-primary/10">
        <ArrowRight className="text-white w-4 h-4" />
      </div>
    </button>
  );
};

export default SwapArrow;