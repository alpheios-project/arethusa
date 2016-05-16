angular.module('fi.seco.sparql', [])
namespace fi.seco.sparql {
  'use strict'

  export interface ISparqlBinding {
    type: string,
    value: string,
    'xml:lang'? : string,
    datatype? : string
  }

  export interface ISparqlBindingResult<BindingType extends {[id: string]: ISparqlBinding}> {
    head: {
      vars: string[],
      link?: string[]
    },
    results: {
      bindings: BindingType[]
    }
  }

  export interface ISparqlAskResult {
    boolean: boolean
  }

  export class SparqlService {
    constructor(private $http: angular.IHttpService, private $q: angular.IQService) {}
    public check(endpoint: string, params?: {}): angular.IPromise<boolean> {
      let deferred: angular.IDeferred<any> = this.$q.defer()
      this.$http(
        angular.extend(
          {
            method: 'GET',
            url: endpoint,
            params: { query: 'ASK {}' },
            headers: { 'Accept': 'application/sparql-results+json' }
          },
          params
        )
      ).then(
        (response: angular.IHttpPromiseCallbackArg<ISparqlAskResult>) => deferred.resolve(response.data.boolean === true)
      , (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(false)
      )
      return deferred.promise;
    }
    public checkUpdate(endpoint: string, params?: {}): angular.IPromise<boolean> {
      let deferred: angular.IDeferred<any> = this.$q.defer()
      this.$http(
        angular.extend(
          {
            method: 'POST',
            url: endpoint,
            headers: { 'Content-Type' : 'application/sparql-update' },
            data: 'INSERT DATA {}'
          },
          params
        )
      ).then(
        (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(response.status === 204)
      , (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(false)
      )
      return deferred.promise;
    }
    public checkRest(endpoint: string, params?: {}): angular.IPromise<boolean> {
      let deferred: angular.IDeferred<any> = this.$q.defer()
      this.$http(
        angular.extend(
          {
            method: 'POST',
            url : endpoint + '?default',
            data : '',
            headers: { 'Content-Type' : 'text/turtle' }
          },
          params
        )
      ).then(
        (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(response.status === 204)
      , (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(false)
      )
      return deferred.promise;
    }
    public get(endpoint: string, graphIRI? : string, params? : {}): angular.IHttpPromise<string> {
      return this.$http(
        angular.extend(
          {
            method: 'GET',
            url : endpoint,
            params: graphIRI !== null ? { graph: graphIRI } : {'default': ''},
            headers: { 'Accept' : 'text/turtle' }
          },
          params
        )
      )
    }
    public post(endpoint: string, graph: string, graphIRI?: string, params? : {}): angular.IHttpPromise<string> {
      return this.$http(
        angular.extend(
          {
            method: 'POST',
            url : endpoint,
            params: graphIRI != null ? { graph: graphIRI } : {'default': ''},
            data: graph,
            headers: { 'Content-Type' : 'text/turtle' }
          },
          params
        )
      )
    }
    public put(endpoint: string, graph: string, graphIRI?: string, params? : {}): angular.IHttpPromise<string> {
      return this.$http(
        angular.extend(
          {
            method: 'PUT',
            url : endpoint,
            params: graphIRI != null ? { graph: graphIRI } : {'default': ''},
            data: graph,
            headers: { 'Content-Type' : 'text/turtle' }
          },
          params
        )
      )
    }
    public delete(endpoint: string, graphIRI: string, params?: {}): angular.IHttpPromise<string> {
      return this.$http(
        angular.extend(
          {
            method: 'DELETE',
            url: endpoint,
            params: graphIRI != null ? { graph: graphIRI } : {'default': ''}
          },
          params
        )
      )
    }
    public query<T extends {[id: string]: ISparqlBinding}>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<ISparqlBindingResult<T>> {
      if (query.length <= 2048)
        return this.$http(
          angular.extend(
            {
              method: 'GET',
              url: endpoint,
              params: { query: query },
              headers: { 'Accept' : 'application/sparql-results+json' }
            },
            params
          )
        )
      else
        return this.$http(
          angular.extend(
            {
              method: 'POST',
              url: endpoint,
              data: query,
              headers: {
                'Content-Type': 'application/sparql-query',
                'Accept' : 'application/sparql-results+json'
              }
            },
            params
          )
        )
    }
    public construct(endpoint: string, query: string, params?: {}): angular.IPromise<string> {
      if (query.length <= 2048)
        return this.$http(
          angular.extend(
            {
              method: 'GET',
              url : endpoint,
              params: { query: query },
              headers: { 'Accept' : 'text/turtle' }
            },
            params
          )
        )
      else
        return this.$http(
          angular.extend(
            {
              method: 'POST',
              url: endpoint,
              data: query,
              headers: {
                'Content-Type': 'application/sparql-query',
                'Accept' : 'text/turtle'
              }
            },
            params
          )
        )
    }
    public update(endpoint: string, query: string, params?: {}): angular.IPromise<string> {
      return this.$http(
        angular.extend(
          {
            method: 'POST',
            url: endpoint,
            headers: { 'Content-Type' : 'application/sparql-update' },
            data: query
          },
          params
        )
      )
    }
    public stringToSPARQLString(string): string {
      return '"' + string.replace(/"/g, '\\"') + '"'
    }
    public bindingsToObject<T>(result: {[id: string]: ISparqlBinding}): T {
      let ret: {} = {}
      for (let key in result) {
        ret[key] = this.bindingToValue(result[key])
      }
      return <T>ret
    }
    public bindingToValue(binding: ISparqlBinding): any {
      if (binding == null) return undefined
      if (binding.type === 'uri') return binding.value
      else if (binding.type === 'bnode') return binding.value
      else if (binding.datatype !== null) switch (binding.datatype) {
        case 'http://www.w3.org/2001/XMLSchema#integer':
        case 'http://www.w3.org/2001/XMLSchema#decimal': return parseInt(binding.value, 10)
        case 'http://www.w3.org/2001/XMLSchema#float':
        case 'http://www.w3.org/2001/XMLSchema#double': return parseFloat(binding.value)
        case 'http://www.w3.org/2001/XMLSchema#boolean': return binding.value ? true : false
        default:
      }
      return binding.value
    }
    public bindingToString(binding: ISparqlBinding): string {
      if (binding == null) return 'UNDEF'
      else {
        let value: string = binding.value.replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/[\b]/g, '\\b').replace(/\f/g, '\\f').replace(/\"/g, '\\"').replace(/\'/g, '\\\'')
        if (binding.type === 'uri') return '<' + value + '>'
        else if (binding.type === 'bnode') return '_:' + value
        else if (binding.datatype !== null) switch (binding.datatype) {
          case 'http://www.w3.org/2001/XMLSchema#integer':
          case 'http://www.w3.org/2001/XMLSchema#decimal':
          case 'http://www.w3.org/2001/XMLSchema#double':
          case 'http://www.w3.org/2001/XMLSchema#boolean': return value
          case 'http://www.w3.org/2001/XMLSchema#string': return '"' + value + '"'
          default: return '"' + value + '"^^<' + binding.datatype + '>'
        }
        else if (binding['xml:lang']) return '"' + value + '"@' + binding['xml:lang']
        else return '"' + value + '"'
      }
    }
  }
}
