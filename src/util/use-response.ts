import useSWR from "swr";

const dimension = 512;
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function convertEmojiToDataToDataURL(emoji: string): string {
  const element = document.createElement("canvas");
  const ctx = element.getContext("2d")!;
  element.height = dimension;
  element.width = dimension;
  ctx.fillStyle = "rgb(24 24 27)";
  ctx.fillRect(0, 0, element.width, element.height);
  ctx.textAlign = `center`;
  ctx.textBaseline = `middle`;
  ctx.font = `${dimension - 24}px serf`;
  ctx.fillText(emoji, 256, 256);
  return element.toDataURL("image/png", 1);
}
export const useResponse = (
  emoji: string,
  name: string,
  style: string,
  strength: number,
) => {
  const { data, isLoading } = useSWR(
    [emoji, name, style, strength],
    async ([base64, name, style, strength]) => {
      const response = await fetch("/api/run", {
        headers: {
          accept: "image/jpeg",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          input_image: convertEmojiToDataToDataURL(emoji).replace(
            /^data:image\/(png|jpeg);base64,/,
            "",
          ),
          prompt: `cute ${name}, ${style}`,
          guidance_scale: 8,
          lcm_steps: 50,
          seed: Math.floor(Math.random() * 2159232),
          steps: 4,
          strength,
          width: dimension,
          height: dimension,
        }),
        method: "POST",
      });
      if (response.status !== 200) return "";
      const blob = await response.blob();
      return await blobToBase64(blob);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      refreshWhenOffline: false,
      refreshInterval: 0,
    },
  );
  return { image: data as string, loading: isLoading };
};