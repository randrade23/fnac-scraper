import { Summary } from './classes/summary';
import axios, { AxiosResponse } from 'axios';
import StringFormat from 'string-format';
import cheerio from 'cheerio';
import { Book } from './classes/book';

// @ts-ignore
import { Summary as SummaryModel } from './models';

export module Fnac {
    const ItemsPerPage = 20;
    const SearchEndpoint = "https://www.fnac.pt/SearchResult/ResultList.aspx?SCat=2!1&sft=1&sl&Search=livro&ItemPerPage=" + ItemsPerPage + "&PageIndex={}";

    export function getBooks(howMany: number = ItemsPerPage) : Promise<Summary[]> {
        let numberOfRequests = Math.round(howMany / ItemsPerPage);
        if (howMany % ItemsPerPage > 0) numberOfRequests++;

        let requests : Promise<AxiosResponse>[] = [];
        for (let i = 0; i < numberOfRequests; i++) {
            let target = StringFormat(SearchEndpoint, (i * ItemsPerPage).toString());
            requests.push(axios.get(target));
        }

        return new Promise((resolve, reject) => {
            Promise.all(requests).then((responses : AxiosResponse[]) => {
                let summaries : Summary[] = [];
                responses.forEach((response: AxiosResponse) => {
                    const $ = cheerio.load(response.data);
                    const nodes : Cheerio = $(".Article-item");
                    nodes.each((index: number, element: CheerioElement) => {
                        let bookSummary = new Summary($.html(element), "Fnac");
                        summaries.push(bookSummary);
                    });
                });
                resolve(summaries);
            });
        });
    }
}

Fnac.getBooks(120).then((data : Summary[]) => {
    data.forEach((datum : Summary) => {
        let summary = SummaryModel.build({
            title: datum.title,
            description: datum.description,
            url: datum.url.href,
            thumbnail: datum.thumbnail ? datum.thumbnail.href : "",
            provider: datum.provider
        });
        summary.save().then(() => {
            console.log("Inserted: " + datum.title);
        })
    })
});