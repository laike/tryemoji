"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { usePrevious } from "@/util/use-previous";
import { useResponse } from "@/util/use-response";
import { EmojiStyle, Categories, Theme } from "emoji-picker-react";
import { Dice3, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useThrottledCallback } from "use-debounce";

const EmojiPicker = dynamic(
  async () => (await import("emoji-picker-react")).default,
  {
    ssr: false,
  },
);

const supportCategories = [
  Categories.ANIMALS_NATURE,
  Categories.FOOD_DRINK,
  Categories.TRAVEL_PLACES,
  Categories.ACTIVITIES,
  Categories.OBJECTS,
];

function getRandom<T>(arr: T[]): T {
  if (arr.length === 1) {
    return arr[0];
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

const presets = [
  {
    artist: "Vincent van Gogh",
    prompt:
      "in the style of Vincent van Gogh, with bold, expressive brush strokes and vibrant colors",
  },
  {
    artist: "Claude Monet",
    prompt:
      "in the style of Claude Monet, using impressionist techniques with a focus on light and color",
  },
  {
    artist: "Salvador Dalí",
    prompt:
      "in the style of Salvador Dalí, with dream-like, bizarre elements and melting clocks",
  },
  {
    artist: "Pierre-Auguste Renoir",
    prompt:
      "in the style of Pierre-Auguste Renoir, featuring soft, warm colors and fluid brushwork",
  },
  {
    artist: "Pablo Picasso",
    prompt:
      "in the style of Pablo Picasso's Cubism, with geometric shapes and multiple perspectives merged into one image.",
  },
  {
    artist: "Caravaggio",
    prompt:
      "in the style of Caravaggio, emphasizing dramatic lighting and realism",
  },
  {
    artist: "Rembrandt van Rijn",
    prompt:
      "in the style of Rembrandt, focusing on deep, rich colors and dramatic contrasts between light and shadow.",
  },
  {
    artist: "Michelangelo",
    prompt:
      "in the style of Michelangelo, focusing on the human form with detailed anatomy and dramatic poses, set in a mythological context.",
  },
  {
    artist: "Paul Gauguin",
    prompt:
      "in the style of Paul Gauguin, with bold colors and strong outlines",
  },
  {
    artist: "Edvard Munch",
    prompt:
      "in the style of Edvard Munch, using intense colors and bold lines to convey strong emotions, such as in 'The Scream'.",
  },
];

const presetImage =
  "data:image/jpeg;base64,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";

export default function Home() {
  const [emoji, setEmoji] = useState({ emoji: "🐱", name: "cat" });
  const [preset, setPreset] = useState(presets[0]);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const [strength, setStrength] = useState(0.7);
  const throttleSetStrength = useThrottledCallback(setStrength, 1000);
  const { image, loading } = useResponse(
    emoji.emoji,
    emoji.name,
    preset.prompt,
    strength,
  );
  const previousImage = usePrevious(image);

  const mergedImage = useMemo(
    () => image || previousImage || presetImage,
    [image, previousImage],
  );

  return (
    <div className="min-h-screen flex flex-col gap-4 bg-zinc-950 items-center justify-center py-12">
      <div className="text-6xl text-zinc-100">🐱 useEmoji </div>
      <div className="text-xl text-zinc-100">
        Turn emoji into amazing artwork via AI
      </div>
      <div className="flex items-center justify-center flex-col md:flex-row gap-4">
        <div className="flex-0 w-full md:w-80">
          <EmojiPicker
            width={"100%"}
            height={isSmallScreen ? 300 : 512}
            searchDisabled={isSmallScreen}
            onEmojiClick={(e) => {
              const emoji = e.emoji;
              const name = e.names[e.names.length - 1];
              setEmoji({ emoji, name });
            }}
            skinTonesDisabled
            emojiStyle={EmojiStyle.NATIVE}
            theme={Theme.DARK}
            categories={supportCategories.map((c) => ({
              name: c,
              category: c,
            }))}
          ></EmojiPicker>
        </div>
        <div className="flex-1">
          <div className="max-w-[100vw] h-[512px] w-[512px] rounded-lg overflow-hidden bg-zinc-900 relative">
            <img src={mergedImage} className="h-full w-full object-contain" />
            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
              <div className="text-xl text-zinc-100">AI</div>
              <Slider
                className="flex-1"
                defaultValue={[strength]}
                onValueChange={(v) => throttleSetStrength(v[0])}
                max={1}
                min={0.5}
                step={0.1}
              />
              <Select
                value={preset.artist}
                onValueChange={(value) =>
                  setPreset(presets.find((p) => p.artist === value)!)
                }
              >
                <SelectTrigger className="flex-0 w-56 border-0 rounded bg-amber-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((p) => (
                    <SelectItem key={p.artist} value={p.artist}>
                      {p.artist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setPreset(getRandom(presets))}
                className="flex-0 rounded bg-amber-600 px-0.5 py-0.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                <Dice3></Dice3>
              </button>
              <a
                href={image}
                download
                type="button"
                className="flex-0 block rounded bg-amber-600 px-0.5 py-0.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                <Download />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
