import * as fs from "fs";
import axios from "axios";

const data = JSON.parse(fs.readFileSync("input.json", "utf8"));
const assetUrl =
  "https://cdn.discordapp.com/app-assets/1096190356233670716/{id}.png?size=4096";

fs.writeFileSync(
  "data.json",
  JSON.stringify(
    data.map((section: any) => {
      const id = section.name.toLowerCase();
      const path = "data/" + id;

      return {
        id,
        name: section.name,
        summary: section.summary,
        logo: path + "/logo.png",
        banner: path + "/banner.png",
        items: section.products.map((item: any) => {
          const thing = item.items[0];

          const id = item.name.toLowerCase().replaceAll(" ", "-");
          console.log(id);
          const itemPath =
            path +
            `/${
              thing.type === 0 ? "avatar-decoration" : "profile-effects"
            }/${id}`;

          return {
            type: thing.type,
            id: id,
            name: item.name,
            summary: item.summary,
            path: itemPath,
          };
        }),
      };
    })
  )
);

data.forEach((section: any) => {
  const path = "data/" + section.name.toLowerCase();
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  console.log(`Created folder ${path}.`);

  downloadFile(assetUrl.replace("{id}", section.logo), path + "/logo.png");
  downloadFile(assetUrl.replace("{id}", section.banner), path + "/banner.png");

  section.products.forEach((item: any) => {
    const thing = item.items[0];
    // todo
    if (thing.type === 1) return;

    const id = item.name.toLowerCase().replaceAll(" ", "-");
    console.log(id);
    const itemPath =
      path +
      `/${thing.type === 0 ? "avatar-decoration" : "profile-effects"}/${id}`;

    console.log(itemPath);

    if (!fs.existsSync(itemPath)) {
      fs.mkdirSync(itemPath, { recursive: true });
    }

    if (thing.type === 0) {
      downloadFile(
        `https://cdn.discordapp.com/avatar-decoration-presets/${thing.asset}.png?size=4096&passthrough=true`,
        itemPath + "/animated.png"
      );
      downloadFile(
        `https://cdn.discordapp.com/avatar-decoration-presets/${thing.asset}.png?size=4096&passthrough=false`,
        itemPath + "/still.png"
      );
    } else if (thing === 1) {
      downloadFile(
        `https://cdn.discordapp.com/assets/profile_effects/effects/b17d139f2e9/${id}/intro.png`,
        itemPath + "/intro.png"
      );
      downloadFile(
        `https://cdn.discordapp.com/assets/profile_effects/effects/b17d139f2e9/${id}/loop.png`,
        itemPath + "/loop.png"
      );
    }
  });
});

async function downloadFile(url: string, path: string): Promise<void> {
  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(path);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
