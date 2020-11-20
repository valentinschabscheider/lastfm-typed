import LFMRequest from "../request";
import * as GeoInterface from "../interfaces/geoInterface";
import Base from "../base";

export default class GeoClass extends Base {

	public async getTopArtists(country:string, params?:{limit?:number, page?:number}) {

		return await this.getTop("geo.getTopArtists", country, params) as GeoInterface.getTopArtists;

	}

	public async getTopTracks(country:string, params?:{limit?:number, page?:number, location?:string}) {

		return await this.getTop("geo.getTopTracks", country, params) as GeoInterface.getTopTracks;

	}

	private async getTop(method:string, country:string, params?:{limit?:number, page?:number, location?:string}) {
		this.checkLimit(params?.limit, 1000);

		return await new LFMRequest(this.key, this.secret, {method, country, ...params}).execute();
	}

}