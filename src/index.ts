import { Summary } from './classes/summary';
import axios, { AxiosResponse } from 'axios';
import StringFormat from 'string-format';
import cheerio from 'cheerio';
import { Book } from './classes/book';

// @ts-ignore
import { Summary as SummaryModel, Book as BookModel } from './models';

export module Fnac {
    const ItemsPerPage = 20;
    const SearchEndpoint = "https://www.fnac.pt/SearchResult/ResultList.aspx?SCat=2!1&sft=1&sl&Search=livro&ItemPerPage=" + ItemsPerPage + "&PageIndex={}";
    const Provider = "Fnac";

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
                        let bookSummary = new Summary($.html(element), Provider);
                        summaries.push(bookSummary);
                    });
                });
                summaries = summaries.slice(0, Math.min(summaries.length, howMany));
                resolve(summaries);
            });
        });
    }
}

Fnac.getBooks(5).then((data : Summary[]) => {
    data.forEach((summaryData : Summary) => {
        let summary = SummaryModel.build({
            title: summaryData.title,
            description: summaryData.description,
            url: summaryData.url.href,
            thumbnail: summaryData.thumbnail ? summaryData.thumbnail.href : "",
            provider: summaryData.provider
        });
        summary.save().then(() => {
            console.log("Inserted summary: " + summaryData.title);
            summaryData.book.then((bookData : Book) => {
                let book = BookModel.build({
                    title: bookData.title,
                    description: bookData.description,
                    thumbnail: bookData.thumbnail ? bookData.thumbnail.href : "",
                    provider: bookData.provider,
                    summary: summary.id,
                    price: bookData.price ? bookData.price : 0,
                    isbn: bookData.isbn ? bookData.isbn : "",
                });
                book.save().then(() => {
                    console.log("Inserted book: " + bookData.title);
                })
            });
        })
    })
});