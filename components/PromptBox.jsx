import { assets } from "@/assets/assets";
import Image from "next/image";
import React from "react";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = React.useState("");

  return (
    <form
      className={`w-full ${false ? "max-w-3xl" : "max-w-2xl"} 
    bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm">

        <div className="flex items-center gap-2">
          <p
            className="flex items-center gap-2 text-xs border border-gray-300/40
          px-2 py-1 rounded-full cursor-pointer"
          >
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            DeepThink (R1)
          </p>
          <p
            className="flex items-center gap-2 text-xs border border-gray-300/40
          px-2 py-1 rounded-full cursor-pointer"
          >
            <Image className="h-5" src={assets.search_icon} alt="" />
            Search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
