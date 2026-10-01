import { toBlob } from "html-to-image";
export async function renderCard(node: HTMLElement) {
  await document.fonts.ready;
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.decode().catch(() => {
        throw new Error("图片尚未准备好，请稍后再试。");
      }),
    ),
  );
  const blob = await toBlob(node, {
    pixelRatio: 3,
    backgroundColor: "#F3F0E8",
    skipFonts: true,
    cacheBust: false,
  });
  if (!blob) throw new Error("暂时未能生成，请再试一次。");
  return blob;
}
