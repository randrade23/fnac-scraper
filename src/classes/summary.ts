import cheerio from 'cheerio';
import axios, { AxiosResponse } from 'axios';
import { Book } from './book';

const Sequelize = require('sequelize');
const Model = Sequelize.Model;

export class Summary {
    public title: string;
    public description: string;
    public url: URL;
    public thumbnail: URL | undefined;
    public provider : string;
    public book : Promise<Book>;

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

        this.book = new Promise((resolve, reject) => {
            axios.get(this.url.href).then((response : AxiosResponse) => {
                resolve(new Book(response.data, this.provider, this));
            });
        });
    }

    toString() {
        return JSON.stringify(this);
    }
}

export class SummaryModel extends Model {}