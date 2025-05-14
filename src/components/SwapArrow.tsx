
import { ArrowRight } from "lucide-react";

const SwapArrow = () => {
  return (
    <div className="flex items-center justify-center w-12 h-12">
      <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-md shadow-primary/10">
        <ArrowRight className="text-white w-5 h-5" />
      </div>
    </div>
  );
};

export default SwapArrow;
