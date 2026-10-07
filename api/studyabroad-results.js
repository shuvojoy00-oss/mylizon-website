export default async function handler(req, res) {
  try {
    const url = "https://api.github.com/repos/shuvojoy00-oss/mylizon-website/contents/assets/results/studyabroad?ref=main";
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "LizOn-Education-Website"
      }
    });

    if (response.status === 404) {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
      return res.status(200).json({ images: [] });
    }

    if (!response.ok) {
      return res.status(502).json({ images: [] });
    }

    const items = await response.json();
    const images = (Array.isArray(items) ? items : [])
      .filter(item => item.type === "file" && /\.(png|jpe?g|webp)$/i.test(item.name))
      .sort((a,b) => b.name.localeCompare(a.name))
      .map(item => ({
        name: item.name,
        url: "assets/results/studyabroad/" + encodeURIComponent(item.name).replace(/%2F/g, "/")
      }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json({ images });
  } catch (_) {
    return res.status(500).json({ images: [] });
  }
}
