import cheerio from 'cheerio';

export class Summary {
    public title: string;
    public description: string;
    public url: URL;
    public thumbnail: URL | undefined;
    public provider : string;

    constructor(html: string, provider: string) {
        this.provider = provider;
        
        const $ = cheerio.load(html);

        this.title = $(".Article-desc > a").text();
        this.description = $(".moreInfos-summary > p > span").text();
        this.url = new URL($("p.Article-desc > a").get(0).attribs.href, "https://www.fnac.pt/");

        let findImgNode = $("img.Article-itemVisualImg");
        if (findImgNode.length == 0 || findImgNode.get(0).attribs.src.startsWith("data:image")) {
            this.thumbnail = undefined;
        }
        else {
            let potentialNode = findImgNode.get(0);
            try {
                this.thumbnail = new URL(potentialNode.attribs.src);
            }
            catch (e) {
                try {
                    this.thumbnail = new URL(potentialNode.attribs["data-lazyimage"]);
                }
                catch (e) {
                    this.thumbnail = undefined;
                }
            }
        }
    }

    toString() {
        return JSON.stringify(this);
    }
}