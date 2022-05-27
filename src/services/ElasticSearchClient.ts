import axios, { AxiosResponse } from 'axios';

export interface ElasticSearchClient {
  cat: Cat;
}

interface Cat {
  indices: () => Promise<CatIndicesResponse>;
}

class CatImpl implements Cat {
  readonly endpoint: string;

  constructor(baseUrl: string) {
    this.endpoint = `${baseUrl}/_cat/indices?format=json`;
  }

  indices(): Promise<CatIndicesResponse> {
    return axios
      .get<void, AxiosResponse<CatIndicesResponse>>(this.endpoint)
      .then((response) => response.data);
  }
}

export type CatIndicesResponse = CatIndicesIndicesRecord[];

export interface CatIndicesIndicesRecord {
  index: string;
  status: string;
  health: string;
  bulkAvgSizeInBytes: string;
  'docs.count': string;
  'docs.deleted': string;
  'store.size': string;
  'pri.store.size': string;
  pri: string;
  rep: string;
  'pri.store': string;
}

export interface Document {}

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
