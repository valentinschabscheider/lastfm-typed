import * as ArtistInterface from "../interfaces/artistInterface";
import Base from "../base";
import { ArtistInput } from "../interfaces/shared";

export default class ArtistClass extends Base {

	public async addTags(artist:string, tags:string[]|string, sk:string) {

		if (Array.isArray(tags)) {
			tags = tags.join(",");
		}

		return await this.sendRequest(this.key, this.secret, { method: "artist.addTags", tags, sk, artist }) as {};

	}

	public async getCorrection(artist:string) {
		
		return (((await this.sendRequest(this.key, this.secret, { method: "artist.getCorrection", artist }))?.corrections?.correction) || {}) as ArtistInterface.getCorrection|{};

	}

	public async getInfo(artist:ArtistInput, params?:{autocorrect?:0|1, username?:string, sk?:string, lang?:string}) {

		return (await this.sendRequest(this.key, this.secret, { method: "artist.getInfo", ...artist, ...params })).artist as ArtistInterface.getInfo;

	}

	public async getSimilar(artist:ArtistInput, params?:{limit?:number, autocorrect?:0|1}) {

		this.checkLimit(params?.limit, 1000);

		return (await this.sendRequest(this.key, this.secret, { method: "artist.getSimilar", ...artist, ...params })).similarartists as ArtistInterface.getSimilar;

	}
	
	public async getTags(artist:ArtistInput, usernameOrSessionKey:string, params?:{autocorrect?:0|1}) {

		return this.convertGetTags((await this.sendRequest(this.key, this.secret, { method: "artist.getTags", ...artist, user: usernameOrSessionKey, ...params })).tags) as ArtistInterface.getTags;

	}

	public async getTopAlbums(artist:ArtistInput, params?:{autocorrect?:0|1, page?:number, limit?:number}) {

		this.checkLimit(params?.limit, 1000);

		return (await this.sendRequest(this.key, this.secret, { method: "artist.getTopAlbums", ...artist, ...params })).topalbums as ArtistInterface.getTopAlbums;

	}

	public async getTopTags(artist:ArtistInput, params?:{autocorrect?:0|1}) {

		return (await this.sendRequest(this.key, this.secret, { method: "artist.getTopTags", ...artist, ...params })).toptags as ArtistInterface.getTopTags;

	}

	public async getTopTracks(artist:ArtistInput, params?:{autocorrect?:0|1, page?:number, limit?:number}) {

		this.checkLimit(params?.limit, 1000);

		return (await this.sendRequest(this.key, this.secret, { method: "artist.getTopTracks", ...artist, ...params })).toptracks as ArtistInterface.getTopTracks;

	}

	public async removeTag(artist:string, tag:string, sk:string) {

		return await this.sendRequest(this.key, this.secret, { method: "artist.removeTag", tag, sk, artist }) as {};

	}

	public async search(artist:string, params?:{limit:number, page:number}) {

		this.checkLimit(params?.limit, 1000);

		return (await this.sendRequest(this.key, this.secret, {method: "artist.search", artist, ...params})).results as ArtistInterface.search;

	}

}