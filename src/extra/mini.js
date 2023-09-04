import Asset from '../tabs/company/Asset'
import Upgrade from '../tabs/upgrades/Upgrade'
import SNS from '../tabs/side/SNS'
import Gravity from '../tabs/gravity/Gravity'
import { names, upgradeLines, SNSLines } from './lines'

import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';
import { useState, useEffect } from 'react'

export function format(num) {
  if (num >= 0) {
    num = Math.round(num * 1000) / 1000
    const str = num.toString()
    if (num >= 1000) {
      let sciNot = num.toExponential(3).replace("+", "").split("e")
      sciNot[-1] = format(parseInt(sciNot[-1]))
      return sciNot.join("e")
    } else {
      return str
    }
  } else if (num < 0) {
    return "-" + format(-num)
  }
}

export function datify(date) {
  return `${date[0]}년, ${date[1]}월, ${date[2]}주`
}

export function getScore(t) {
  const idol = Object.values(t.skills.idol).reduce((partialSum, a) => partialSum + a / Object.keys(t.skills.idol).length, 0);
  const creative = Object.values(t.skills.creative).reduce((partialSum, a) => partialSum + a / Object.keys(t.skills.creative).length, 0);
  return Math.floor(idol * 0.7 + creative * 0.3)
}

export function getGrade(g) {
  if (g >= 100) {
    return "SSS+"
  }
  const letters = ["U", "F", "E", "D", "C", "B", "A", "S", "SS", "SSS"]
  const letter = letters[Math.floor(g/10)]
  const symbols = ["-", "", "+"]
  const symbol = symbols[Math.floor((g%10)*0.3)]
  return letter + symbol
}

export function MainTab({tab, subtab}) {
  let data = JSON.parse(localStorage.getItem("data")) 

  const [newMemberName, setNewMemberName] = useState("")
  const [gravityType, setGravityType] = useState("grand (batches)")

  switch (tab) {
    case 0:
      switch (subtab) {
        case 0:
          return (
            <div className="asset-container">
              {Object.values(data.assets.trainees).map((t) => {
                return <Asset type="trainee" data={t} />
              })}
            </div>
          )
        case 1:
          return (
            <div className="asset-container">
              {data.assets.others.map((a) => {
                return <Asset type="others" data={a} />
              })}
            </div>
          )
      }
    case 1:
      if (Object.keys(data.assets.artists).length) {
        const artistName = Object.keys(data.assets.artists)[subtab]
        const artist = data.assets.artists[artistName]
        let eligibleTrainees = Object.keys(data.assets.trainees).filter((t) => {
          return artist.type === "coed" || data.assets.trainees[t].gender === artist.type
        })
        return (
          <div>
            <h3>"{artist.slogan}"</h3>
            <h4>{artistName} has {totalFans(artistName)} fans.</h4>
            <div className="asset-container">
              {Object.keys(artist.members).map((t) => {
                return <Asset type="member" data={artist.members[t]} data2={artist} number={t} />
              })}
              <form className="asset-grid employee-grid" onSubmit={e => addMember(e, artist)}>
                <label>
                  new member: <select name="trainee" onChange={e => setNewMemberName(data.assets.trainees[e.target.value].name)}>
                    {
                      eligibleTrainees.map((t) => {
                        return <option value={t}>{data.assets.trainees[t].name}</option>
                      })
                    }
                  </select>
                </label>
                <label>
                  stage name: <input name="name" defaultValue={newMemberName}/>
                </label>
                <button type="submit">add</button>
              </form>
            </div>
            <form>
              <label>
                type: <select name="type" onChange={e => setGravityType(e.target.value)}>
                  {
                    ["grand (batches)", "grand (pool)", "event (brackets)", "event (pool)"].map((t) => {
                      return <option value={t}>{t}</option>
                    })
                  }
                </select>
              </label>
              <Gravity gravityType={gravityType} group={artist} />
            </form>
          </div>
        )
      }
      return <div></div>
    case 2:
      switch (subtab) {
        case 0:
          return (
            <div className="medium-grid">
              {[...Array(5).keys()].map((i) => {
                return <Upgrade type="trainees" num={i} />
              })} 
            </div>
          )
        case 1:
          return (
            <form className="create-artist" onSubmit={addArtist}>
              <label>
                group name: <input name="name" defaultValue="tripleS" />
              </label>
              <label>
                slogan: <input name="slogan" defaultValue="we are 1 and also 24 (the idol of all possibilities)" />
              </label>
              <label>
                prefix: <input name="prefix" defaultValue="S" />
              </label>
              <label>
                suffix: <input name="suffix" defaultValue=".SSS" />
              </label>
              <label>
                type: <select name="type">
                  <option value="coed">coed group</option>
                  <option value="female">girl group</option>
                  <option value="male">boy group</option>
                </select>
              </label>
              <button type="submit">submit</button>
            </form>
          )
        case 2:
          return (
            <div className="medium-grid">
              <Upgrade type="hiring" num={0} />
            </div>
          )
      }
  }
}

function formify(e) {
  const form = e.target
  const formData = new FormData(form)
  const formJson = Object.fromEntries(formData.entries())
  return formJson
}

function addMember(e, group) {
  e.preventDefault()

  let data = JSON.parse(localStorage.getItem("data"))

  const formJson = formify(e) 
  const number = Object.keys(data.assets.artists[group.name].members).length + 1

  let member = {
    ...data.assets.trainees[formJson.trainee],
    "stagename": formJson.name,
    "fans": 0,
    "serial": group.prefix + (number), 
    "debut": "",
	  "color": "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
	  "discography": [],
	  "contract": "",
	  "objekts": {
		  "artist": {
			  "season": []
		  }
	  },
	  "stats": {
		  "work": 0
	  }
  }

  delete data.assets.trainees[formJson.trainee]

  data.assets.artists[group.name].members[formJson.name] = member

  data = newInfo(data, [
    {
      type: "alert",
      message: `${member.stagename} (${member.name}) has been added to ${group.name}!`,
      urgency: 0,
      color: member.color,
    }
  ])

  data = postSNS(data, group.name, ["twitter", "youtube"].map((p) => {
    return {
      type: "announcement",
      platform: p,
      image: "",
      text: `${group.name}: ${member.stagename}${group.suffix}`,
      boost: number + 1
    }
  }))

  localStorage.setItem("data", JSON.stringify(data))
}

function addArtist(e) {
  e.preventDefault()

  let data = JSON.parse(localStorage.getItem("data"))

  const formJson = formify(e)

  data.assets.artists[formJson.name] = {
    "name": formJson.name,
    "fandom": "",
    "fans": 0,
    "type": formJson.type,
    "slogan": formJson.slogan,
    "debut": "",
    "prefix": formJson.prefix,
    "suffix": formJson.suffix,
	  "members": {},
	  "units": {},
	  "gravities": {},
	  "discography": {},
	  "sns": []
  }

  data = newInfo(data, [
    {
      type: "alert",
      message: `new group ${formJson.name} has been created!`,
      urgency: 0
    }
  ])

  data = postSNS(data, formJson.name, [
    {
      type: "announcement",
      platform: "twitter",
      image: "",
      text: `this is the official twitter account for ${formJson.name}, a new group under ${data.profile.name}.`
    },
    {
      type: "lore",
      platform: "youtube",
      image: "",
      text: `${formJson.name}: ${formJson.slogan}` 
    },
  ])

  localStorage.setItem("data", JSON.stringify(data))
}

export function getTabs() {
  return ["company", "artists", "shop"]
}

export function getSubTabs(tab) {
  const data = JSON.parse(localStorage.getItem("data"))

  const subtabs = [
    ["trainees", "others"],
    Object.keys(data.assets.artists),
    ["trainees", "artists", "employees"]
  ]
  return subtabs[tab]
}

function rand(mi, ma, offset) {
  const min = mi + (offset >= 0 ? offset : 0)
  const max = ma + (offset <= 0 ? offset : 0)
  const x = Math.random()
  let num = (1 - (2*x-1)**2) ** (1/2)
  if (x < 0.5) {
    num = num / 2
  }
  num = 1 - num / 2
  return min + (max - min) * (num ** 2)
}

export function generateName() {
  const language = (["korean", "korean", "japanese", "chinese", "english"])[Math.floor(Math.random() * (Object.keys(names).length) + 1)]
  const gender = ["male", "female"][Math.floor(Math.random() * 2)]
  const surname = names[language].surnames[Math.floor(Math.random() * names[language].surnames.length)]
  const nameLanguage = [language, "english"][Math.floor(Math.random() * 4/3)]
  const name = names[nameLanguage][gender][Math.floor(Math.random() * names[nameLanguage][gender].length)]
  return [nameLanguage === "english" ? `${name} ${surname}` : `${surname} ${name}`, gender]
}

function traineeGacha(data, offset) {
  const [name, gender] = generateName()
  return {
	  "name": name,
	  "fans": 0,
	  "gender": gender,
	  "trainingStart": data.profile.progress,
	  "skills": {
		  "idol": {
			  "vocals": rand(0, 100, offset+rand(-25, 25, 0)),
			  "rap": rand(0, 100, offset+rand(-25, 25, 0)),
			  "dance": rand(0, 100, offset+rand(-25, 25, 0)),
			  "stage presence": rand(0, 100, offset+rand(-25, 25, 0)),
			  "passion": rand(0, 100, offset+rand(-25, 25, 0)),
		  },
		  "creative": {
			  "lyric writing": rand(0, 100, offset+rand(-25, 25, 0)),
			  "composing": rand(0, 100, offset+rand(-25, 25, 0)),
			  "arranging": rand(0, 100, offset+rand(-25, 25, 0)),
			  "costume design": rand(0, 100, offset+rand(-25, 25, 0))
		  }
	  },
	  "fans": 0
	}
}

export function buyUpgrade(type, num) {
  let data = JSON.parse(localStorage.getItem("data"))
  let upgrade = ""
  let gain = 0

  switch(type) {
    case "trainees":
      data.assets.trainees[Object.keys(data.assets.trainees).length] = traineeGacha(data, (num-2)*25)
      gain = 25 ** (num + 1) * 1000
      upgrade = `new trainee from ${upgradeLines[type][num]}`
      break
    case "hiring":
      const employees = data.assets.others
      gain = 25 ** 3
      employees[Math.floor(Math.random() * employees.length)].score++
      data.assets.others = employees
      upgrade = "random employee upgrade"
  }
  data.resources.money -= gain

  data = newInfo(data, [
    {
      type: "money",
      message: upgrade,
      gain: -gain
    }
  ])

  localStorage.setItem("data", JSON.stringify(data))
}

function findEmployee(job) {
  let data = JSON.parse(localStorage.getItem("data"))

  for (let e in data.assets.others) {
    if (e.job === job) {
      return e
    }
  }

  return null
}

function train(t, items) {
  for (let c in t.skills) {
    for (let s in t.skills[c]) {
      if (items.includes(s)) {
        let gain = 1
        const trainer = findEmployee(s)
        if (trainer) {
          gain = (25/24) ** trainer.score
        }
        t.skills[c][s] *= 1 + rand(-gain, gain*3, 0) / 24
        t.skills[c][s] = t.skills[c][s] >= 100 ? 100 : t.skills[c][s]
      }
    }
  }
  return t
}

function monthlyEvaluation(data, items) {
  for (let tr in data.assets.trainees) {
    let t = data.assets.trainees[tr] 
    t = train(t, items)
    data.assets.trainees[tr] = t
  }

  for (let group in data.assets.artists) {
    for (let member in data.assets.artists[group].members) {
      data.assets.artists[group].members[member] = train(data.assets.artists[group].members[member], items)
    } 
  }

  return data
}

function monthlySalary() {
  let data = JSON.parse(localStorage.getItem("data"))

  let totalFees = 0
  let fees = 0
  let items = []
  
  let noTrainees = Object.keys(data.assets.trainees).length
  for (let a in data.assets.artists) {
    noTrainees += Object.keys(data.assets.artists[a].members).length * 2
  }

  for (let e in data.assets.others) {
    fees = data.assets.others[e].contract * noTrainees 
    if (data.resources.money >= fees) {
      data.resources.money -= fees
      totalFees += fees
      items.push(data.assets.others[e].job)
    } 
  }  
  
  data = newInfo(data, [
    {
      type: "money",
      message: "paying the trainers!", 
      gain: -totalFees
    }
  ])

  localStorage.setItem("data", JSON.stringify(data))

  return [data, items]
}

function weeklyContent(data) {
  for (let group in data.assets.artists) {
    const tweets = Math.ceil(Math.log(Object.keys(data.assets.artists[group].members).length + 1) / Math.log(4))
    const members = Object.values(data.assets.artists[group].members)
    const fandom = data.assets.artists[group].fandom 

    if (Object.keys(data.assets.artists[group].members).length) {
      console.log(group, datify(data.profile.progress))
      const posts = [
        ...[...Array(tweets).keys()].map(() => {
          const member = members[Math.floor(Math.random() * members.length)]
          return {
            type: "casual",
            platform: "twitter",
            text: SNSLines(group, member.stagename, fandom),
            "for": [member.stagename]
          }
        }),
        {
          type: "content",
          platform: "youtube",
          text: `${group}: signal weekly ${datify(data.profile.progress)}`
        },
        {
          type: "content",
          platform: "youtube",
          text: `${group}: sssignal ${datify(data.profile.progress)}`
        },
      ]
      console.log("posts", posts)
      data = postSNS(data, group, posts)
    }
  }

  return data
}

function totalFans(group) {
  const data = JSON.parse(localStorage.getItem("data"))
  const members = Object.values(data.assets.artists[group].members)
  let total = data.assets.artists[group].fans
  //console.log(total)
  for (let member in members) {
    total += members[member].fans
    //console.log(members[member].fans, total)
  }
  return total
}

function addStats(sns, base) {
  sns.stats = {
    likes: base / rand(5, 6, 0),
    views: base * rand(1, 100, 0),
    comments: base ** (2/5)
  }

  if (sns.platform === "twitter") {
    sns.stats = Object.assign({}, sns.stats, {
      reposts: base / rand(10, 11, 0),
      quotes: base / rand(19, 20, 0),
      bookmarks: base ** (1/2)
    })
  } else {
    for (let s in sns) {
      sns[s] *= 2
    }
  }

  for (let stat in sns.stats) {
    sns.stats[stat] = Math.floor(sns.stats[stat])
  }

  return sns
}

export function SNSEngagements(data) {
  let companyFans = 0
  for (let group in data.assets.artists) {
    companyFans += totalFans(group)
  }

  let min = 0
  let max = 0 
  let base = 0

  let groupFor = ""
  let groupObj = {}
  
  for (let sns in data.sns) {
    if (sns.date === data.profile.progress) {
      min = Math.floor(companyFans * 0.1)
      min = min < 1 ? 1 : min
      max = Math.floor(companyFans * 10)
      console.log("company", min, max)
      base = rand(min, max, 0) * (data.sns[sns].boost ? data.sns[sns].boost : 1)

      data.sns[sns] = addStats(data.sns[sns], base)

      if (data.sns[sns]["for"]) {
        for (let f in data.sns[sns]["for"]) {
          groupFor = data.sns[sns]["for"][f]
          data.assets.artists[groupFor].fans += Math.ceil(base ** rand(0.4, 0.5, 0))
        }
      }
    }
  }

  for (let group in data.assets.artists) {
    groupObj = data.assets.artists[group]
    for (let sns in groupObj.sns) {
      if (groupObj.sns[sns].date === data.profile.progress) {
        console.log("scanning", groupObj.sns[sns].text)
        console.log(totalFans(group))
        min = Math.floor(totalFans(group) * 0.1)
        min = min < 1 ? 1 : min
        max = Math.floor(totalFans(group) * 10)
        console.log(group, totalFans(group), min, max, base)
        base = rand(min, max, 0) * (groupObj.sns[sns].boost ? groupObj.sns[sns].boost : 1)

        groupObj.sns[sns] = addStats(groupObj.sns[sns], base)

        if (groupObj.sns[sns]["for"]) {
          for (let f in groupObj.sns[sns]["for"]) {
            groupFor = groupObj.sns[sns]["for"][f]
            groupObj.members[groupFor].fans += Math.ceil(base ** rand(0.4, 0.5, 0))
          }
        }
        groupObj.fans += Math.ceil(base ** rand(0.2, 0.25, 0))
      }
    }
    data.assets.artists[group] = groupObj
  }

  return data
}

export function incrementDate(times = 1) {
  let data = JSON.parse(localStorage.getItem("data"))
  let items = []
  let [y, m, w] = data.profile.progress

  for (let i = 0; i < 1; i++) {
    w++
    if (w > 4) {
      [data, items] = monthlySalary()
      data = monthlyEvaluation(data, items)
      console.log(data);
      [y, m, w] = fixDate([y, m, w])
    }
  }

  data = weeklyContent(data)
  data = SNSEngagements(data) 

  data.profile.progress = [y, m, w]
  localStorage.setItem("data", JSON.stringify(data))
}

export function fixDate(date) {
  while (date[2] < 1) {
    date[2] += 4
    date[1] --
  }
  const monthgain = Math.floor((date[2] - 1) / 4)
  date[1] += monthgain
  date[2] -= monthgain * 4

  while (date[1] < 1) {
    date[1] += 12
    date[0] --
  }
  const yeargain = Math.floor((date[1] - 1) / 12)
  date[0] += yeargain 
  date[1] -= yeargain * 12

  return date
}

export function sortDates(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) {
      return true
    } else if (a[i] < b[i]) {
      return false
    }
  }
  return false
}

export function postSNS(data, artist = "", posts, date = data.profile.progress) {
  for (let p in posts) {
    console.log("post", p, posts[p])
    posts[p] = ({
      ...posts[p],
      userid: artist ? `@${artist}_official` : `@${data.profile.name}_official`,
      date: date,
      stats: {
		    likes: 0,
		    reposts: 0,
		    quotes: 0,
		    views: 0,
		    bookmarks: 0,
		    comments: 0
	    }
    })
  }

  if (!artist) {
    for (let post in posts) {
      data.sns.push(posts[post])
    }
  } else if (Object.keys(data.assets.artists).includes(artist)) {
    for (let post in posts) {
      data.assets.artists[artist].sns.push(posts[post])
    }
  } else if (Object.keys(data.assets.artists[artist[0]].members).includes(artist[1])) {
    for (let post in posts) {
      data.assets.artists[artist[0]].members[artist[1]].sns.push(posts[post])
    }
  }

  return data
}

export function renderSNS() {
  const data = JSON.parse(localStorage.getItem("data"))

  let sns = data.sns
  for (let artist in data.assets.artists) {
    sns = sns.concat(data.assets.artists[artist].sns)
  }

  sns.sort((a, b) => {return sortDates(a.date, b.date) ? -1 : 1})
 
  return (
    <div>
      {
        sns.map((p) => {
          return (
            <SNS data={p} />
          )
        })
      }
    </div>
  )
}

export function newInfo(data, info) {
  for (let i in info) {
    info[i].date = info[i].date ? info[i].date : data.profile.progress 
    info[i].id = Object.keys(data.info).length
    data.info.unshift(info[i])
  }
  return data
}

export function renderInfo() {
  const data = JSON.parse(localStorage.getItem("data"))

  data.info.sort((a, b) => a.id > b.id ? -1 : 1) 

  return (
    <div>
      {
        data.info.map((i) => {
          if (i.date <= data.profile.progress) {
            switch (i.type) {
              case "money":
                return <h5 className="info">
                  <span style={{color: "#bbb"}}>{datify(i.date)}: </span>
                  {i.message}
                  <span style={{color: i.color ? i.color : (i.gain >= 0 ? "#0f0" : "#f00")}}> {i.gain >= 0 ? "+" : ""}{format(i.gain)}₩</span>
                </h5>
              case "alert":
                return <h5 className="info">
                  <span style={{color: "#bbb"}}>{datify(i.date)}: </span>
                  <span style={{color: i.color ? i.color : ["#0f0", "#ff0", "#f00"][i.urgency]}}>{i.message}</span>
                </h5>            
            }
          }
        })
      }
    </div>
  )
}
