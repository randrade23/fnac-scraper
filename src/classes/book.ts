import cheerio from 'cheerio';
import { Summary } from './summary';

export class Book {
    public title: string;
    public description: string;
    public thumbnail: URL | undefined;
    public provider : string;
    public summary : Summary;
    public price : number | undefined;
    public isbn : string | undefined; // Subject to change

    constructor(html: string, provider: string, summary : Summary) {
        this.provider = provider;
        this.summary = summary;
        
        const $ = cheerio.load(html);

        this.title = $("h1").text().trim();
        this.description = $(".strate > .whiteContent > p").text().trim();

        let findImgNode = $("img.f-productVisuals-mainMedia");
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

        let findPriceNode = $(".f-productOffers-tabs .js-productOffersTab");
        let priceClass = "";
        if (findPriceNode.length == 0) {
            if ($(".f-shopBox-MPInfoSellerItem f-shopBox-MPInfoSellerTitle").length == 0) {
                priceClass = ".f-priceBox-price";
            }
        }
        else {
            priceClass = "f-productOffers-tabLabel--price";
        }

        if (priceClass != "") {
            this.price = parseFloat($(priceClass).text().trim().replace("€", "").replace(",", "."));
        }

        let featureNodes = $(".Feature-item");
        featureNodes.each((index: number, element: CheerioElement) => {
            let $$ = cheerio.load(element);
            if ($$(".Feature-label").text().trim().toUpperCase() == "ISBN") {
                this.isbn = $$(".Feature-desc").text().trim().replace("-", "").replace("/", "");
            }
        });
    }

    toString() {
        return JSON.stringify(this);
    }
}