
import { ArrowRight } from "lucide-react";

const SwapArrow = () => {
  return (
    <div className="flex items-center justify-center w-8 h-8 -mx-1 z-10">
      <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-md shadow-primary/10">
        <ArrowRight className="text-white w-4 h-4" />
      </div>
    </div>
  );
};

export default SwapArrow;
