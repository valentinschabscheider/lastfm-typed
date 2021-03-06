import LastFM from "..";
import { Image } from "../interfaces/shared";
import * as ArtistInterface from "../interfaces/artistInterface";
import * as AlbumInterface from "../interfaces/albumInterface";
import * as TrackInterface from "../interfaces/trackInterface";
import * as UserInterface from "../interfaces/userInterface";

export default class HelperClass {

	private lastfm:LastFM;

	public constructor(lastfm:LastFM) {
		this.lastfm = lastfm;
	}

	public async getCombo(usernameOrSessionKey:string, limit:number) {
		let combo = [true, true, true];
		let comboData:[string,number][] = [["",0],["",0],["",0]];
		let page = 0;
		let nowplaying = false;
		let trueLimit = 1000;
		let image:Image[] = [];
		while (limit > 0 && combo[0] === combo[1] && combo[1] === combo[2] && combo[2] === true) {

			if (limit < 1000 && page > 0) {

				trueLimit = limit;
				limit = 1000;

			} else if (page === 0 && limit <= 1000) {

				trueLimit = limit;

			}

			page++;

			let res = await this.lastfm.user.getRecentTracks(usernameOrSessionKey, {limit: Math.min(1000, limit), page});

			if (page === 1) {
				comboData[0][0] = res.track[0].artist.name;
				comboData[1][0] = res.track[0].album.name;
				comboData[2][0] = res.track[0].name;
				image = res.track[0].image;

				if (comboData[1][0] === "") {
					combo[1] = false;
				}
			}

			if (res.track[0]["@attr"]?.nowplaying) {
				nowplaying = true;
				res.track = res.track.slice(1);
			}

			for (let i = 0; i < trueLimit; i++) {
				if (!combo[0] && !combo[1] && !combo[2]) {
					break;
				}

				if (combo[0]) {
					if (comboData[0][0] === res.track[i].artist.name) {
						comboData[0][1]++;
					} else {
						combo[0] = false;
					}
				}

				if (combo[1]) {
					if (comboData[1][0] === res.track[i].album.name) {
						comboData[1][1]++;
					} else {
						combo[1] = false;
					}
				}

				if (combo[2]) {
					if (comboData[2][0] === res.track[i].name) {
						comboData[2][1]++;
					} else {
						combo[2] = false;
					}
				}
			}

		}

		return {
			artist: {
				name:comboData[0][0],
				combo:comboData[0][1]
			},
			album: {
				name:comboData[1][0],
				combo:comboData[1][1]
			},
			track: {
				name:comboData[2][0],
				combo:comboData[2][1]
			},
			nowplaying,
			image
		};
	}

	public async getNowPlaying(usernameOrSessionKey:string, detailTypes:("artist"|"album"|"track")[] = []) {

		const currTrack = (await this.lastfm.user.getRecentTracks(usernameOrSessionKey, {limit: 1})).track[0];

		const artist = currTrack.artist.name;
		const track = currTrack.name;
		const image = currTrack.image;
		const album = currTrack.album?.name;
		const url = currTrack.url;
		const nowplaying = currTrack["@attr"]?.nowplaying === "true";

		const details:{
			artist:{
				data?:ArtistInterface.getInfo;
				successful:boolean;
			}
			album:{
				data?:AlbumInterface.getInfo;
				successful:boolean;
			}
			track:{
				data?:TrackInterface.getInfo;
				successful:boolean;
			}
		} = {
			artist: {
				successful: false
			},
			album: {
				successful: false
			},
			track: {
				successful: false
			}
		};

		if (detailTypes !== []) {

			const res = await this.fetchDetails(usernameOrSessionKey, detailTypes, artist, album, track);

			const exists = res.map((e) => typeof e.error === "undefined");

			let i = 0;

			if (detailTypes.includes("artist")) {
				details.artist.data = res[i];
				details.artist.successful = exists[i];
				i++;
			}
			if (detailTypes.includes("album") && album) {
				details.album.data = res[i];
				details.album.successful = exists[i];
				i++;
			}
			if (detailTypes.includes("track")) {
				details.track.data = res[i];
				details.track.successful = exists[i];
				i++;
			}

			return {
				recent: {
					artist,
					album,
					track,
					image,
					url,
					nowplaying
				},
				details
			};

		}

		return {
			recent: {
				artist,
				album,
				track,
				image,
				url,
				nowplaying
			},
			details: {
				artist: {
					successful: false
				},
				album: {
					successful: false
				},
				track: {
					successful: false
				},
			}
		}

	}

	public async getMatchingArtists(user1:string, user2:string, limit:number, period:"overall"|"7day"|"1month"|"3month"|"6month"|"12month") {
		
		this.checkLimit(limit, 1000);

		let request = [
			this.lastfm.user.getTopArtists(user1, {limit, period}),
			this.lastfm.user.getTopArtists(user2, {limit, period})
		];

		const res = await Promise.all(request);

		return this.getIntersection(res[0].artist, res[1].artist);

	}

	public ArtistFromMBID(mbid:string) {
		return {
			mbid
		}
	}

	public ArtistFromName(artist:string) {
		return {
			artist
		}
	}

	public AlbumFromMBID(mbid:string) {
		return {
			mbid
		}
	}

	public AlbumFromName(artist:string, album:string) {
		return {
			artist,
			album
		}
	}

	public TrackFromMBID(mbid:string) {
		return {
			mbid
		}
	}

	public TrackFromName(artist:string, track:string) {
		return {
			artist,
			track,
		}
	}

	private getIntersection(arr1:UserInterface.TopArtist[], arr2:UserInterface.TopArtist[]){
		const aSort = arr1.sort((a, b) => a.name.localeCompare(b.name));
		const bSort = arr2.sort((a, b) => a.name.localeCompare(b.name));
		let i1 = 0;
		let i2 = 0;
		let common = [];

		while (i1 < aSort.length && i2 < bSort.length) {

			const compare = aSort[i1].name.localeCompare(bSort[i2].name);

			if (compare === 0) {
				common.push({
					name: aSort[i1].name,
					url: aSort[i1].url,
					playcount: [parseInt(aSort[i1].playcount), parseInt(bSort[i2].playcount)]
				});
				i1++;
				i2++;
			} else {
				i1 += +(compare < 0);
				i2 += +(compare > 0);
			}
		}
		return common;
	}


	private async fetchDetails(usernameOrSessionKey:string, detailTypes:("artist"|"album"|"track")[], artist:string, album:string, track:string) {

		let promises:Promise<any>[] = [];

		if (detailTypes?.includes("artist")) {
			promises.push(this.lastfm.artist.getInfo({artist}, {username: usernameOrSessionKey}).catch((err) => {}));
		}
		if (detailTypes?.includes("album") && album) {
			promises.push(this.lastfm.album.getInfo({artist, album}, {username: usernameOrSessionKey}).catch((err) => {}));
		}
		if (detailTypes?.includes("track")) {
			promises.push(this.lastfm.track.getInfo({artist, track}, {username: usernameOrSessionKey}).catch((err) => {}));
		}

		return await Promise.all(promises);

	}

	private checkLimit(limit:number|undefined, maxLimit:number) {
		if (typeof limit !== "undefined" && (limit > maxLimit || limit < 1)) {
			throw new Error(`Limit out of bounds (1-${maxLimit}), ${limit} passed`);
		}
	}

}