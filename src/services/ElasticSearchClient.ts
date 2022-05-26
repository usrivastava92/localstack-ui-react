import axios from "axios";

export interface ElasticSearchClient {
  cat: Cat;
}

interface Cat {
  indices: () => Promise<CatIndicesResponse>;
}

class CatImpl implements Cat {

  readonly endpoint: string;

  constructor(baseUrl: string) {
    this.endpoint = `${baseUrl}/_cat/indices`;
  }

  indices(): Promise<CatIndicesResponse> {
    return axios.get<any, CatIndicesResponse>(this.endpoint);
  }

}

export type CatIndicesResponse = CatIndicesIndicesRecord[]

export interface CatIndicesIndicesRecord {
  status: string;
  bulkAvgSizeInBytes: string;
  docsCount: string;
  index: string;
}

export interface Index {

}

export interface Document {

}

interface ClientOptions {
  endpoint: string;
}

export class ElasticSearchClientImpl implements ElasticSearchClient {

  readonly endpoint: string;
  cat: Cat;

  constructor({ endpoint }: ClientOptions) {
    this.endpoint = endpoint;
    this.cat = new CatImpl(endpoint);
  }

}