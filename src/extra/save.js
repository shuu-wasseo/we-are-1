import { generateName, SNSEngagements } from './mini.js'

const blank = {
	"profile": {
		"name": "modhaus",
		"progress": [1, 1, 1]
	},
	"resources": {
		"money": 100000000,
		"exp": 0,
		"upgrades": {}
	},
	"assets": {
		"trainees": {},
		"artists": {},
		"others": ["vocals", "rap", "dance", "stage presence", "passion"].map((s) => {
			const name = generateName()
			return {
				"name": name[0],
				"gender": name[1],
				"score": 0,
				"contract": 100000,
				"job": s,
				"position": s === "stage presence" ? "performance director" : s + " trainer" 
			}
		})
	},
	"sns": [
		{
			"userid": "@modhaus_official",
			"type": "announcement",
			"platform": "twitter",
			"image": "",
			"text": "this is the official page of our company.",
			"date": [1, 1, 1],
			"stats": {
				"likes": 0,
				"reposts": 0,
				"quotes": 0,
				"views": 0,
				"bookmarks": 0,
				"comments": 0
			}
		}
	],
	"settings": {},
	"info": [
		{
			type: "alert",
			date: [1, 1, 1],
			message: "welcome to we are 1! you can head to the trainees tab to buy some trainees! then, press the next button to move to the next week!",
			urgency: 0, 
			id: 0
		},
		{
			type: "money",
			date: [1, 1, 1],
			message: "starting capital!",
			gain: 100000000,
			id: 1
		}
	]
}

export function reset(force) {
  if (force || !Object.keys(localStorage).includes("data")) {
    localStorage.setItem("data", JSON.stringify(SNSEngagements(blank)))
  }
}
